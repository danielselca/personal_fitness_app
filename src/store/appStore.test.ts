import { describe, expect, it } from 'vitest'
import { buildBackup } from '../domain/backup.ts'
import { createSeedData } from '../domain/seed.ts'
import { createAppStore } from './appStore.ts'
import { memoryStorage } from './persistence.ts'

async function freshStore() {
  const storage = memoryStorage()
  const store = createAppStore(storage)
  await store.getState().hydrate()
  return { store, storage }
}

describe('Store: Start und Persistenz (F6, AK11)', () => {
  it('seedet beim ersten Start und speichert', async () => {
    const { store, storage } = await freshStore()
    await store.getState().flush()
    expect(store.getState().data.exercises).toHaveLength(21)
    expect(storage.saves).toBeGreaterThan(0)
  })

  it('lädt gespeicherte Daten statt neu zu seeden', async () => {
    const seed = createSeedData('2026-01-01T00:00:00.000Z')
    seed.exercises = seed.exercises.slice(0, 3)
    const storage = memoryStorage(seed)
    const store = createAppStore(storage)
    await store.getState().hydrate()
    expect(store.getState().data.exercises).toHaveLength(3)
    expect(store.getState().data.meta.seededAt).toBe('2026-01-01T00:00:00.000Z')
  })

  it('aktives Training inkl. Eingaben und Timer überlebt ein Neuladen', async () => {
    const { store, storage } = await freshStore()
    const s = store.getState()
    const lat = s.data.exercises.find((e) => e.name === 'Lat-Zug')!
    s.startWorkout({ exerciseIds: [lat.id] })
    const setId = store.getState().activeWorkout()!.entries[0].sets[0].id
    s.updateSet(lat.id, setId, { weightKg: 47.5, reps: 9 })
    expect(s.setSetDone(lat.id, setId, true)).toBe(true)
    s.startTimer(90, lat.id)
    await store.getState().flush()

    const store2 = createAppStore(storage)
    await store2.getState().hydrate()
    const active = store2.getState().activeWorkout()!
    expect(active.entries[0].sets[0]).toMatchObject({ weightKg: 47.5, reps: 9, done: true })
    expect(store2.getState().data.timer?.durationSec).toBe(90)
  })
})

describe('Store: Übungen (F1, AK4)', () => {
  it('legt an, lehnt doppelte Namen ab, archiviert', async () => {
    const { store } = await freshStore()
    const s = store.getState()
    const r = s.addExercise({ name: '  Test  ' })
    expect(r.ok).toBe(true)
    expect(store.getState().data.exercises.find((e) => e.name === 'Test')).toBeTruthy()
    expect(s.addExercise({ name: 'lat-zug' })).toEqual({ ok: false, error: '„lat-zug“ gibt es schon.' })
    expect(s.addExercise({ name: '   ' }).ok).toBe(false)
    const id = (r as { ok: true; exercise: { id: string } }).exercise.id
    expect(s.updateExercise(id, { name: 'Test 2' }).ok).toBe(true)
    expect(s.updateExercise(id, { name: 'Rudern' }).ok).toBe(false)
    s.setExerciseArchived(id, true)
    expect(store.getState().data.exercises.find((e) => e.id === id)!.archived).toBe(true)
  })
})

