import { describe, expect, it } from 'vitest'
import { createSeedData } from '../seed.ts'
import type { Exercise, Restriction, Workout, WorkoutEntry } from '../types.ts'
import { weekBalance } from './balance.ts'
import { deloadAdvice } from './deload.ts'
import { groupFrequencies } from './frequency.ts'
import { restStats } from './rest.ts'
import { groupVolumes, muscleSets, restrictedGroups } from './volume.ts'
import { hardSets, weekRange, workoutsInWeek } from './week.ts'

const seed = createSeedData('2026-09-01T00:00:00.000Z')
const NOW = new Date(2026, 8, 24, 12) // Do, 24.09.2026 (KW 39)
const day = (d: number, h = 10, m = 0) => new Date(2026, 8, d, h, m)

const beinpresse: Exercise = {
  id: 'ex-bp', name: 'Beinpresse', aliases: [], archived: false, createdAt: '', updatedAt: '',
  category: 'kraft', pattern: 'kniebeuge', muscles: { primary: ['quadrizeps', 'gesaess'], secondary: ['beinbeuger'] }, loads: ['knie'],
}
const exercises = [...seed.exercises, beinpresse]

let n = 0
/** Eintrag mit `k` abgehakten Sätzen, je `restSec` Abstand ab `at`. */
function entry(exerciseId: string, k: number, at: Date, restSec = 90, extra: Partial<WorkoutEntry> = {}): WorkoutEntry {
  return {
    exerciseId,
    ...extra,
    sets: Array.from({ length: k }, (_, i) => ({ id: `s${n}-${exerciseId}-${i}`, weightKg: 40, reps: 10, done: true, doneAt: new Date(at.getTime() + i * restSec * 1000).toISOString() })),
  }
}
function workout(at: Date, entries: WorkoutEntry[], minutes = 50): Workout {
  n++
  const fin = new Date(at.getTime() + minutes * 60_000).toISOString()
  return { id: `w${n}`, startedAt: at.toISOString(), finishedAt: fin, status: 'done', updatedAt: fin, entries }
}

describe('Woche und harte Sätze', () => {
  it('Kalenderwoche Mo–So, Vorwoche per offset', () => {
    const r = weekRange(NOW)
    expect(r.label).toBe('KW 39')
    expect(r.start).toEqual(new Date(2026, 8, 21))
    expect(weekRange(NOW, -1).label).toBe('KW 38')
    const ws = [workout(day(20), []), workout(day(21), []), workout(day(27, 20), [])]
    expect(workoutsInWeek(ws, r).map((w) => w.id)).toEqual([ws[1].id, ws[2].id])
  })

  it('nur Kraftübungen mit Muskeln zählen; ohne Zuordnung wird gemeldet, Physio ignoriert', () => {
    const w = workout(day(22), [entry('ex-lat-zug', 3, day(22)), entry('ex-kreuzheben', 3, day(22)), entry('ex-serratusstuetz', 2, day(22))])
    const { sets, unassigned } = hardSets([w], exercises)
    expect(sets).toHaveLength(3)
    expect(unassigned.map((e) => e.id)).toEqual(['ex-kreuzheben'])
  })
})

describe('Volumen je Muskelgruppe', () => {
  const w = workout(day(22), [entry('ex-lat-zug', 4, day(22)), entry('ex-rudern', 3, day(22)), entry('ex-schraegbank-kurzhantel', 3, day(22))])
  const { sets } = hardSets([w], exercises)

  it('Hauptmuskel 1, mitbeteiligt ½ Satz; Gruppe zählt einen Satz nur einmal', () => {
    const per = muscleSets(sets)
    expect(per.get('lat')).toBe(7) // 4 Lat-Zug + 3 Rudern (primär)
    expect(per.get('bizeps')).toBe(3.5) // mitbeteiligt
    const v = groupVolumes(sets, 'muskelaufbau')
    const by = (id: string) => v.find((x) => x.id === id)!
    expect(by('ruecken').sets).toBe(7) // nicht 7 + ½ für oberen Rücken
    expect(by('ruecken').status).toBe('unter')
    expect(by('brust')).toMatchObject({ sets: 3, status: 'unter' })
    expect(by('ruecken').exercises[0]).toMatchObject({ name: 'Lat-Zug', sets: 4 })
  })

  it('Ziel je Profil: Fitness 6–12', () => {
    expect(groupVolumes(sets, 'fitness').find((x) => x.id === 'ruecken')!.status).toBe('ziel')
  })

  it('geschonte Bereiche werden nicht bewertet', () => {
    const r: Restriction = { id: 'r', bodyParts: ['schulter'], muscles: ['brust'], createdAt: '', updatedAt: '' }
    const v = groupVolumes(sets, 'muskelaufbau', restrictedGroups([r]))
    expect(v.find((x) => x.id === 'schultern')!.status).toBe('geschont')
    expect(v.find((x) => x.id === 'brust')!.status).toBe('geschont')
    expect(v.find((x) => x.id === 'ruecken')!.status).toBe('unter')
  })
})

