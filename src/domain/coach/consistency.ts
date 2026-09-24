import { exerciseMeta } from '../library.ts'
import { finishedWorkouts, workoutsPerWeek, type WeightPoint, weightProgression } from '../stats.ts'
import type { Exercise, Workout } from '../types.ts'
import { newRecords, type NewRecord } from './records.ts'

export interface WeekStatus {
  /** Abgeschlossene Trainings in der laufenden Woche. */
  thisWeek: number
  goal: number
  /** Wochen in Folge mit erreichtem Ziel (laufende Woche zählt mit, sobald erreicht). */
  streak: number
}

/** Regelmäßigkeit: Trainings dieser Woche gegen das Wochenziel und Serie in Wochen. */
export function weekStatus(workouts: Workout[], now: Date, goal: number): WeekStatus {
  const weeks = workoutsPerWeek(workouts, now, 104)
  const thisWeek = weeks[weeks.length - 1].count
  let streak = thisWeek >= goal ? 1 : 0
  for (let i = weeks.length - 2; i >= 0 && weeks[i].count >= goal; i--) streak++
  return { thisWeek, goal, streak }
}

export type TrendKind = 'gesteigert' | 'gleich' | 'weniger' | 'stagniert'

export interface ExerciseTrend {
  exercise: Exercise
  kind: TrendKind
  /** Begründung, z. B. „47,5 kg statt 45 kg“ oder „seit 3 Einheiten 45 kg × 10“. */
  text: string
  date: string
}

/** Kennzahl einer Einheit: Höchstgewicht (dann Wdh.) bzw. meiste Wdh./Sekunden. */
function score(p: WeightPoint): [number, number] {
  return p.maxWeightKg !== null ? [p.maxWeightKg, p.reps ?? 0] : [0, Math.max(...p.sets.map((s) => s.reps))]
}
const cmp = (a: [number, number], b: [number, number]) => (a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1])
const label = (p: WeightPoint, hold: boolean) =>
  p.maxWeightKg !== null ? `${String(p.maxWeightKg).replace('.', ',')} kg × ${p.reps}` : `${Math.max(...p.sets.map((s) => s.reps))}${hold ? ' s' : ' Wdh.'}`

/** Ab so vielen Einheiten ohne Veränderung gilt eine Übung als festgefahren (Faustregel). */
export const STAGNATION_SESSIONS = 3

/**
 * Fortschritt je Übung aus den letzten Einheiten (neueste zuerst sortiert): gesteigert, gleich,
 * weniger – oder seit ≥ 3 Einheiten unverändert (Faustregel, kein validiertes Kriterium).
 * Physio-Übungen sind ausgenommen.
 */
export function exerciseTrends(workouts: Workout[], exercises: Exercise[]): ExerciseTrend[] {
  const out: ExerciseTrend[] = []
  for (const ex of exercises) {
    if (ex.archived || exerciseMeta(ex).category === 'physio') continue
    const pts = weightProgression(workouts, ex.id)
    if (pts.length < 2) continue
    const hold = ex.mode === 'hold'
    const last = pts[pts.length - 1]
    const prev = pts[pts.length - 2]
    const recent = pts.slice(-STAGNATION_SESSIONS)
    const d = cmp(score(last), score(prev))
    let kind: TrendKind = d > 0 ? 'gesteigert' : d < 0 ? 'weniger' : 'gleich'
    let text = d === 0 ? `wie zuletzt: ${label(last, hold)}` : `${label(last, hold)} statt ${label(prev, hold)}`
    if (recent.length === STAGNATION_SESSIONS && recent.every((p) => cmp(score(p), score(last)) === 0)) {
      kind = 'stagniert'
      text = `seit ${STAGNATION_SESSIONS} Einheiten ${label(last, hold)}`
    }
    out.push({ exercise: ex, kind, text, date: last.date })
  }
  return out.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export interface DatedRecord extends NewRecord {
  date: string
}

/** Bestwerte der letzten `count` Trainings, neueste zuerst. */
export function recentRecords(workouts: Workout[], exercises: Exercise[], count = 8): DatedRecord[] {
  return finishedWorkouts(workouts)
    .slice(0, count)
    .flatMap((w) => newRecords(workouts.filter((x) => x.finishedAt! < w.finishedAt! || x.id === w.id), w, exercises).map((r) => ({ ...r, date: w.finishedAt! })))
}