describe('Store: Trainingsablauf (F2, F3, F7, AK5–AK7, AK9, AK10)', () => {
  it('Vorlage startet 12 Übungen in Standard-Reihenfolge mit Plan-Vorschlägen', async () => {
    const { store } = await freshStore()
    const s = store.getState()
    const w = s.startWorkout({ templateId: store.getState().data.templates[0].id })
    expect(w.entries).toHaveLength(12)
    expect(w.entries[0].exerciseId).toBe('ex-aufdehnen-seitlich')
    expect(w.entries[0].sets).toHaveLength(3)
    expect(w.entries[0].sets[0]).toMatchObject({ weightKg: null, reps: null, done: false })
    const lat = w.entries[11]
    expect(lat.exerciseId).toBe('ex-lat-zug')
    expect(lat.sets).toHaveLength(4)
    expect(lat.sets[0]).toMatchObject({ weightKg: 45, reps: 10, done: false })
    expect(s.startWorkout()).toBe(store.getState().activeWorkout()) // nur eines gleichzeitig
  })

  it('nur abgehakte Sätze zählen; Abschluss verwirft offene Sätze', async () => {
    const { store } = await freshStore()
    const s = store.getState()
    const lat = s.data.exercises.find((e) => e.name === 'Lat-Zug')!
    s.startWorkout({ exerciseIds: [lat.id] })
    const sets = store.getState().activeWorkout()!.entries[0].sets
    expect(s.setSetDone(lat.id, sets[0].id, true)).toBe(true)
    expect(s.setSetDone(lat.id, sets[1].id, true)).toBe(true)
    const finished = s.finishWorkout()!
    expect(finished.status).toBe('done')
    expect(finished.entries[0].sets).toHaveLength(2)
    expect(store.getState().activeWorkout()).toBeNull()
    expect(store.getState().data.meta.workoutsSinceBackup).toBe(1)
  })

  it('Satz ohne Wdh. kann nicht abgehakt werden', async () => {
    const { store } = await freshStore()
    const s = store.getState()
    const bear = s.data.exercises.find((e) => e.name === 'Bear hug')!
    s.startWorkout({ exerciseIds: [bear.id] })
    const set = store.getState().activeWorkout()!.entries[0].sets[0]
    expect(s.setSetDone(bear.id, set.id, true)).toBe(false)
    s.updateSet(bear.id, set.id, { reps: 12 })
    expect(s.setSetDone(bear.id, set.id, true)).toBe(true)
  })

  it('Satz hinzufügen übernimmt Vorwerte; löschen und wiederherstellen', async () => {
    const { store } = await freshStore()
    const s = store.getState()
    const lat = s.data.exercises.find((e) => e.name === 'Lat-Zug')!
    s.startWorkout({ exerciseIds: [lat.id] })
    const first = store.getState().activeWorkout()!.entries[0].sets[0]
    s.updateSet(lat.id, first.id, { weightKg: 50, reps: 8 })
    s.addSet(lat.id)
    let sets = store.getState().activeWorkout()!.entries[0].sets
    expect(sets).toHaveLength(5)
    expect(sets[4]).toMatchObject({ weightKg: 45, reps: 10 }) // Vorwerte des letzten Satzes (Satz 4)
    const removed = s.deleteSet(lat.id, sets[1].id)!
    expect(removed.index).toBe(1)
    expect(store.getState().activeWorkout()!.entries[0].sets).toHaveLength(4)
    s.restoreSet(lat.id, removed.set, removed.index)
    sets = store.getState().activeWorkout()!.entries[0].sets
    expect(sets[1].id).toBe(removed.set.id)
  })

  it('Übungen hinzufügen, umsortieren, entfernen', async () => {
    const { store } = await freshStore()
    const s = store.getState()
    const [a, b, c] = s.data.exercises.slice(0, 3)
    s.startWorkout({ exerciseIds: [a.id, b.id] })
    s.addExerciseToWorkout(c.id)
    s.addExerciseToWorkout(c.id) // kein Duplikat
    expect(store.getState().activeWorkout()!.entries.map((e) => e.exerciseId)).toEqual([a.id, b.id, c.id])
    s.moveWorkoutEntry(c.id, -1)
    expect(store.getState().activeWorkout()!.entries.map((e) => e.exerciseId)).toEqual([a.id, c.id, b.id])
    s.moveWorkoutEntry(a.id, -1) // am Anfang: keine Änderung
    expect(store.getState().activeWorkout()!.entries[0].exerciseId).toBe(a.id)
    s.removeExerciseFromWorkout(c.id)
    expect(store.getState().activeWorkout()!.entries).toHaveLength(2)
  })

  it('nächstes Training schlägt die Werte des letzten vor (AK6) und „Letztes Training wiederholen“', async () => {
    const { store } = await freshStore()
    const s = store.getState()
    const lat = s.data.exercises.find((e) => e.name === 'Lat-Zug')!
    s.startWorkout({ exerciseIds: [lat.id] })
    const sets = store.getState().activeWorkout()!.entries[0].sets
    s.updateSet(lat.id, sets[2].id, { weightKg: 47.5, reps: 8 })
    for (const st of sets.slice(0, 3)) s.setSetDone(lat.id, st.id, true)
    s.finishWorkout()
    const w2 = s.startWorkout({ repeatLast: true })
    expect(w2.entries).toHaveLength(1)
    expect(w2.entries[0].sets.map((x) => [x.weightKg, x.reps])).toEqual([[45, 10], [45, 10], [47.5, 8]])
  })
})

describe('Store: Timer (F9)', () => {
  it('Endzeitpunkt, +30 s, Neustart, Stopp', async () => {
    const { store } = await freshStore()
    const s = store.getState()
    s.startTimer(90)
    const t = store.getState().data.timer!
    expect(new Date(t.endsAt).getTime() - new Date(t.startedAt).getTime()).toBe(90_000)
    s.addTimerSeconds(30)
    const t2 = store.getState().data.timer!
    expect(t2.durationSec).toBe(120)
    expect(new Date(t2.endsAt).getTime() - new Date(t.endsAt).getTime()).toBeGreaterThanOrEqual(30_000 - 5)
    s.restartTimer()
    expect(store.getState().data.timer!.durationSec).toBe(120)
    s.stopTimer()
    expect(store.getState().data.timer).toBeNull()
  })
})

describe('Store: Sicherung (F15, AK27)', () => {
  it('zählt Trainings seit letzter Sicherung und setzt nach Export zurück', async () => {
    const { store } = await freshStore()
    const s = store.getState()
    const lat = s.data.exercises.find((e) => e.name === 'Lat-Zug')!
    for (let i = 0; i < 3; i++) {
      s.startWorkout({ exerciseIds: [lat.id] })
      const set = store.getState().activeWorkout()!.entries[0].sets[0]
      s.setSetDone(lat.id, set.id, true)
      s.finishWorkout()
    }
    expect(store.getState().data.meta.workoutsSinceBackup).toBe(3)
    const backup = buildBackup(store.getState().data, '0.1.0')
    expect(backup.workouts).toHaveLength(3)
    s.markBackupDone()
    expect(store.getState().data.meta.workoutsSinceBackup).toBe(0)
    expect(store.getState().data.meta.lastBackupAt).toBeTruthy()
  })
})
