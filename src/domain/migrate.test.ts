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

  it('Schema 4 → 5: Aufdehnen seitlich bekommt 2 × 10 als Vorgabe, Seed-Vorlage 2 Sätze', () => {
    const d = v1()
    d.schemaVersion = 4
    d.exercises = (d.exercises as Exercise[]).map((e) => (e.id === 'ex-aufdehnen-seitlich' ? { ...e, planTarget: undefined } : e))
    d.templates = [{ id: SEED_TEMPLATE_ID, name: 'Oberkörper', entries: [{ exerciseId: 'ex-aufdehnen-seitlich', sets: 3 }, { exerciseId: 'ex-lat-zug', sets: 4 }], createdAt: 'x', updatedAt: 'x' }]
    const out = migrateAppData(d)
    expect(out.exercises.find((e) => e.id === 'ex-aufdehnen-seitlich')!.planTarget).toEqual({ sets: 2, reps: 10, weightKg: null, source: 'eigene Vorgabe' })
    expect(out.templates[0].entries).toEqual([{ exerciseId: 'ex-aufdehnen-seitlich', sets: 2 }, { exerciseId: 'ex-lat-zug', sets: 4 }])
  })

  it('Schema 4 → 5 überschreibt eine vorhandene eigene Vorgabe nicht', () => {
    const d = v1()
    d.schemaVersion = 4
    d.exercises = (d.exercises as Exercise[]).map((e) => (e.id === 'ex-aufdehnen-seitlich' ? { ...e, planTarget: { sets: 4, reps: 8, weightKg: null, source: 'eigene Vorgabe' } } : e))
    const out = migrateAppData(d)
    expect(out.exercises.find((e) => e.id === 'ex-aufdehnen-seitlich')!.planTarget).toMatchObject({ sets: 4, reps: 8 })
  })

  it('Schema 5 → 6: Serratusstütz und Stütz auf Step werden Halteübungen 4 × 60 s / 60 s Pause', () => {
    const d = v1()
    d.schemaVersion = 5
    d.exercises = (d.exercises as Exercise[]).map((e) => {
      if (e.id === 'ex-serratusstuetz') return { ...e, mode: undefined, holdSec: undefined, defaultRestSec: undefined, planTarget: undefined }
      if (e.id === 'ex-stuetz-auf-step') return { ...e, mode: 'reps', holdSec: undefined, planTarget: undefined } // vom Nutzer ausdrücklich gesetzt
      return e
    })
    d.templates = [{ id: SEED_TEMPLATE_ID, name: 'Oberkörper', entries: [{ exerciseId: 'ex-serratusstuetz', sets: 3 }, { exerciseId: 'ex-stuetz-auf-step', sets: 2 }], createdAt: 'x', updatedAt: 'x' }]
    const out = migrateAppData(d)
    const ser = out.exercises.find((e) => e.id === 'ex-serratusstuetz')!
    expect(ser).toMatchObject({ mode: 'hold', holdSec: 60, defaultRestSec: 60 })
    expect(ser.planTarget).toEqual({ sets: 4, reps: 60, weightKg: null, source: 'eigene Vorgabe' })
    expect(out.exercises.find((e) => e.id === 'ex-stuetz-auf-step')!.mode).toBe('reps')
    expect(out.templates[0].entries).toEqual([{ exerciseId: 'ex-serratusstuetz', sets: 4 }, { exerciseId: 'ex-stuetz-auf-step', sets: 2 }])
  })

  it('Schema 6 → 7: Kopfheben wird Halteübung 10 × 10 s, Name gekürzt, alter Name als Alias', () => {
    const d = v1()
    d.schemaVersion = 6
    d.exercises = (d.exercises as Exercise[]).map((e) =>
      e.id === 'ex-kopfheben' ? { ...e, name: '10x10s Kopfheben 1 cm Doppelkinn', aliases: [], hint: '10 × 10 s halten, als 10 Wdh. erfassen.', mode: undefined, holdSec: undefined, defaultRestSec: undefined, planTarget: undefined } : e,
    )
    const out = migrateAppData(d)
    const k = out.exercises.find((e) => e.id === 'ex-kopfheben')!
    expect(k).toMatchObject({ name: 'Kopfheben (Doppelkinn)', mode: 'hold', holdSec: 10, defaultRestSec: 10, hint: 'Kopf nur 1 cm anheben' })
    expect(k.aliases).toContain('10x10s Kopfheben 1 cm Doppelkinn')
    expect(k.planTarget).toMatchObject({ sets: 10, reps: 10 })
  })

  it('Schema 6 → 7 lässt einen vom Nutzer umbenannten oder umgestellten Kopfheben-Eintrag in Ruhe', () => {
    const d = v1()
    d.schemaVersion = 6
    d.exercises = (d.exercises as Exercise[]).map((e) => (e.id === 'ex-kopfheben' ? { ...e, name: 'Nacken', mode: 'reps', holdSec: undefined } : e))
    const k = migrateAppData(d).exercises.find((e) => e.id === 'ex-kopfheben')!
    expect(k).toMatchObject({ name: 'Nacken', mode: 'reps' })
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

describe('Migration Schema 7 → 8 (Übungsbibliothek)', () => {
  const AT = '2026-09-01T00:00:00.000Z'
  const v7 = (): Record<string, unknown> => {
    const d = createSeedData(AT) as unknown as Record<string, unknown>
    const exercises = (d.exercises as Exercise[]).map(({ libraryId: _l, equipment: _e, muscles: _m, category: _c, pattern: _p, ...rest }) => rest)
    return { ...d, schemaVersion: 7, exercises }
  }

  it('migrierter Seed entspricht einem frisch angelegten', () => {
    expect(migrateAppData(v7())).toEqual(createSeedData(AT))
  })

  it('verknüpft eindeutige Studio-Übungen, ordnet Physio-Übungen zu, lässt unklare offen', () => {
    const out = migrateAppData(v7())
    const ex = (id: string) => out.exercises.find((e) => e.id === id)!
    expect(ex('ex-lat-zug').libraryId).toBe('latzug-breit')
    expect(ex('ex-rudern').libraryId).toBe('rudern-kabel-sitzend')
    expect(ex('ex-serratusstuetz')).toMatchObject({ category: 'physio', equipment: 'koerpergewicht', muscles: { primary: ['serratus'], secondary: [] } })
    for (const id of ['ex-adduktion', 'ex-ueberzuege', 'ex-incline-frontraise', 'ex-kreuzheben']) {
      expect(ex(id).libraryId).toBeUndefined()
      expect(ex(id).category).toBeUndefined()
    }
  })

  it('überschreibt keine eigenen Werte, setzt kein updatedAt und lässt Trainings unberührt', () => {
    const d = v7()
    d.exercises = (d.exercises as Exercise[]).map((e) =>
      e.id === 'ex-lat-zug' ? { ...e, libraryId: 'latzug-eng', updatedAt: '2026-09-10T00:00:00.000Z' } : e.id === 'ex-kopfheben' ? { ...e, category: 'kraft' as const } : e,
    )
    const workout = { id: 'wo-1', startedAt: AT, finishedAt: AT, status: 'done', updatedAt: AT, entries: [{ exerciseId: 'ex-lat-zug', sets: [{ id: 's1', weightKg: 45, reps: 10, done: true }] }] }
    d.workouts = [workout]
    const out = migrateAppData(d)
    const lat = out.exercises.find((e) => e.id === 'ex-lat-zug')!
    expect(lat.libraryId).toBe('latzug-eng')
    expect(lat.updatedAt).toBe('2026-09-10T00:00:00.000Z')
    expect(out.exercises.find((e) => e.id === 'ex-kopfheben')!.category).toBe('kraft')
    expect(out.exercises.find((e) => e.id === 'ex-rudern')!.updatedAt).toBe(AT)
    expect(out.workouts).toEqual([workout])
  })
})

describe('Migration Schema 8 → 9 (Programme, Schonung)', () => {
  const AT = '2026-09-01T00:00:00.000Z'
  const v8 = (): Record<string, unknown> => {
    const { programs: _p, restrictions: _r, ...d } = createSeedData(AT) as unknown as Record<string, unknown>
    const { weeklyGoal: _w, ...settings } = d.settings as Record<string, unknown>
    return { ...d, schemaVersion: 8, settings }
  }

  it('migrierter Seed entspricht einem frisch angelegten: leere Listen, Wochenziel 3, kein aktives Programm', () => {
    const out = migrateAppData(v8())
    expect(out).toEqual(createSeedData(AT))
    expect(out.programs).toEqual([])
    expect(out.restrictions).toEqual([])
    expect(out.settings.weeklyGoal).toBe(3)
    expect(out.settings.activeProgramId).toBeUndefined()
  })

  it('lässt Übungen, Vorlagen und Trainings unverändert', () => {
    const d = v8()
    const workout = { id: 'wo-1', startedAt: AT, finishedAt: AT, status: 'done', templateId: SEED_TEMPLATE_ID, updatedAt: AT, entries: [{ exerciseId: 'ex-lat-zug', sets: [{ id: 's1', weightKg: 45, reps: 10, done: true }] }] }
    d.workouts = [workout]
    const out = migrateAppData(structuredClone(d))
    expect(out.workouts).toEqual([workout])
    expect(out.exercises).toEqual(d.exercises)
    expect(out.templates).toEqual(d.templates)
  })
})

describe('Migration Schema 9 → 10 (Coach I)', () => {
  const AT = '2026-09-01T00:00:00.000Z'
  const v9 = (): Record<string, unknown> => {
    const { bodyLog: _b, ...d } = createSeedData(AT) as unknown as Record<string, unknown>
    const { coachProgression: _c, ...settings } = d.settings as Record<string, unknown>
    return { ...d, schemaVersion: 9, settings }
  }

  it('migrierter Seed entspricht einem frisch angelegten: Körpergewicht leer, Coach an', () => {
    const out = migrateAppData(v9())
    expect(out).toEqual(createSeedData(AT))
    expect(out.bodyLog).toEqual([])
    expect(out.settings.coachProgression).toBe(true)
  })

  it('Trainings behalten ihre Werte, unbekannte Bewertungen fallen beim Import weg', () => {
    const d = v9()
    const workout = { id: 'wo-1', startedAt: AT, finishedAt: AT, status: 'done', updatedAt: AT, entries: [{ exerciseId: 'ex-lat-zug', sets: [{ id: 's1', weightKg: 45, reps: 10, done: true }] }] }
    d.workouts = [workout]
    expect(migrateAppData(structuredClone(d)).workouts).toEqual([workout])
  })
})
