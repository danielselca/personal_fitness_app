import { describe, expect, it } from 'vitest'
import { createSeedData } from '../seed.ts'
import type { Workout } from '../types.ts'
import { epley1RM, exerciseRecords, newRecords } from './records.ts'

const data = createSeedData('2026-09-01T00:00:00.000Z')
function w(id: string, at: string, exerciseId: string, sets: [number | null, number][]): Workout {
  return { id, startedAt: at, finishedAt: at, status: 'done', updatedAt: at, entries: [{ exerciseId, sets: sets.map(([kg, r], i) => ({ id: `${id}-${i}`, weightKg: kg, reps: r, done: true })) }] }
}

describe('Bestwerte', () => {
  it('Epley nur bis 10 Wdh.', () => {
    expect(epley1RM(100, 1)).toBe(100)
    expect(epley1RM(90, 10)).toBeCloseTo(120)
    expect(epley1RM(50, 12)).toBeNull()
  })

  it('Bestwerte über den Verlauf: schwerstes Gewicht, 1RM, Volumen', () => {
    const hist = [w('a', '2026-09-10T10:00:00Z', 'ex-lat-zug', [[45, 10], [45, 10]]), w('b', '2026-09-12T10:00:00Z', 'ex-lat-zug', [[50, 6], [40, 12]])]
    const r = exerciseRecords(hist, 'ex-lat-zug')
    expect(r.maxWeight).toEqual({ value: 50, date: '2026-09-12T10:00:00Z' })
    expect(r.best1RM?.value).toBeCloseTo(60)
    expect(r.bestVolume?.value).toBe(900)
  })

  it('neue Bestwerte gegenüber früher; erstes Mal und Physio zählen nicht', () => {
    const prev = w('a', '2026-09-10T10:00:00Z', 'ex-lat-zug', [[45, 10]])
    const cur: Workout = {
      ...w('b', '2026-09-12T10:00:00Z', 'ex-lat-zug', [[47.5, 8]]),
      entries: [
        ...w('b', '', 'ex-lat-zug', [[47.5, 8]]).entries,
        ...w('b', '', 'ex-rudern', [[40, 10]]).entries,
        ...w('b', '', 'ex-serratusstuetz', [[null, 70]]).entries,
      ],
    }
    const physioPrev = w('p', '2026-09-10T10:00:00Z', 'ex-serratusstuetz', [[null, 60]])
    const r = newRecords([prev, physioPrev, cur], cur, data.exercises)
    expect(r).toEqual([{ exerciseId: 'ex-lat-zug', name: 'Lat-Zug', text: '47,5 kg (bisher 45 kg)' }])
  })
})
