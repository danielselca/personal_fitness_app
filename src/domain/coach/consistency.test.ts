import { describe, expect, it } from 'vitest'
import { createSeedData } from '../seed.ts'
import type { Workout } from '../types.ts'
import { exerciseTrends, recentRecords, weekStatus } from './consistency.ts'

const data = createSeedData('2026-09-01T00:00:00.000Z')
const NOW = new Date(2026, 8, 24, 12) // Do, 24.09.2026
let n = 0
function w(date: Date, exerciseId = 'ex-lat-zug', sets: [number | null, number][] = [[45, 10]]): Workout {
  const at = date.toISOString()
  n++
  return { id: `w${n}`, startedAt: at, finishedAt: at, status: 'done', updatedAt: at, entries: [{ exerciseId, sets: sets.map(([kg, r], i) => ({ id: `${n}-${i}`, weightKg: kg, reps: r, done: true })) }] }
}
const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 10)

describe('Regelmäßigkeit', () => {
  it('Trainings dieser Woche und Serie erreichter Wochen', () => {
    const ws = [
      // diese Woche (ab Mo 21.09.): 2
      w(day(2026, 9, 21)), w(day(2026, 9, 23)),
      // Vorwoche: 3, Woche davor: 3, davor: 1
      w(day(2026, 9, 14)), w(day(2026, 9, 16)), w(day(2026, 9, 18)),
      w(day(2026, 9, 7)), w(day(2026, 9, 9)), w(day(2026, 9, 11)),
      w(day(2026, 9, 2)),
    ]
    expect(weekStatus(ws, NOW, 3)).toEqual({ thisWeek: 2, goal: 3, streak: 2 })
    expect(weekStatus([...ws, w(day(2026, 9, 24))], NOW, 3).streak).toBe(3)
    expect(weekStatus([], NOW, 3)).toEqual({ thisWeek: 0, goal: 3, streak: 0 })
  })
})

describe('Fortschritt je Übung', () => {
  it('gesteigert, weniger, seit 3 Einheiten gleich (Faustregel); Physio ausgenommen', () => {
    const ws = [
      w(day(2026, 9, 10), 'ex-lat-zug', [[45, 10]]), w(day(2026, 9, 17), 'ex-lat-zug', [[47.5, 8]]),
      w(day(2026, 9, 10), 'ex-rudern', [[40, 10]]), w(day(2026, 9, 14), 'ex-rudern', [[40, 10]]), w(day(2026, 9, 18), 'ex-rudern', [[40, 10]]),
      w(day(2026, 9, 12), 'ex-butterfly-maschine', [[35, 10]]), w(day(2026, 9, 19), 'ex-butterfly-maschine', [[30, 10]]),
      w(day(2026, 9, 12), 'ex-serratusstuetz', [[null, 60]]), w(day(2026, 9, 19), 'ex-serratusstuetz', [[null, 50]]),
    ]
    const t = exerciseTrends(ws, data.exercises)
    const by = (id: string) => t.find((x) => x.exercise.id === id)
    expect(by('ex-lat-zug')).toMatchObject({ kind: 'gesteigert', text: '47,5 kg × 8 statt 45 kg × 10' })
    expect(by('ex-rudern')).toMatchObject({ kind: 'stagniert', text: 'seit 3 Einheiten 40 kg × 10' })
    expect(by('ex-butterfly-maschine')?.kind).toBe('weniger')
    expect(by('ex-serratusstuetz')).toBeUndefined()
    expect(t[0].exercise.id).toBe('ex-butterfly-maschine') // neueste zuerst
  })

  it('letzte Bestwerte mit Datum', () => {
    const ws = [w(day(2026, 9, 10), 'ex-lat-zug', [[45, 10]]), w(day(2026, 9, 17), 'ex-lat-zug', [[50, 6]])]
    expect(recentRecords(ws, data.exercises)).toEqual([{ exerciseId: 'ex-lat-zug', name: 'Lat-Zug', text: '50 kg (bisher 45 kg)', date: ws[1].finishedAt }])
  })
})
