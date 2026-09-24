import { exerciseMeta, type ExerciseMeta } from '../library.ts'
import { dayKey } from '../restrictions.ts'
import type { Exercise, Workout, WorkoutEntry, WorkoutSet } from '../types.ts'
import { isoWeekKey, startOfIsoWeek } from '../weeks.ts'

/** Eine ISO-Woche (Mo 00:00 bis Mo 00:00 der Folgewoche, lokale Zeit). */
export interface WeekRange {
  key: string
  /** „KW 39“ */
  label: string
  start: Date
  end: Date
}

/** Woche von `now` (offset 0) bzw. Vorwochen (offset −1, −2 …). */
export function weekRange(now: Date, offset = 0): WeekRange {
  const start = startOfIsoWeek(now)
  start.setDate(start.getDate() + 7 * offset)
  const end = new Date(start)
  end.setDate(end.getDate() + 7)
  const key = isoWeekKey(start)
  return { key, label: `KW ${Number(key.slice(-2))}`, start, end }
}

/** Abgeschlossene Trainings der Woche, älteste zuerst. */
export function workoutsInWeek(workouts: Workout[], range: WeekRange): Workout[] {
  const a = range.start.getTime()
  const b = range.end.getTime()
  return workouts
    .filter((w) => w.status === 'done' && w.finishedAt && new Date(w.finishedAt).getTime() >= a && new Date(w.finishedAt).getTime() < b)
    .sort((x, y) => (x.finishedAt! < y.finishedAt! ? -1 : 1))
}

/** Ein abgehakter Satz einer Kraftübung mit Muskelzuordnung. */
export interface HardSet {
  exercise: Exercise
  meta: ExerciseMeta
  entry: WorkoutEntry
  set: WorkoutSet
  workoutId: string
  /** Trainingstag JJJJ-MM-TT (lokal). */
  day: string
}

/** Kategorien, die nicht als harte Sätze zählen. */
const NOT_STRENGTH = new Set(['mobilitaet', 'kardio', 'physio'])

/**
 * Harte Sätze der Trainings: abgehakte Sätze von Kraftübungen (Kategorie „Kraft“ oder ohne
 * Kategorie) mit Hauptmuskeln. Kraftübungen ohne Muskelzuordnung zählen nicht und werden als
 * `unassigned` zurückgegeben, damit der Coach darauf hinweisen kann.
 */
export function hardSets(workouts: Workout[], exercises: Exercise[]): { sets: HardSet[]; unassigned: Exercise[] } {
  const byId = new Map(exercises.map((e) => [e.id, e]))
  const sets: HardSet[] = []
  const unassigned = new Map<string, Exercise>()
  for (const w of workouts) {
    const day = dayKey(new Date(w.finishedAt ?? w.startedAt))
    for (const entry of w.entries) {
      const ex = byId.get(entry.exerciseId)
      if (!ex) continue
      const meta = exerciseMeta(ex)
      if (meta.category && NOT_STRENGTH.has(meta.category)) continue
      const done = entry.sets.filter((s) => s.done && s.reps !== null)
      if (done.length === 0) continue
      if (meta.muscles.primary.length === 0) {
        unassigned.set(ex.id, ex)
        continue
      }
      for (const set of done) sets.push({ exercise: ex, meta, entry, set, workoutId: w.id, day })
    }
  }
  return { sets, unassigned: [...unassigned.values()] }
}
