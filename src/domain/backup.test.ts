import { describe, expect, it } from 'vitest'
import { applyImport, backupFileName, buildBackup, summarizeBackup, validateBackup } from './backup.ts'
import { createSeedData } from './seed.ts'
import { SCHEMA_VERSION, type Workout } from './types.ts'

const data = createSeedData('2026-09-01T00:00:00.000Z')
const lat = data.exercises.find((e) => e.name === 'Lat-Zug')!

function doneWorkout(id: string, at: string, weight: number): Workout {
  return {
    id, startedAt: at, finishedAt: at, status: 'done', updatedAt: at,
    entries: [{ exerciseId: lat.id, sets: [{ id: `${id}-s1`, weightKg: weight, reps: 10, done: true, doneAt: at }] }],
  }
}

describe('Export (F12, AK21)', () => {
  it('enthält alle Bereiche, Version und Datum im Dateinamen', () => {
    const b = buildBackup({ ...data, workouts: [doneWorkout('w1', '2026-09-02T10:00:00Z', 45)] }, '0.1.0', new Date(2026, 8, 10))
    expect(b.schemaVersion).toBe(SCHEMA_VERSION)
    expect(b.app).toBe('personal-fitness-app')
    expect(b.exercises).toHaveLength(21)
    expect(b.templates).toHaveLength(1)
    expect(b.workouts).toHaveLength(1)
    expect(b.settings.defaultRestSec).toBe(90)
    expect(backupFileName(new Date(2026, 8, 10))).toBe('fitness-backup-2026-09-10.json')
  })
})

describe('Import-Validierung (F13, AK22)', () => {
  it('lehnt Nicht-Objekte, fremdes JSON und neuere Schemata ab', () => {
    expect(validateBackup('text').ok).toBe(false)
    expect(validateBackup([1, 2]).ok).toBe(false)
    const foreign = validateBackup({ foo: 1 })
    expect(foreign.ok).toBe(false)
    if (!foreign.ok) expect(foreign.errors.join(' ')).toMatch(/nicht aus dieser App/)
    const newer = validateBackup({ app: 'personal-fitness-app', schemaVersion: 99, exercises: [], templates: [], workouts: [] })
    expect(newer.ok).toBe(false)
    if (!newer.ok) expect(newer.errors.join(' ')).toMatch(/neueren App-Version/)
  })

  it('lehnt kaputte Einträge mit verständlicher Meldung ab', () => {
    const b = buildBackup(data, '0.1.0')
    const broken = JSON.parse(JSON.stringify(b))
    broken.workouts = [{ id: 'x', startedAt: 'kein datum', status: 'weird', entries: [] }]
    const r = validateBackup(broken)
    expect(r.ok).toBe(false)
    if (!r.ok) {
      expect(r.errors.some((e) => e.includes('startedAt'))).toBe(true)
      expect(r.errors.some((e) => e.includes('status'))).toBe(true)
    }
  })

  it('akzeptiert einen echten Export unverändert (Roundtrip)', () => {
    const b = buildBackup({ ...data, workouts: [doneWorkout('w1', '2026-09-02T10:00:00Z', 45)] }, '0.1.0')
    const r = validateBackup(JSON.parse(JSON.stringify(b)))
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.backup.exercises).toEqual(b.exercises)
      expect(r.backup.workouts).toEqual(b.workouts)
      expect(summarizeBackup(r.backup)).toMatchObject({ exercises: 21, templates: 1, workouts: 1 })
    }
  })

  it('ergänzt fehlende optionale Felder', () => {
    const r = validateBackup({
      app: 'personal-fitness-app', schemaVersion: 1,
      exercises: [{ id: 'e1', name: 'Neu' }], templates: [],
      workouts: [{ id: 'w1', startedAt: '2026-09-02T10:00:00Z', finishedAt: '2026-09-02T11:00:00Z', status: 'done', entries: [{ exerciseId: 'e1', sets: [{ id: 's', done: true, reps: 5 }] }] }],
    })
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.backup.exercises[0]).toMatchObject({ aliases: [], archived: false })
      expect(r.backup.workouts[0].entries[0].sets[0]).toMatchObject({ weightKg: null, reps: 5 })
      expect(r.backup.settings.defaultRestSec).toBe(90)
    }
  })
})

describe('Import anwenden (F13, AK23, AK28)', () => {
  const local = { ...data, workouts: [doneWorkout('w-local', '2026-09-03T10:00:00Z', 45)] }

  it('Zusammenführen ergänzt nur Neues und verliert nichts', () => {
    const incoming = buildBackup({ ...data, workouts: [doneWorkout('w-other', '2026-09-05T10:00:00Z', 50)] }, '0.1.0')
    const r = applyImport(local, incoming, 'merge')
    expect(r.data.workouts.map((w) => w.id).sort()).toEqual(['w-local', 'w-other'])
    expect(r.added.workouts).toBe(1)
    expect(r.added.exercises).toBe(0)
    expect(r.data.exercises).toHaveLength(21)
  })

  it('bei gleicher ID gewinnt der neuere updatedAt', () => {
    const newer = { ...doneWorkout('w-local', '2026-09-03T10:00:00Z', 60), updatedAt: '2026-09-04T00:00:00Z' }
    const older = { ...doneWorkout('w-local', '2026-09-03T10:00:00Z', 30), updatedAt: '2026-09-01T00:00:00Z' }
    const r1 = applyImport(local, buildBackup({ ...data, workouts: [newer] }, '0.1.0'), 'merge')
    expect(r1.data.workouts[0].entries[0].sets[0].weightKg).toBe(60)
    expect(r1.updated.workouts).toBe(1)
    const r2 = applyImport(local, buildBackup({ ...data, workouts: [older] }, '0.1.0'), 'merge')
    expect(r2.data.workouts[0].entries[0].sets[0].weightKg).toBe(45)
  })

  it('Zusammenführen behält lokale Einstellungen und ein laufendes Training', () => {
    const active: Workout = { id: 'w-act', startedAt: '2026-09-10T10:00:00Z', status: 'active', updatedAt: '2026-09-10T10:00:00Z', entries: [] }
    const withActive = { ...local, workouts: [...local.workouts, active], settings: { ...local.settings, defaultRestSec: 120 } }
    const foreignActive: Workout = { ...active, id: 'w-act-2' }
    const r = applyImport(withActive, buildBackup({ ...data, workouts: [foreignActive], settings: { ...data.settings, defaultRestSec: 60 } }, '0.1.0'), 'merge')
    expect(r.skippedActiveWorkout).toBe(true)
    expect(r.data.workouts.filter((w) => w.status === 'active')).toHaveLength(1)
    expect(r.data.settings.defaultRestSec).toBe(120)
  })

  it('Ersetzen übernimmt die Sicherung vollständig (Gerätewechsel)', () => {
    const deviceA = { ...data, workouts: [doneWorkout('a1', '2026-09-02T10:00:00Z', 45), doneWorkout('a2', '2026-09-04T10:00:00Z', 47.5)] }
    const exported = JSON.parse(JSON.stringify(buildBackup(deviceA, '0.1.0')))
    const v = validateBackup(exported)
    expect(v.ok).toBe(true)
    if (!v.ok) return
    const deviceB = createSeedData('2026-09-09T00:00:00.000Z')
    const r = applyImport(deviceB, v.backup, 'replace')
    expect(r.data.workouts).toEqual(deviceA.workouts)
    expect(r.data.exercises).toEqual(deviceA.exercises)
    expect(r.data.timer).toBeNull()
  })
})
