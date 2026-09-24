import { describe, expect, it } from 'vitest'
import { createSeedData } from '../seed.ts'
import type { EntryRating, Exercise, Restriction, Workout } from '../types.ts'
import { lastSummary, progressionFor } from './progression.ts'

const data = createSeedData('2026-09-01T00:00:00.000Z')
const ex = (id: string) => data.exercises.find((e) => e.id === id)!
const NOW = new Date('2026-09-24T10:00:00.000Z')
const TARGET = { sets: 3, repMin: 8, repMax: 12 }

function session(exerciseId: string, sets: [number | null, number][], finishedAt = '2026-09-22T10:00:00.000Z', rating?: EntryRating): Workout {
  return {
    id: `w-${finishedAt}`, startedAt: finishedAt, finishedAt, status: 'done', updatedAt: finishedAt,
    entries: [{ exerciseId, rating, sets: sets.map(([w, r], i) => ({ id: `s${i}`, weightKg: w, reps: r, done: true })) }],
  }
}
const run = (exercise: Exercise, workouts: Workout[], restrictions: Restriction[] = [], target = TARGET) =>
  progressionFor({ exercise, target, workouts, restrictions, weightStep: 2.5, now: NOW })
const values = (r: ReturnType<typeof run>) => r!.sets.map((s) => [s.weightKg, s.reps])

describe('Coach: Steigerung mit Gewicht (doppelte Progression)', () => {
  const lat = ex('ex-lat-zug')

  it('alle Sätze am oberen Ende → + ein Gewichtsschritt, Wdh. zurück ans untere Ende', () => {
    const r = run(lat, [session(lat.id, [[45, 12], [45, 12], [45, 12]])])
    expect(values(r)).toEqual([[47.5, 8], [47.5, 8], [47.5, 8]])
    expect(r!.coach).toEqual({ kind: 'gewicht', note: '↑ 47,5 kg – letztes Mal 3 × 12 × 45 kg' })
  })

  it('sonst gleiches Gewicht und je Satz +1 Wdh. bis zum oberen Ende', () => {
    const r = run(lat, [session(lat.id, [[45, 10], [45, 10], [45, 9]])])
    expect(values(r)).toEqual([[45, 11], [45, 11], [45, 10]])
    expect(r!.coach.kind).toBe('wdh')
    expect(r!.coach.note).toBe('+1 Wdh. je Satz bei 45 kg – letztes Mal 10, 10, 9 × 45 kg')
    expect(values(run(lat, [session(lat.id, [[45, 12], [45, 12], [45, 11]])]))).toEqual([[45, 12], [45, 12], [45, 12]])
  })

  it('kleines Gewicht: kleinster Schritt, im Hinweis erwähnt', () => {
    const r = run(lat, [session(lat.id, [[10, 12], [10, 12], [10, 12]])])
    expect(values(r)[0]).toEqual([12.5, 8])
    expect(r!.coach.note).toContain('kleinster Schritt, +25 %')
  })

  it('„schwer“ blockiert die Steigerung, „leicht“ lockert die Schwelle um 1 Wdh.', () => {
    const hard = run(lat, [session(lat.id, [[45, 12], [45, 12], [45, 12]], undefined, 'schwer')])
    expect(values(hard)).toEqual([[45, 12], [45, 12], [45, 12]])
    expect(hard!.coach.kind).toBe('gleich')
    const easy = run(lat, [session(lat.id, [[45, 11], [45, 11], [45, 12]], undefined, 'leicht')])
    expect(easy!.coach.kind).toBe('gewicht')
  })

  it('nur die neueste Einheit zählt; zu wenige Sätze → keine Gewichtssteigerung', () => {
    const r = run(lat, [session(lat.id, [[40, 8]], '2026-09-10T10:00:00.000Z'), session(lat.id, [[45, 12], [45, 12]])])
    expect(r!.coach.kind).toBe('wdh')
  })

  it('≥ 14 Tage Pause: −10 % auf den Schritt abgerundet', () => {
    const r = run(lat, [session(lat.id, [[50, 12], [50, 12], [50, 12]], '2026-09-05T10:00:00.000Z')])
    expect(values(r)).toEqual([[45, 8], [45, 8], [45, 8]])
    expect(r!.coach).toMatchObject({ kind: 'pause' })
    expect(r!.coach.note).toContain('Nach 19 Tagen Pause')
  })
})

