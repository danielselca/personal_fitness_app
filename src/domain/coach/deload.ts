import { exerciseHits } from '../restrictions.ts'
import { workoutsPerWeek } from '../stats.ts'
import type { Exercise, Restriction, Workout } from '../types.ts'
import { exerciseTrends } from './consistency.ts'
import type { WeekRange } from './week.ts'

/**
 * Leichtere Woche (Faustregel, kein validiertes Kriterium): vorgeschlagen, wenn seit
 * mindestens 5 Wochen ohne Unterbrechung trainiert wird UND sich Ermüdung zeigt – mindestens
 * 2 Übungen stehen oder werden weniger, oder mindestens ⅓ der Bewertungen der letzten
 * 2 Wochen war „schwer“. Nur ein Hinweis; die App ändert nichts automatisch.
 */

export const DELOAD_MIN_WEEKS = 5
export const DELOAD_MIN_STUCK = 2
export const DELOAD_HARD_SHARE = 1 / 3
const DAY = 86_400_000

export interface DeloadAdvice {
  weeks: number
  reason: string
}

export function deloadAdvice(workouts: Workout[], exercises: Exercise[], range: WeekRange, active: Restriction[] = []): DeloadAdvice | null {
  const end = range.end.getTime()
  const before = workouts.filter((w) => w.status === 'done' && w.finishedAt && new Date(w.finishedAt).getTime() < end)
  const weeks = workoutsPerWeek(before, new Date(end - 1), 52)
  let i = weeks.length - 1
  if (weeks[i].count === 0) i-- // laufende Woche ohne Training unterbricht die Serie nicht
  let streak = 0
  for (; i >= 0 && weeks[i].count > 0; i--) streak++
  if (streak < DELOAD_MIN_WEEKS) return null

  const since = end - 21 * DAY
  const stuck = exerciseTrends(before, exercises).filter(
    (t) => (t.kind === 'stagniert' || t.kind === 'weniger') && new Date(t.date).getTime() >= since && exerciseHits(t.exercise, active).length === 0,
  )
  const ratings = before
    .filter((w) => new Date(w.finishedAt!).getTime() >= end - 14 * DAY)
    .flatMap((w) => w.entries.map((e) => e.rating))
    .filter((r) => r !== undefined)
  const hard = ratings.filter((r) => r === 'schwer').length
  const hardShare = ratings.length >= 3 ? hard / ratings.length : 0

  if (stuck.length >= DELOAD_MIN_STUCK) {
    return { weeks: streak, reason: `${streak} Wochen am Stück trainiert, ${stuck.length} Übungen stehen oder gehen zurück` }
  }
  if (hardShare >= DELOAD_HARD_SHARE) {
    return { weeks: streak, reason: `${streak} Wochen am Stück trainiert, ${hard} von ${ratings.length} Übungen zuletzt „schwer“` }
  }
  return null
}
