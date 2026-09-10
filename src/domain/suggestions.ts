import type { Exercise, Workout, WorkoutSet } from './types.ts'
import { newId } from './ids.ts'

export interface LastValues {
  workoutId: string
  date: string
  sets: { weightKg: number | null; reps: number }[]
}

/**
 * Werte des letzten abgeschlossenen Trainings mit dieser Übung (nur abgehakte Sätze).
 * `excludeWorkoutId` schließt das laufende Training aus (F4, AK6).
 */
export function lastValuesFor(workouts: Workout[], exerciseId: string, excludeWorkoutId?: string): LastValues | null {
  const candidates = workouts
    .filter((w) => w.status === 'done' && w.finishedAt && w.id !== excludeWorkoutId)
    .sort((a, b) => (a.finishedAt! < b.finishedAt! ? 1 : -1))
  for (const w of candidates) {
    const sets = w.entries
      .filter((e) => e.exerciseId === exerciseId)
      .flatMap((e) => e.sets)
      .filter((s) => s.done && s.reps !== null)
      .map((s) => ({ weightKg: s.weightKg, reps: s.reps as number }))
    if (sets.length > 0) return { workoutId: w.id, date: w.finishedAt!, sets }
  }
  return null
}

export type SuggestionSource = 'last' | 'plan' | 'none'

/**
 * Vorschlagssätze für eine Übung im neuen Training (F3):
 * letztes Training → Plan-Vorgabe → leer (3 Sätze ohne Werte).
 */
export function suggestSets(
  exercise: Exercise,
  last: LastValues | null,
  targetSets?: number,
): { sets: WorkoutSet[]; source: SuggestionSource } {
  if (last) {
    const n = targetSets ?? last.sets.length
    const sets: WorkoutSet[] = []
    for (let i = 0; i < n; i++) {
      const src = last.sets[i] ?? last.sets[last.sets.length - 1]
      sets.push({ id: newId('set-'), weightKg: src.weightKg, reps: src.reps, done: false })
    }
    return { sets, source: 'last' }
  }
  const plan = exercise.planTarget
  if (plan) {
    const n = targetSets ?? plan.sets
    const sets: WorkoutSet[] = []
    for (let i = 0; i < n; i++) sets.push({ id: newId('set-'), weightKg: plan.weightKg, reps: plan.reps, done: false })
    return { sets, source: 'plan' }
  }
  const n = targetSets ?? 3
  const sets: WorkoutSet[] = []
  for (let i = 0; i < n; i++) sets.push({ id: newId('set-'), weightKg: null, reps: null, done: false })
  return { sets, source: 'none' }
}

/** Suche über Name, Alias und Gerätenummer, ohne Groß-/Kleinschreibung (F1, AK3). */
export function matchesQuery(e: Exercise, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  if (e.name.toLowerCase().includes(q)) return true
  if (e.aliases.some((a) => a.toLowerCase().includes(q))) return true
  if (e.machineNo && (e.machineNo === q || `#${e.machineNo}` === q || e.machineNo.includes(q))) return true
  return false
}

export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLowerCase()
}
