import { restSecFor } from '../hold.ts'
import { workoutDurationMin } from '../stats.ts'
import type { Exercise, Settings, Workout } from '../types.ts'

/**
 * Trainingsdichte: echte Pausen aus den Zeitstempeln der abgehakten Sätze (Abstand zwischen
 * aufeinanderfolgenden Sätzen derselben Übung) gegen die geplante Pause. Abstände über 10 min
 * zählen nicht (App verlassen, Geräteumbau). Halteübungen haben feste Pausen und zählen nicht.
 */

export const MAX_GAP_SEC = 600
/** Ab diesem Anteil über dem Soll gelten die Pausen als zu lang (Faustregel). */
export const REST_TOLERANCE = 0.3

export interface RestStats {
  /** Anzahl gemessener Pausen. */
  count: number
  avgSec: number
  targetSec: number
  /** Ø Dauer der Trainings in Minuten; null ohne Trainings. */
  avgDurationMin: number | null
  tooLong: boolean
}

export function restStats(workouts: Workout[], exercises: Exercise[], settings: Pick<Settings, 'defaultRestSec'>): RestStats {
  const byId = new Map(exercises.map((e) => [e.id, e]))
  let sum = 0
  let target = 0
  let count = 0
  for (const w of workouts) {
    for (const entry of w.entries) {
      const ex = byId.get(entry.exerciseId)
      if (!ex || ex.mode === 'hold') continue
      const times = entry.sets
        .filter((s) => s.done && s.doneAt)
        .map((s) => new Date(s.doneAt!).getTime())
        .sort((a, b) => a - b)
      const planned = restSecFor(ex, settings, entry)
      for (let i = 1; i < times.length; i++) {
        const gap = (times[i] - times[i - 1]) / 1000
        if (gap <= 0 || gap > MAX_GAP_SEC) continue
        sum += gap
        target += planned
        count++
      }
    }
  }
  const durations = workouts.map(workoutDurationMin).filter((d): d is number => d !== null)
  const avgDurationMin = durations.length ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null
  if (count === 0) return { count, avgSec: 0, targetSec: 0, avgDurationMin, tooLong: false }
  const avgSec = Math.round(sum / count)
  const targetSec = Math.round(target / count)
  return { count, avgSec, targetSec, avgDurationMin, tooLong: avgSec > targetSec * (1 + REST_TOLERANCE) }
}
