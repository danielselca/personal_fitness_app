import { formatNumber } from '../../lib/format.ts'
import { exerciseMeta } from '../library.ts'
import type { Exercise, Workout } from '../types.ts'

/**
 * Bestwerte je Übung. Geschätztes 1RM nach Epley (w × (1 + Wdh./30)), nur für Sätze mit höchstens
 * 10 Wiederholungen – darüber wird die Schätzung unzuverlässig.
 */

export const EPLEY_MAX_REPS = 10

export function epley1RM(weightKg: number, reps: number): number | null {
  if (weightKg <= 0 || reps < 1 || reps > EPLEY_MAX_REPS) return null
  return reps === 1 ? weightKg : weightKg * (1 + reps / 30)
}

export interface Best {
  value: number
  date: string
}

export interface ExerciseRecords {
  maxWeight?: Best
  best1RM?: Best
  /** Meiste Wdh. in einem Satz (ohne Gewicht) bzw. längste Haltezeit in Sekunden. */
  maxReps?: Best
  /** Größtes Volumen (Gewicht × Wdh.) in einer Einheit. */
  bestVolume?: Best
}

type DoneSet = { weightKg: number | null; reps: number }

function doneSets(w: Workout, exerciseId: string): DoneSet[] {
  return w.entries
    .filter((e) => e.exerciseId === exerciseId)
    .flatMap((e) => e.sets)
    .filter((s) => s.done && s.reps !== null)
    .map((s) => ({ weightKg: s.weightKg, reps: s.reps as number }))
}

function better(cur: Best | undefined, value: number | null, date: string): Best | undefined {
  if (value === null || value <= 0) return cur
  return !cur || value > cur.value ? { value, date } : cur
}

/** Bestwerte aus einer Einheit. */
function sessionRecords(sets: DoneSet[], date: string): ExerciseRecords {
  let r: ExerciseRecords = {}
  let volume = 0
  for (const s of sets) {
    if (s.weightKg !== null && s.weightKg > 0) {
      r = { ...r, maxWeight: better(r.maxWeight, s.weightKg, date), best1RM: better(r.best1RM, epley1RM(s.weightKg, s.reps), date) }
      volume += s.weightKg * s.reps
    } else {
      r = { ...r, maxReps: better(r.maxReps, s.reps, date) }
    }
  }
  return { ...r, bestVolume: better(undefined, volume, date) }
}

function merge(a: ExerciseRecords, b: ExerciseRecords): ExerciseRecords {
  const pick = (x?: Best, y?: Best) => (y && (!x || y.value > x.value) ? y : x)
  return {
    maxWeight: pick(a.maxWeight, b.maxWeight),
    best1RM: pick(a.best1RM, b.best1RM),
    maxReps: pick(a.maxReps, b.maxReps),
    bestVolume: pick(a.bestVolume, b.bestVolume),
  }
}

/** Bestwerte über alle abgeschlossenen Trainings (ohne `excludeWorkoutId`). */
export function exerciseRecords(workouts: Workout[], exerciseId: string, excludeWorkoutId?: string): ExerciseRecords {
  let r: ExerciseRecords = {}
  for (const w of workouts) {
    if (w.status !== 'done' || !w.finishedAt || w.id === excludeWorkoutId) continue
    const sets = doneSets(w, exerciseId)
    if (sets.length) r = merge(r, sessionRecords(sets, w.finishedAt))
  }
  return r
}

export interface NewRecord {
  exerciseId: string
  name: string
  /** Kurzer Text, z. B. „Lat-Zug: 50 kg (bisher 47,5 kg)“. */
  text: string
}

const kg = (v: number) => `${formatNumber(Math.round(v * 10) / 10)} kg`

/**
 * Neue Bestwerte eines abgeschlossenen Trainings gegenüber allen früheren. Je Übung höchstens
 * ein Eintrag (wichtigster zuerst: Gewicht, 1RM, Wdh./Haltezeit, Volumen). Beim ersten Mal gibt
 * es keinen Bestwert (nichts zum Vergleichen); Physio-Übungen zählen nicht.
 */
export function newRecords(workouts: Workout[], workout: Workout, exercises: Exercise[]): NewRecord[] {
  const out: NewRecord[] = []
  const seen = new Set<string>()
  for (const entry of workout.entries) {
    if (seen.has(entry.exerciseId)) continue
    seen.add(entry.exerciseId)
    const ex = exercises.find((e) => e.id === entry.exerciseId)
    if (!ex || exerciseMeta(ex).category === 'physio') continue
    const before = exerciseRecords(workouts, ex.id, workout.id)
    if (!before.maxWeight && !before.maxReps && !before.bestVolume) continue
    const now = sessionRecords(doneSets(workout, ex.id), workout.finishedAt ?? workout.startedAt)
    const hold = ex.mode === 'hold'
    let text: string | null = null
    if (now.maxWeight && before.maxWeight && now.maxWeight.value > before.maxWeight.value) {
      text = `${kg(now.maxWeight.value)} (bisher ${kg(before.maxWeight.value)})`
    } else if (now.best1RM && before.best1RM && now.best1RM.value > before.best1RM.value + 0.05) {
      text = `1RM ~${kg(now.best1RM.value)} (bisher ~${kg(before.best1RM.value)})`
    } else if (now.maxReps && before.maxReps && now.maxReps.value > before.maxReps.value) {
      text = hold ? `${now.maxReps.value} s gehalten (bisher ${before.maxReps.value} s)` : `${now.maxReps.value} Wdh. (bisher ${before.maxReps.value})`
    } else if (now.bestVolume && before.bestVolume && now.bestVolume.value > before.bestVolume.value) {
      text = `Volumen ${kg(now.bestVolume.value)} (bisher ${kg(before.bestVolume.value)})`
    }
    if (text) out.push({ exerciseId: ex.id, name: ex.name, text })
  }
  return out
}
