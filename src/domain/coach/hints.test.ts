import { describe, expect, it } from 'vitest'
import { createSeedData } from '../seed.ts'
import type { AppData, Exercise, Restriction, Template, Workout, WorkoutEntry } from '../types.ts'
import { overallOf, weekCheck } from './hints.ts'

const NOW = new Date(2026, 8, 24, 12) // Do, 24.09.2026; Vorwoche = KW 38 (14.–20.09.)
const day = (d: number, h = 10) => new Date(2026, 8, d, h)
const base: Omit<Exercise, 'id' | 'name' | 'muscles'> = { aliases: [], archived: false, createdAt: '', updatedAt: '', category: 'kraft', defaultRestSec: 90 }
const upper: Exercise = { ...base, id: 'ex-upper', name: 'Oben', muscles: { primary: ['brust', 'lat', 'schulter-seitlich', 'bizeps', 'trizeps', 'bauch'], secondary: [] } }
const lower: Exercise = { ...base, id: 'ex-lower', name: 'Unten', loads: ['knie'], muscles: { primary: ['quadrizeps', 'beinbeuger', 'gesaess'], secondary: [] } }
const calves: Exercise = { ...base, id: 'ex-waden', name: 'Wadenheben', loads: ['sprunggelenk'], muscles: { primary: ['waden'], secondary: [] } }

let n = 0
function entry(exerciseId: string, k: number, at: Date, kg = 40): WorkoutEntry {
  n++
  return { exerciseId, sets: Array.from({ length: k }, (_, i) => ({ id: `s${n}-${i}`, weightKg: kg, reps: 10, done: true, doneAt: new Date(at.getTime() + i * 90_000).toISOString() })) }
}
function workout(at: Date, entries: WorkoutEntry[]): Workout {
  n++
  const fin = new Date(at.getTime() + 50 * 60_000).toISOString()
  return { id: `w${n}`, startedAt: at.toISOString(), finishedAt: fin, status: 'done', updatedAt: fin, templateId: 'tpl-a', entries }
}

const template: Template = {
  id: 'tpl-a', name: 'Ganzkörper A', programId: 'prog', createdAt: '', updatedAt: '',
  entries: [
    { exerciseId: 'ex-upper', sets: 2 },
    { exerciseId: 'ex-lower', sets: 2 },
    { exerciseId: 'ex-waden', sets: 1 },
    { exerciseId: 'ex-lat-zug', sets: 3, repMin: 10, repMax: 12 },
  ],
}

/** Vorwoche: 3 Trainings, alle Gruppen bei 6 Sätzen (Ziel Fitness 6–12), nur Waden 2; jedes Mal gesteigert. */
function data(extra: Partial<AppData> = {}, workouts?: Workout[]): AppData {
  const seed = createSeedData('2026-09-01T00:00:00.000Z')
  const ws = workouts ?? [14, 16, 18].map((d, i) => workout(day(d), [entry('ex-upper', 2, day(d), 40 + i * 2.5), entry('ex-lower', 2, day(d), 60 + i * 2.5), ...(i !== 1 ? [entry('ex-waden', 1, day(d), 20 + i)] : [])]))
  return {
    ...seed,
    exercises: [...seed.exercises, upper, lower, calves],
    templates: [...seed.templates, template],
    programs: [{ id: 'prog', name: 'Mein Programm', goal: 'fitness', sessionsPerWeek: 3, days: [{ id: 'd1', name: 'A', templateId: 'tpl-a' }], createdAt: '', updatedAt: '' }],
    workouts: ws,
    settings: { ...seed.settings, weeklyGoal: 3, activeProgramId: 'prog', profile: { goal: 'fitness', experience: 'einsteiger' } },
    ...extra,
  }
}

