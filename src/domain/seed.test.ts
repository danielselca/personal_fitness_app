import { describe, expect, it } from 'vitest'
import { createSeedData, SEED_EXERCISE_COUNT, SEED_TEMPLATE_NAME } from './seed.ts'
import { matchesQuery } from './suggestions.ts'

describe('Seed-Katalog (AK3)', () => {
  const data = createSeedData('2026-09-10T00:00:00.000Z')

  it('enthält genau 21 Übungen', () => {
    expect(SEED_EXERCISE_COUNT).toBe(21)
    expect(data.exercises).toHaveLength(21)
  })

  it('Namen der Notizen sind wörtlich übernommen', () => {
    const names = data.exercises.map((e) => e.name)
    for (const n of [
      'Aufdehnen seitlich', 'Überzüge', 'Bein absenken (unterer Bauch)', 'Serratusstütz', 'Stütz auf Step',
      'Uppercut Theraband', 'Uppercut Tuch', 'Bear hug', 'Tiefes V', 'Holzhacken Gummiball Wand',
      '10x10s Kopfheben 1 cm Doppelkinn', 'Incline Frontraise', 'Kreuzheben', 'Rudern', 'Reverse Butterfly',
      'Adduktion', 'Lat-Zug', 'Schrägbank Kurzhantel',
    ]) expect(names).toContain(n)
  })

  it('Suche „28“ findet Lat-Zug, „butterfly“ beide Butterfly-Übungen', () => {
    const q28 = data.exercises.filter((e) => matchesQuery(e, '28')).map((e) => e.name)
    expect(q28).toEqual(['Lat-Zug'])
    const qb = data.exercises.filter((e) => matchesQuery(e, 'butterfly')).map((e) => e.name).sort()
    expect(qb).toEqual(['Butterfly Maschine', 'Reverse Butterfly'])
  })

  it('Plan-Vorgaben stimmen mit den Screenshots überein und erzeugen keine Historie', () => {
    const lat = data.exercises.find((e) => e.name === 'Lat-Zug')!
    expect(lat.planTarget).toEqual({ sets: 4, reps: 10, weightKg: 45, source: 'Fit7.11-Plan' })
    expect(lat.defaultRestSec).toBe(90)
    const rud = data.exercises.find((e) => e.name === 'Rudern')!
    expect(rud.planTarget).toEqual({ sets: 3, reps: 12, weightKg: 50, source: 'Fit7.11-Plan' })
    expect(data.workouts).toHaveLength(0)
  })

  it('Vorlage „Oberkörper Fokus Schulter“ mit 8 Übungen in Screenshot-Reihenfolge', () => {
    expect(data.templates).toHaveLength(1)
    const t = data.templates[0]
    expect(t.name).toBe(SEED_TEMPLATE_NAME)
    const names = t.entries.map((en) => data.exercises.find((e) => e.id === en.exerciseId)!.name)
    expect(names).toEqual([
      'Lat-Zug', 'Butterfly Maschine', 'Reverse Butterfly', 'Facepulls', 'Rudern',
      'Schrägbank Kurzhantel', 'Seitheben Kurzhantel', 'Adduktion',
    ])
    expect(t.entries[0].sets).toBe(4)
  })

  it('IDs sind eindeutig', () => {
    const ids = new Set(data.exercises.map((e) => e.id))
    expect(ids.size).toBe(21)
  })
})