describe('Häufigkeit und Balance', () => {
  it('große Gruppen: Tage mit mindestens einem Hauptmuskel-Satz', () => {
    const ws = [workout(day(21), [entry('ex-lat-zug', 3, day(21)), entry('ex-bp', 3, day(21))]), workout(day(23), [entry('ex-rudern', 3, day(23))])]
    const f = groupFrequencies(hardSets(ws, exercises).sets)
    expect(f.find((x) => x.id === 'ruecken')!.days).toBe(2)
    expect(f.find((x) => x.id === 'beine')!.days).toBe(1)
    expect(f.find((x) => x.id === 'brust')!.days).toBe(0)
  })

  it('Drücken : Ziehen und Ober- : Unterkörper, auch ohne Sätze', () => {
    const push = workout(day(22), [entry('ex-schraegbank-kurzhantel', 4, day(22)), entry('ex-butterfly-maschine', 3, day(22)), entry('ex-rudern', 5, day(22))])
    const b = weekBalance(hardSets([push], exercises).sets)
    expect(b).toMatchObject({ push: 7, pull: 5, pushHeavy: true, upper: 12, lower: 0, lacking: 'unterkoerper' })
    expect(b.ratio).toBeCloseTo(1.4)
    expect(weekBalance([])).toMatchObject({ push: 0, pull: 0, ratio: null, pushHeavy: false, lacking: null })
    const onlyPush = weekBalance(hardSets([workout(day(22), [entry('ex-butterfly-maschine', 3, day(22))])], exercises).sets)
    expect(onlyPush).toMatchObject({ ratio: null, pushHeavy: true })
  })
})

describe('Pausen', () => {
  it('Abstände aus Zeitstempeln, Lücken über 10 min zählen nicht; Soll aus Vorlage, Übung, Einstellung', () => {
    const e1 = entry('ex-lat-zug', 3, day(22), 120) // Soll: Übung 90 s
    const e2 = entry('ex-rudern', 2, day(22, 11), 60, { restSec: 45 }) // Soll: Vorlage 45 s
    e2.sets.push({ id: 'late', weightKg: 40, reps: 10, done: true, doneAt: day(22, 11, 30).toISOString() }) // Lücke > 10 min
    const r = restStats([workout(day(22), [e1, e2], 52)], exercises, { defaultRestSec: 90 })
    expect(r.count).toBe(3)
    expect(r.avgSec).toBe(100) // (120 + 120 + 60) / 3
    expect(r.targetSec).toBe(75) // (90 + 90 + 45) / 3
    expect(r.tooLong).toBe(true)
    expect(r.avgDurationMin).toBe(52)
    expect(restStats([], exercises, { defaultRestSec: 90 })).toMatchObject({ count: 0, avgDurationMin: null, tooLong: false })
  })
})

describe('Leichtere Woche (Faustregel)', () => {
  const weekly = (weeks: number, sets: (i: number) => [number, number][]) =>
    Array.from({ length: weeks }, (_, i) => {
      const at = new Date(2026, 8, 22 - 7 * (weeks - 1 - i), 10)
      return workout(at, [
        { exerciseId: 'ex-lat-zug', sets: sets(i).map(([kg, r], k) => ({ id: `d${i}-${k}`, weightKg: kg, reps: r, done: true })) },
        { exerciseId: 'ex-rudern', sets: sets(i).map(([kg, r], k) => ({ id: `e${i}-${k}`, weightKg: kg, reps: r, done: true })) },
      ])
    })

  it('≥ 5 Wochen am Stück und ≥ 2 Übungen stehen → Hinweis', () => {
    const ws = weekly(5, () => [[45, 10]])
    const a = deloadAdvice(ws, exercises, weekRange(NOW))
    expect(a?.weeks).toBe(5)
    expect(a?.reason).toContain('2 Übungen stehen')
  })

  it('zu kurze Serie oder Fortschritt → kein Hinweis', () => {
    expect(deloadAdvice(weekly(4, () => [[45, 10]]), exercises, weekRange(NOW))).toBeNull()
    expect(deloadAdvice(weekly(6, (i) => [[40 + i * 2.5, 10]]), exercises, weekRange(NOW))).toBeNull()
  })

  it('viele „schwer“-Bewertungen zählen als Ermüdung', () => {
    const ws = weekly(5, (i) => [[40 + i * 2.5, 10]])
    for (const w of ws.slice(-2)) w.entries = w.entries.map((e) => ({ ...e, rating: 'schwer' }))
    expect(deloadAdvice(ws, exercises, weekRange(NOW))?.reason).toContain('„schwer“')
  })
})
