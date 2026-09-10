import { describe, expect, it } from 'vitest'
import { createSeedData } from './seed.ts'
import { lastValuesFor, suggestSets } from './suggestions.ts'
import type { Workout } from './types.ts'

const data = createSeedData('2026-09-01T00:00:00.000Z')
const lat = data.exercises.find((e) => e.name === 'Lat-Zug')!
const bear = data.exercises.find((e) => e.name === 'Bear hug')!

const history: Workout[] = [
  {
    id: 'w1', startedAt: '2026-09-02T10:00:00Z', finishedAt: '2026-09-02T11:00:00Z', status: 'done', updatedAt: '2026-09-02T11:00:00Z',
    entries: [{ exerciseId: lat.id, sets: [
      { id: 's1', weightKg: 45, reps: 10, done: true },
      { id: 's2', weightKg: 45, reps: 10, done: true },
      { id: 's3', weightKg: 47.5, reps: 8, done: true },
      { id: 's4', weightKg: 50, reps: 5, done: false },
    ] }],
  },
  {
    id: 'w0', startedAt: '2026-08-20T10:00:00Z', finishedAt: '2026-08-20T11:00:00Z', status: 'done', updatedAt: '2026-08-20T11:00:00Z',
    entries: [{ exerciseId: lat.id, sets: [{ id: 's0', weightKg: 40, reps: 10, done: true }] }],
  },
]

describe('Letzte Werte (F4, AK6)', () => {
  it('liefert die abgehakten Sätze des jüngsten Trainings', () => {
    const last = lastValuesFor(history, lat.id)!
    expect(last.workoutId).toBe('w1')
    expect(last.sets).toEqual([{ weightKg: 45, reps: 10 }, { weightKg: 45, reps: 10 }, { weightKg: 47.5, reps: 8 }])
  })
  it('schließt das laufende Training aus und ignoriert Übungen ohne Historie', () => {
    expect(lastValuesFor(history, lat.id, 'w1')!.workoutId).toBe('w0')
    expect(lastValuesFor(history, bear.id)).toBeNull()
  })
})

describe('Vorschlag (F3, AK5, AK6)', () => {
  it('ohne Historie: Plan-Vorgabe 4 × 10 × 45', () => {
    const { sets, source } = suggestSets(lat, null)
    expect(source).toBe('plan')
    expect(sets).toHaveLength(4)
    expect(sets.every((s) => s.weightKg === 45 && s.reps === 10 && !s.done)).toBe(true)
  })
  it('mit Historie: je Satz die Werte des letzten Mals, Satz 3 = 47,5', () => {
    const { sets, source } = suggestSets(lat, lastValuesFor(history, lat.id))
    expect(source).toBe('last')
    expect(sets.map((s) => [s.weightKg, s.reps])).toEqual([[45, 10], [45, 10], [47.5, 8]])
  })
  it('mehr Zielsätze als letztes Mal: letzter Satz wird wiederholt', () => {
    const { sets } = suggestSets(lat, lastValuesFor(history, lat.id), 5)
    expect(sets.map((s) => s.weightKg)).toEqual([45, 45, 47.5, 47.5, 47.5])
  })
  it('ohne Historie und ohne Plan: 3 leere Sätze', () => {
    const { sets, source } = suggestSets(bear, null)
    expect(source).toBe('none')
    expect(sets).toHaveLength(3)
    expect(sets.every((s) => s.weightKg === null && s.reps === null)).toBe(true)
  })
})
