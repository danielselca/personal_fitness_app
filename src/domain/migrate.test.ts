import { describe, expect, it } from 'vitest'
import { migrateAppData } from './migrate.ts'
import { createSeedData } from './seed.ts'
import { SCHEMA_VERSION } from './types.ts'

describe('Migration Schema 1 → 2 (ohne Gewicht)', () => {
  const v1 = (): Record<string, unknown> => {
    const d = createSeedData('2026-09-01T00:00:00.000Z') as unknown as Record<string, unknown>
    const exercises = (d.exercises as { noWeight?: boolean }[]).map(({ noWeight: _n, ...rest }) => rest)
    return { ...d, schemaVersion: 1, exercises }
  }

  it('kennzeichnet die Physio-Übungen des Seeds als „ohne Gewicht“, Geräteübungen nicht', () => {
    const out = migrateAppData(v1())
    expect(out.schemaVersion).toBe(SCHEMA_VERSION)
    const by = (id: string) => out.exercises.find((e) => e.id === id)!
    expect(by('ex-serratusstuetz').noWeight).toBe(true)
    expect(by('ex-aufdehnen-seitlich').noWeight).toBe(true)
    expect(by('ex-uppercut-theraband').noWeight).toBe(true)
    expect(by('ex-lat-zug').noWeight).toBeUndefined()
    expect(by('ex-kreuzheben').noWeight).toBeUndefined()
    expect(by('ex-tiefes-v').noWeight).toBeUndefined() // wird mit Gewicht trainiert
  })

  it('Schema 2 → 3 nimmt das Kennzeichen bei „Tiefes V“ zurück', () => {
    const d = v1()
    d.schemaVersion = 2
    d.exercises = (d.exercises as { id: string }[]).map((e) => (e.id === 'ex-tiefes-v' || e.id === 'ex-bear-hug' ? { ...e, noWeight: true } : e))
    const out = migrateAppData(d)
    expect(out.exercises.find((e) => e.id === 'ex-tiefes-v')!.noWeight).toBeUndefined()
    expect(out.exercises.find((e) => e.id === 'ex-bear-hug')!.noWeight).toBe(true)
  })

  it('lässt Übungen unangetastet, bei denen schon ein Gewicht abgehakt wurde', () => {
    const d = v1()
    d.workouts = [{
      id: 'w1', startedAt: '2026-09-02T10:00:00Z', finishedAt: '2026-09-02T11:00:00Z', status: 'done', updatedAt: '2026-09-02T11:00:00Z',
      entries: [{ exerciseId: 'ex-bear-hug', sets: [{ id: 's1', weightKg: 5, reps: 10, done: true }] }],
    }]
    const out = migrateAppData(d)
    expect(out.exercises.find((e) => e.id === 'ex-bear-hug')!.noWeight).toBeUndefined()
    expect(out.exercises.find((e) => e.id === 'ex-serratusstuetz')!.noWeight).toBe(true)
  })

  it('überschreibt ein explizit gesetztes Kennzeichen nicht', () => {
    const d = v1()
    d.exercises = (d.exercises as { id: string }[]).map((e) => (e.id === 'ex-bear-hug' ? { ...e, noWeight: false } : e))
    const out = migrateAppData(d)
    expect(out.exercises.find((e) => e.id === 'ex-bear-hug')!.noWeight).toBe(false)
  })
})
