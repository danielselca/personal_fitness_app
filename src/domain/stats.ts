import type { Workout, WorkoutSet } from './types.ts'
import { isoWeekKey, lastWeeks } from './weeks.ts'

/** Volumen = Σ Gewicht × Wdh. über abgehakte Sätze; ohne Gewicht zählt 0 kg (SPEC 5). */
export function setVolume(s: WorkoutSet): number {
  if (!s.done || s.reps === null) return 0
  return (s.weightKg ?? 0) * s.reps
}

export function workoutVolume(w: Workout): number {
  let sum = 0
  for (const e of w.entries) for (const s of e.sets) sum += setVolume(s)
  return Math.round(sum * 100) / 100
}

export function doneSetCount(w: Workout): number {
  let n = 0
  for (const e of w.entries) for (const s of e.sets) if (s.done) n++
  return n
}

export function finishedWorkouts(workouts: Workout[]): Workout[] {
  return workouts
    .filter((w) => w.status === 'done' && w.finishedAt)
    .sort((a, b) => (a.finishedAt! < b.finishedAt! ? 1 : -1))
}

/** Trainings pro ISO-Woche für die letzten `count` Wochen, Nullwochen enthalten (F11, AK18). */
export function workoutsPerWeek(workouts: Workout[], now: Date, count = 12): { key: string; start: Date; count: number }[] {
  const weeks = lastWeeks(now, count)
  const tally = new Map(weeks.map((w) => [w.key, 0]))
  for (const w of finishedWorkouts(workouts)) {
    const key = isoWeekKey(new Date(w.finishedAt!))
    if (tally.has(key)) tally.set(key, tally.get(key)! + 1)
  }
  return weeks.map((w) => ({ ...w, count: tally.get(w.key)! }))
}

export interface WeightPoint {
  workoutId: string
  date: string
  /** Höchstgewicht der abgehakten Sätze; null, wenn alle ohne Gewicht. */
  maxWeightKg: number | null
  /** Wdh. des Satzes mit dem Höchstgewicht (bei Gleichstand: die höchste Wdh.-Zahl). */
  reps: number | null
  sets: { weightKg: number | null; reps: number }[]
}

/** Gewichtsverlauf je Übung, ein Punkt pro abgeschlossenem Training, älteste zuerst (F11, AK19). */
export function weightProgression(workouts: Workout[], exerciseId: string): WeightPoint[] {
  const out: WeightPoint[] = []
  for (const w of finishedWorkouts(workouts)) {
    const sets = w.entries
      .filter((e) => e.exerciseId === exerciseId)
      .flatMap((e) => e.sets)
      .filter((s): s is WorkoutSet & { reps: number } => s.done && s.reps !== null)
    if (sets.length === 0) continue
    let maxWeightKg: number | null = null
    let reps: number | null = null
    for (const s of sets) {
      if (s.weightKg === null) continue
      if (maxWeightKg === null || s.weightKg > maxWeightKg || (s.weightKg === maxWeightKg && s.reps > (reps ?? 0))) {
        maxWeightKg = s.weightKg
        reps = s.reps
      }
    }
    if (maxWeightKg === null) reps = Math.max(...sets.map((s) => s.reps))
    out.push({
      workoutId: w.id,
      date: w.finishedAt!,
      maxWeightKg,
      reps,
      sets: sets.map((s) => ({ weightKg: s.weightKg, reps: s.reps })),
    })
  }
  return out.reverse()
}

export function workoutDurationMin(w: Workout): number | null {
  if (!w.finishedAt) return null
  const ms = new Date(w.finishedAt).getTime() - new Date(w.startedAt).getTime()
  return Math.max(0, Math.round(ms / 60000))
}