describe('Coach: Schonen', () => {
  const lat = ex('ex-lat-zug')
  const shoulder = (p: Partial<Restriction>): Restriction => ({ id: 'rs', bodyParts: ['schulter'], muscles: [], createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z', ...p })

  it('geschont → keine Steigerung', () => {
    const r = run(lat, [session(lat.id, [[45, 12], [45, 12], [45, 12]])], [shoulder({})])
    expect(values(r)).toEqual([[45, 12], [45, 12], [45, 12]])
    expect(r!.coach.note).toContain('Schulter geschont')
  })

  it('beim letzten Mal geschont, jetzt nicht mehr → Wiedereinstieg mit −10 %', () => {
    const r = run(lat, [session(lat.id, [[45, 12], [45, 12], [45, 12]])], [shoulder({ until: '2026-09-23' })])
    expect(values(r)[0]).toEqual([40, 8])
    expect(r!.coach.kind).toBe('wiedereinstieg')
  })
})

describe('Coach: ohne Gewicht, Halten, Physio, erstes Mal', () => {
  it('ohne Gewicht: Wdh. → +1 Satz → schwerere Variante', () => {
    const plank: Exercise = { id: 'ex-lieg', name: 'Liegestütz', aliases: [], noWeight: true, libraryId: 'liegestuetz', archived: false, createdAt: '', updatedAt: '' }
    expect(values(run(plank, [session(plank.id, [[null, 10], [null, 9], [null, 8]])]))).toEqual([[null, 11], [null, 10], [null, 9]])
    const more = run(plank, [session(plank.id, [[null, 12], [null, 12], [null, 12]])])
    expect(more!.coach.kind).toBe('satz')
    expect(more!.sets).toHaveLength(4)
    const five = Array.from({ length: 5 }, () => [null, 12] as [null, number])
    expect(run(plank, [session(plank.id, five)])!.coach.kind).toBe('variante')
  })

  it('Halten: alle Sätze voll gehalten → +5 s vorschlagen', () => {
    const hold: Exercise = { id: 'ex-plank', name: 'Unterarmstütz', aliases: [], noWeight: true, mode: 'hold', holdSec: 30, libraryId: 'unterarmstuetz', archived: false, createdAt: '', updatedAt: '' }
    const r = run(hold, [session(hold.id, [[null, 30], [null, 30], [null, 30]])])
    expect(r!.coach).toEqual({ kind: 'halten', note: 'Alle Sätze 30 s gehalten – nächstes Mal 35 s?' })
  })

  it('Physio-Übungen werden nie gesteigert', () => {
    expect(run(ex('ex-serratusstuetz'), [session('ex-serratusstuetz', [[null, 60]])])).toBeNull()
  })

  it('erstes Mal: bisherige Vorbelegung mit Hinweis', () => {
    const r = run(ex('ex-lat-zug'), [])
    expect(values(r)).toEqual([[45, 10], [45, 10], [45, 10]]) // Plan-Vorgabe, 3 Sätze laut Ziel
    expect(r!.coach).toEqual({ kind: 'erstes-mal', note: 'Erstes Mal: Gewicht wählen, mit dem 8–12 Wdh. sauber gehen' })
  })

  it('Zusammenfassung der letzten Einheit', () => {
    expect(lastSummary([{ weightKg: 45, reps: 12 }, { weightKg: 45, reps: 12 }])).toBe('2 × 12 × 45 kg')
    expect(lastSummary([{ weightKg: null, reps: 10 }, { weightKg: null, reps: 9 }])).toBe('10, 9')
  })
})
