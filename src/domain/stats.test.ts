import { describe, expect, it } from 'vitest'
import { weightProgression, workoutVolume, workoutsPerWeek } from './stats.ts'
import type { Workout } from './types.ts'
import { isoWeekKey, lastWeeks, startOfIsoWeek } from './weeks.ts'

function wo(id: string, finishedAt: string, sets: { w: number | null; r: number; done?: boolean }[], exerciseId = 'ex-lat-zug'): Workout {
  return {
    id,
    startedAt: finishedAt,
    finishedAt,
    status: 'done',
    updatedAt: finishedAt,
    entries: [{ exerciseId, sets: sets.map((s, i) => ({ id: `${id}-${i}`, weightKg: s.w, reps: s.r, done: s.done ?? true })) }],
  }
}

describe('Volumen (AK20)', () => {
  it('10×45 + 10×45 + 8×47,5 = 1280 kg', () => {
    expect(workoutVolume(wo('a', '2026-09-01T10:00:00Z', [{ w: 45, r: 10 }, { w: 45, r: 10 }, { w: 47.5, r: 8 }]))).toBe(1280)
  })
  it('Satz ohne Gewicht ändert das Volumen nicht, nicht abgehakte Sätze zählen nicht', () => {
    expect(workoutVolume(wo('a', '2026-09-01T10:00:00Z', [{ w: 45, r: 10 }, { w: null, r: 12 }]))).toBe(450)
    expect(workoutVolume(wo('a', '2026-09-01T10:00:00Z', [{ w: 45, r: 10 }, { w: 100, r: 10, done: false }]))).toBe(450)
  })
})

describe('ISO-Wochen (A-6)', () => {
  it('Montag ist Wochenstart', () => {
    const s = startOfIsoWeek(new Date(2026, 8, 10)) // Do 10.09.2026
    expect(s.getDay()).toBe(1)
    expect(s.getDate()).toBe(7)
  })
  it('Wochenschlüssel', () => {
    expect(isoWeekKey(new Date(2026, 0, 1))).toBe('2026-W01')
    expect(isoWeekKey(new Date(2027, 0, 3))).toBe('2026-W53')
    expect(isoWeekKey(new Date(2026, 8, 13))).toBe('2026-W37') // So
    expect(isoWeekKey(new Date(2026, 8, 14))).toBe('2026-W38') // Mo
  })
  it('lastWeeks liefert 12 Wochen, älteste zuerst, letzte = aktuelle', () => {
    const weeks = lastWeeks(new Date(2026, 8, 10), 12)
    expect(weeks).toHaveLength(12)
    expect(weeks[11].key).toBe('2026-W37')
    expect(weeks[0].key).toBe('2026-W26')
  })
})

describe('Trainings pro Woche (AK18)', () => {
  it('zwei Trainings in derselben Woche → 2, Nullwochen sichtbar', () => {
    const now = new Date(2026, 8, 10, 12)
    const res = workoutsPerWeek(
      [wo('a', '2026-09-08T10:00:00', [{ w: 1, r: 1 }]), wo('b', '2026-09-09T10:00:00', [{ w: 1, r: 1 }]), wo('c', '2026-08-20T10:00:00', [{ w: 1, r: 1 }])],
      now,
    )
    expect(res).toHaveLength(12)
    expect(res[11].count).toBe(2)
    expect(res[8].count).toBe(1) // Woche vom 17.08.
    expect(res.filter((r) => r.count === 0)).toHaveLength(10)
  })
  it('ohne Trainings nur Nullen', () => {
    expect(workoutsPerWeek([], new Date(2026, 8, 10)).every((r) => r.count === 0)).toBe(true)
  })
})

describe('Gewichtsverlauf (AK19)', () => {
  it('ein Punkt je Training mit Höchstgewicht und zugehörigen Wdh., älteste zuerst', () => {
    const pts = weightProgression(
      [
        wo('b', '2026-09-08T10:00:00Z', [{ w: 45, r: 10 }, { w: 47.5, r: 8 }]),
        wo('a', '2026-09-01T10:00:00Z', [{ w: 45, r: 10 }, { w: 45, r: 12 }]),
        wo('c', '2026-09-09T10:00:00Z', [{ w: 30, r: 10 }], 'ex-andere'),
      ],
      'ex-lat-zug',
    )
    expect(pts.map((p) => p.workoutId)).toEqual(['a', 'b'])
    expect(pts[0]).toMatchObject({ maxWeightKg: 45, reps: 12 })
    expect(pts[1]).toMatchObject({ maxWeightKg: 47.5, reps: 8 })
  })
  it('leer ohne Historie', () => {
    expect(weightProgression([], 'ex-lat-zug')).toEqual([])
  })
})
