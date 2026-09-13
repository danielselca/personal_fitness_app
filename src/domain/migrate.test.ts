import { describe, expect, it } from 'vitest'
import { migrateAppData } from './migrate.ts'
import { createSeedData, SEED_TEMPLATE_ID, STANDARD_TEMPLATE_ORDER } from './seed.ts'
import { SCHEMA_VERSION, type Exercise } from './types.ts'

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
    expect(out.exercises.find((e) => e.id === 'ex-bear-hug')!.noWeight).toBeUndefined() // Schema 4
  })

  it('Schema 3 → 4: Bear hug mit Gewicht, alte Hinweise bereinigt, Seed-Vorlage neu geordnet und umbenannt', () => {
    const d = v1()
    d.schemaVersion = 3
    d.exercises = (d.exercises as Exercise[]).map((e) => {
      if (e.id === 'ex-bear-hug') return { ...e, noWeight: true }
      if (e.id === 'ex-lat-zug') return { ...e, hint: 'Zuordnung zu Fit7.11 „Latzug am Kabel“ (#28) vermutet.' }
      if (e.id === 'ex-schraegbank-kurzhantel') return { ...e, hint: 'Zuordnung zu Fit7.11 „Bankdrücken schräg Kurzhantel“ vermutet. Gewicht vermutlich pro Hantel.' }
      if (e.id === 'ex-kreuzheben') return { ...e, hint: 'Eigener Hinweis bleibt' }
      return e
    })
    d.templates = [{ id: SEED_TEMPLATE_ID, name: 'Oberkörper Fokus Schulter', entries: [{ exerciseId: 'ex-lat-zug', sets: 4 }], createdAt: 'x', updatedAt: 'x' }, { id: 'tpl-eigene', name: 'Eigene', entries: [{ exerciseId: 'ex-rudern', sets: 2 }], createdAt: 'x', updatedAt: 'x' }]
    const out = migrateAppData(d)
    const by = (id: string) => out.exercises.find((e) => e.id === id)!
    expect(by('ex-bear-hug').noWeight).toBeUndefined()
    expect(by('ex-lat-zug').hint).toBeUndefined()
    expect(by('ex-schraegbank-kurzhantel').hint).toBe('Gewicht pro Hantel')
    expect(by('ex-kreuzheben').hint).toBe('Eigener Hinweis bleibt')
    const seedTpl = out.templates.find((t) => t.id === SEED_TEMPLATE_ID)!
    expect(seedTpl.name).toBe('Oberkörper')
    expect(seedTpl.entries.map((e) => e.exerciseId)).toEqual(STANDARD_TEMPLATE_ORDER)
    expect(out.templates.find((t) => t.id === 'tpl-eigene')!.entries).toEqual([{ exerciseId: 'ex-rudern', sets: 2 }])
  })

  it('Schema 3 → 4 behält einen vom Nutzer vergebenen Vorlagennamen', () => {
    const d = v1()
    d.schemaVersion = 3
    d.templates = [{ id: SEED_TEMPLATE_ID, name: 'Mein Plan', entries: [], createdAt: 'x', updatedAt: 'x' }]
    expect(migrateAppData(d).templates[0].name).toBe('Mein Plan')
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
