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
    expect(w.entries[0].sets).toHaveLength(2)
    expect(w.entries[0].sets[0]).toMatchObject({ weightKg: null, reps: 10, done: false })
    const lat = w.entries[11]
    expect(lat.exerciseId).toBe('ex-lat-zug')
    expect(lat.sets).toHaveLength(4)
    expect(lat.sets[0]).toMatchObject({ weightKg: 45, reps: 10, done: false })
    expect(s.startWorkout()).toBe(store.getState().activeWorkout()) // nur eines gleichzeitig
  })

  it('Vorlage und „Letztes wiederholen“ lassen archivierte Übungen weg', async () => {
    const { store } = await freshStore()
    const s = store.getState()
    s.setExerciseArchived('ex-lat-zug', true)
    const w = s.startWorkout({ templateId: store.getState().data.templates[0].id })
    expect(w.entries).toHaveLength(11)
    expect(w.entries.some((e) => e.exerciseId === 'ex-lat-zug')).toBe(false)
    s.discardWorkout()

    // letztes Training enthielt Rudern und Lat-Zug; Lat-Zug ist inzwischen archiviert
    s.setExerciseArchived('ex-lat-zug', false)
    s.startWorkout({ exerciseIds: ['ex-rudern', 'ex-lat-zug'] })
    for (const e of store.getState().activeWorkout()!.entries) s.setSetDone(e.exerciseId, e.sets[0].id, true)
    s.finishWorkout()
    s.setExerciseArchived('ex-lat-zug', true)
    const again = s.startWorkout({ repeatLast: true })
    expect(again.entries.map((e) => e.exerciseId)).toEqual(['ex-rudern'])
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

describe('Store: Übungen aus der Bibliothek (Schritt 17)', () => {
  it('verwendet eine verknüpfte eigene Übung statt ein Duplikat anzulegen', async () => {
    const { store } = await freshStore()
    const r = store.getState().adoptFromLibrary('latzug-breit')
    expect(r).toMatchObject({ status: 'existing', exercise: { id: 'ex-lat-zug' } })
    expect(store.getState().data.exercises).toHaveLength(21)
  })

  it('legt neu an mit fester ID und übernimmt das Verhalten; ein zweites Mal liefert dieselbe Übung', async () => {
    const { store } = await freshStore()
    const r = store.getState().adoptFromLibrary('unterarmstuetz')
    expect(r).toMatchObject({ status: 'created', exercise: { id: 'ex-lib-unterarmstuetz', name: 'Unterarmstütz', libraryId: 'unterarmstuetz', mode: 'hold', holdSec: 30, noWeight: true, defaultRestSec: 60 } })
    expect(store.getState().adoptFromLibrary('unterarmstuetz')).toMatchObject({ status: 'existing', exercise: { id: 'ex-lib-unterarmstuetz' } })
    expect(store.getState().data.exercises).toHaveLength(22)
  })

  it('holt eine archivierte übernommene Übung zurück', async () => {
    const { store } = await freshStore()
    store.getState().adoptFromLibrary('beinpresse')
    store.getState().setExerciseArchived('ex-lib-beinpresse', true)
    const r = store.getState().adoptFromLibrary('beinpresse')
    expect(r.status).toBe('existing')
    expect(store.getState().data.exercises.find((e) => e.id === 'ex-lib-beinpresse')!.archived).toBe(false)
  })

  it('gleicher Name: fragt nach, verknüpft auf Wunsch oder legt mit Zusatz neu an', async () => {
    const { store } = await freshStore()
    const own = store.getState().addExercise({ name: 'Beinpresse' })
    if (!own.ok) throw new Error(own.error)
    expect(store.getState().adoptFromLibrary('beinpresse')).toMatchObject({ status: 'name-match', exercise: { id: own.exercise.id } })
    expect(store.getState().adoptFromLibrary('beinpresse', { linkTo: own.exercise.id })).toMatchObject({ status: 'linked', exercise: { libraryId: 'beinpresse' } })
    store.getState().linkExercise(own.exercise.id, null)
    expect(store.getState().data.exercises.find((e) => e.id === own.exercise.id)!.libraryId).toBeUndefined()
    const created = store.getState().adoptFromLibrary('beinpresse', { createNew: true })
    expect(created).toMatchObject({ status: 'created', exercise: { name: 'Beinpresse (Bibliothek)' } })
  })
})

describe('Store: Programme (Schritt 18)', () => {
  it('übernehmen aktiviert das Programm; Start eines Tages kopiert Satzzahl, Zielbereich und Pause', async () => {
    const { store } = await freshStore()
    const p = store.getState().installProgram('builtin-ganzkoerper', { goal: 'muskelaufbau', physioBlock: false })!
    expect(store.getState().data.settings.activeProgramId).toBe(p.id)
    const dayA = p.days[0]
    // Pause in der Vorlage setzen
    const t = store.getState().data.templates.find((x) => x.id === dayA.templateId)!
    store.getState().updateTemplate(t.id, { entries: t.entries.map((e) => (e.exerciseId === 'ex-lat-zug' ? { ...e, restSec: 120 } : e)) })
    const w = store.getState().startWorkout({ programId: p.id, dayId: dayA.id })
    expect(w).toMatchObject({ programId: p.id, programDayId: dayA.id, templateId: dayA.templateId })
    const lat = w.entries.find((e) => e.exerciseId === 'ex-lat-zug')!
    expect(lat).toMatchObject({ repMin: 8, repMax: 12, restSec: 120 })
    expect(lat.sets).toHaveLength(3)
    // Vorlage später ändern → laufendes/abgeschlossenes Training bleibt
    store.getState().updateTemplate(t.id, { entries: [] })
    expect(store.getState().activeWorkout()!.entries.find((e) => e.exerciseId === 'ex-lat-zug')?.restSec).toBe(120)
  })

  it('Tage hinzufügen, umbenennen (auch die Vorlage), entfernen; duplizieren und löschen', async () => {
    const { store } = await freshStore()
    const s = () => store.getState()
    const p = s().createProgram('  Mein Plan ')
    expect(p.name).toBe('Mein Plan')
    const day = s().addProgramDay(p.id, '')!
    expect(day.name).toBe('Tag 1')
    const tpl = () => s().data.templates.find((t) => t.id === day.templateId)
    expect(tpl()).toMatchObject({ programId: p.id, entries: [] })
    s().updateProgram(p.id, { days: [{ ...day, name: 'Beine' }], sessionsPerWeek: 2 })
    expect(tpl()?.name).toBe('Beine')
    expect(s().data.programs[0].sessionsPerWeek).toBe(2)
    const copy = s().duplicateProgram(p.id)!
    expect(copy.days[0].templateId).not.toBe(day.templateId)
    s().removeProgramDay(p.id, day.id)
    expect(tpl()).toBeUndefined()
    expect(s().data.programs.find((x) => x.id === p.id)!.days).toEqual([])
    s().setActiveProgram(copy.id)
    s().deleteProgram(copy.id)
    expect(s().data.settings.activeProgramId).toBeUndefined()
    expect(s().data.templates.some((t) => t.programId === copy.id)).toBe(false)
  })

  it('Vorlage leer anlegen und duplizieren', async () => {
    const { store } = await freshStore()
    const t = store.getState().createTemplate('Beine zuhause')
    expect(t.entries).toEqual([])
    const c = store.getState().duplicateTemplate(t.id)!
    expect(c.name).toBe('Beine zuhause (Kopie)')
  })
})