describe('Wochencheck', () => {
  it('Ampeln mit Begründung, Gesamturteil und Vorschlag am Programm-Tag', () => {
    const c = weekCheck(data(), NOW, -1)
    expect(c.range.label).toBe('KW 38')
    expect(c.current).toBe(false)
    expect(c.lights.map((l) => [l.key, l.level, l.text])).toEqual([
      ['regelmaessigkeit', 'gruen', '3 von 3 Trainings'],
      ['fortschritt', 'gruen', '3 Übungen gesteigert'],
      ['volumen', 'gelb', 'Waden 2 Sätze (Ziel ≥ 6)'],
      ['dichte', 'gruen', 'Pausen Ø 1:30 (Soll 1:30) · Ø 50 min'],
    ])
    expect(c.overall).toBe('gut')
    expect(c.suggestions[0]).toEqual({ text: 'Ganzkörper A: + 1 Satz Wadenheben', why: 'Waden 2 von 6 Sätzen', target: { kind: 'template', id: 'tpl-a' } })
  })

  it('geschonte Bereiche werden nicht bewertet und nicht vorgeschlagen', () => {
    const r: Restriction = { id: 'r', bodyParts: ['sprunggelenk'], muscles: [], until: '2026-10-15', createdAt: '', updatedAt: '' }
    const c = weekCheck(data({ restrictions: [r] }), NOW, -1)
    expect(c.volumes.find((v) => v.id === 'waden')!.status).toBe('geschont')
    expect(c.restricted).toEqual(['Sprunggelenk · bis 15.10.2026'])
    expect(c.lights.find((l) => l.key === 'volumen')!.level).toBe('gruen')
    expect(c.suggestions.some((s) => s.text.includes('Wadenheben'))).toBe(false)
  })

  it('laufende Woche: kein Urteil über fehlendes Volumen, bis das Wochenziel erreicht ist', () => {
    const d = data({}, [workout(day(22), [entry('ex-upper', 2, day(22))])])
    const c = weekCheck(d, NOW, 0)
    expect(c.lights[0]).toMatchObject({ level: 'gelb', text: '1 von 3 Trainings – noch 2 diese Woche' })
    expect(c.lights.find((l) => l.key === 'volumen')!.level).toBe('gelb')
    expect(c.suggestions).toEqual([])
  })

  it('zu viel Drücken → eigene Ziehen-Übung vorschlagen; stagnierende Übung → Wdh.-Bereich wechseln', () => {
    const ws = [14, 16, 18].map((d) => workout(day(d), [entry('ex-schraegbank-kurzhantel', 4, day(d)), entry('ex-lat-zug', 3, day(d), 45)]))
    const c = weekCheck(data({}, ws), NOW, -1)
    const texts = c.suggestions.map((s) => s.text)
    expect(c.balance.ratio).toBeCloseTo(4 / 3)
    expect(c.lights.find((l) => l.key === 'fortschritt')!.text).toBe('Schrägbank Kurzhantel seit 3 Einheiten gleich (+1)')
    expect(texts).toHaveLength(3)
    expect(c.suggestions.find((s) => s.text.endsWith('(mehr Ziehen)'))).toMatchObject({ text: 'Reverse Butterfly ergänzen (mehr Ziehen)', target: { kind: 'exercise', id: 'ex-reverse-butterfly' } })
    // unter Ziel kommt zuerst, daher prüfen wir die Stagnation direkt
    const onlyStuck = weekCheck(data({ settings: { ...data().settings, profile: undefined } }, ws.map((w) => ({ ...w, entries: [w.entries[1]] }))), NOW, -1)
    expect(onlyStuck.suggestions.map((s) => s.text)).toContain('Lat-Zug: 8–10 statt 10–12 Wdh.')
  })

  it('leichtere Woche nach ≥ 5 Wochen mit stehenden Übungen', () => {
    const ws = [0, 1, 2, 3, 4].map((i) => workout(new Date(2026, 8, 18 - 7 * i, 10), [entry('ex-lat-zug', 3, day(1), 45), entry('ex-rudern', 3, day(1), 40)]))
    const c = weekCheck(data({}, ws), NOW, -1)
    expect(c.deload?.weeks).toBe(5)
    expect(c.suggestions[0].text).toBe('Leichtere Woche einlegen')
  })

  it('Übungen ohne Muskelzuordnung werden gemeldet', () => {
    const c = weekCheck(data({}, [workout(day(22), [entry('ex-kreuzheben', 3, day(22))])]), NOW, 0)
    expect(c.unassigned.map((e) => e.name)).toEqual(['Kreuzheben'])
    expect(c.lights.find((l) => l.key === 'volumen')!.text).toBe('Keine Kraftsätze')
  })

  it('Gesamturteil aus den Ampeln (grau zählt nicht)', () => {
    const l = (level: 'gruen' | 'gelb' | 'rot' | 'grau') => ({ key: 'dichte' as const, label: '', level, text: '' })
    expect(overallOf([l('gruen'), l('gelb'), l('grau')])).toBe('gut')
    expect(overallOf([l('gelb'), l('gelb')])).toBe('okay')
    expect(overallOf([l('rot'), l('gelb'), l('rot')])).toBe('ausbaufaehig')
    expect(overallOf([l('grau')])).toBeNull()
    expect(overallOf([l('gruen'), l('gruen'), l('gruen'), l('rot')])).toBe('okay') // Rot verhindert „gut“
    expect(overallOf([l('gruen'), l('gruen'), l('rot'), l('rot')])).toBe('ausbaufaehig')
  })
})
