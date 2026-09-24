import { formatNumber } from '../../lib/format.ts'
import { newId } from '../ids.ts'
import { exerciseMeta } from '../library.ts'
import { activeRestrictions, dayKey, exerciseHits, isActive } from '../restrictions.ts'
import { suggestSets } from '../suggestions.ts'
import type { CoachNote, EntryRating, Exercise, Restriction, Workout, WorkoutSet } from '../types.ts'

/**
 * Steigerungsvorschläge (Coach I) nach dem Prinzip der doppelten Progression:
 * erst die Wiederholungen im Zielbereich steigern, dann das Gewicht (ACSM 2009: +2–10 %, sobald
 * das obere Ende erreicht ist) und die Wiederholungen zurück ans untere Ende. Gilt nur für
 * Übungen mit Zielbereich; Physio-Übungen werden nie automatisch gesteigert.
 */

export interface ProgressionTarget {
  sets: number
  repMin: number
  repMax: number
}

export interface ProgressionResult {
  sets: WorkoutSet[]
  coach: CoachNote
}

/** Ab so vielen Tagen Pause wird das Gewicht um 10 % reduziert (Faustregel). */
export const DETRAINING_DAYS = 14
/** Höchstens so viele Sätze bei Übungen ohne Gewicht, danach schwerere Variante. */
export const MAX_BODYWEIGHT_SETS = 5
/** Steigerung der Haltedauer in Sekunden. */
export const HOLD_STEP_SEC = 5

interface LastEntry {
  date: string
  rating?: EntryRating
  sets: { weightKg: number | null; reps: number }[]
}

/** Letzte abgeschlossene Einheit dieser Übung (nur abgehakte Sätze) samt Bewertung. */
export function lastEntryFor(workouts: Workout[], exerciseId: string, excludeWorkoutId?: string): LastEntry | null {
  const done = workouts
    .filter((w) => w.status === 'done' && w.finishedAt && w.id !== excludeWorkoutId)
    .sort((a, b) => (a.finishedAt! < b.finishedAt! ? 1 : -1))
  for (const w of done) {
    const entries = w.entries.filter((e) => e.exerciseId === exerciseId)
    const sets = entries.flatMap((e) => e.sets).filter((s) => s.done && s.reps !== null).map((s) => ({ weightKg: s.weightKg, reps: s.reps as number }))
    if (sets.length > 0) return { date: w.finishedAt!, rating: entries.find((e) => e.rating)?.rating, sets }
  }
  return null
}

const kg = (v: number) => `${formatNumber(v)} kg`
const roundToStep = (v: number, step: number) => Math.round(v / step) * step
const floorToStep = (v: number, step: number) => Math.max(step, Math.floor(v / step + 1e-9) * step)
const set = (weightKg: number | null, reps: number | null): WorkoutSet => ({ id: newId('set-'), weightKg, reps, done: false })

/** „3 × 12“ bei gleichen Werten, sonst „12, 12, 10“ (mit Gewicht: „3 × 12 × 45 kg“). */
export function lastSummary(sets: { weightKg: number | null; reps: number }[]): string {
  const sameReps = sets.every((s) => s.reps === sets[0].reps)
  const weights = [...new Set(sets.map((s) => s.weightKg))]
  const w = weights.length === 1 && weights[0] !== null ? ` × ${kg(weights[0])}` : ''
  return sameReps ? `${sets.length} × ${sets[0].reps}${w}` : `${sets.map((s) => s.reps).join(', ')}${w}`
}

function daysBetween(a: string, b: Date): number {
  return Math.floor((b.getTime() - new Date(a).getTime()) / 86_400_000)
}

/**
 * Vorschlag für die nächste Einheit. `null`, wenn der Coach hier nicht zuständig ist (Physio);
 * dann gilt die bisherige Vorbelegung.
 */
export function progressionFor(args: {
  exercise: Exercise
  target: ProgressionTarget
  workouts: Workout[]
  restrictions: Restriction[]
  weightStep: number
  now: Date
  excludeWorkoutId?: string
}): ProgressionResult | null {
  const { exercise: ex, target, workouts, restrictions, now } = args
  const meta = exerciseMeta(ex)
  if (meta.category === 'physio') return null
  const step = ex.weightStep ?? args.weightStep
  const { repMin: lo, repMax: hi } = target
  const hold = ex.mode === 'hold'
  const last = lastEntryFor(workouts, ex.id, args.excludeWorkoutId)

  if (!last) {
    const base = suggestSets(ex, null, target.sets).sets
    const note = hold
      ? `Erstes Mal: ${target.sets} × ${ex.holdSec ?? 60} s halten`
      : ex.noWeight
        ? `Erstes Mal: ${lo}–${hi} Wdh. je Satz anpeilen`
        : `Erstes Mal: Gewicht wählen, mit dem ${lo}–${hi} Wdh. sauber gehen`
    return { sets: base, coach: { kind: 'erstes-mal', note } }
  }

  const repeatLast = (n: number) => suggestSets(ex, { workoutId: '', date: last.date, sets: last.sets }, n).sets
  const summary = lastSummary(last.sets)

  // Geschonte Bereiche: keine Steigerung
  const hitsNow = exerciseHits(ex, activeRestrictions(restrictions, dayKey(now)))
  if (hitsNow.length > 0) {
    return { sets: repeatLast(target.sets), coach: { kind: 'geschont', note: `${hitsNow.join(', ')} geschont – keine Steigerung, letztes Mal ${summary}` } }
  }

  const topWeight = hold || ex.noWeight ? null : last.sets.reduce<number | null>((m, s) => (s.weightKg !== null && (m === null || s.weightKg > m) ? s.weightKg : m), null)

  // Wiedereinstieg nach Schonung oder längerer Pause: −10 %
  const lastDay = last.date.slice(0, 10)
  const wasRestricted = exerciseHits(ex, restrictions.filter((r) => r.createdAt <= last.date && isActive(r, lastDay))).length > 0
  const pause = daysBetween(last.date, now)
  if (topWeight !== null && (wasRestricted || pause >= DETRAINING_DAYS)) {
    const w = floorToStep(topWeight * 0.9, step)
    const why = wasRestricted ? 'Wiedereinstieg nach Schonung' : `Nach ${pause} Tagen Pause`
    return {
      sets: Array.from({ length: target.sets }, () => set(w, lo)),
      coach: { kind: wasRestricted ? 'wiedereinstieg' : 'pause', note: `${why}: −10 % auf ${kg(w)}, ${lo} Wdh. – letztes Mal ${summary}` },
    }
  }

  // Halteübung: alle Sätze voll gehalten → +5 s vorschlagen
  if (hold) {
    const holdSec = ex.holdSec ?? 60
    const all = last.sets.length >= target.sets && last.sets.every((s) => s.reps >= holdSec)
    return all
      ? { sets: repeatLast(target.sets), coach: { kind: 'halten', note: `Alle Sätze ${holdSec} s gehalten – nächstes Mal ${holdSec + HOLD_STEP_SEC} s?` } }
      : { sets: repeatLast(target.sets), coach: { kind: 'gleich', note: `Ziel: ${target.sets} × ${holdSec} s halten – letztes Mal ${last.sets.map((s) => s.reps).join(', ')} s` } }
  }

  const rating = last.rating
  const threshold = rating === 'leicht' ? hi - 1 : hi

  // Ohne Gewicht: Wdh. → Satz → schwerere Variante
  if (topWeight === null) {
    const n = Math.max(target.sets, last.sets.length)
    const reps = Array.from({ length: n }, (_, i) => (last.sets[i] ?? last.sets[last.sets.length - 1]).reps)
    const allTop = last.sets.length >= target.sets && last.sets.every((s) => s.reps >= threshold)
    if (rating === 'schwer') {
      return { sets: reps.map((r) => set(null, r)), coach: { kind: 'gleich', note: `Letztes Mal „schwer“ – gleich bleiben: ${summary}` } }
    }
    if (!allTop) {
      return { sets: reps.map((r) => set(null, Math.min(hi, r + 1))), coach: { kind: 'wdh', note: `+1 Wdh. je Satz – letztes Mal ${summary}` } }
    }
    if (n < MAX_BODYWEIGHT_SETS) {
      return { sets: [...reps.map((r) => set(null, Math.max(r, hi))), set(null, lo)], coach: { kind: 'satz', note: `+1 Satz – letztes Mal ${summary}` } }
    }
    return {
      sets: reps.map((r) => set(null, r)),
      coach: { kind: 'variante', note: `${summary} geschafft – Zeit für eine schwerere Variante („Übung tauschen“)` },
    }
  }

  // Mit Gewicht: alle Sätze am oberen Ende → + ein Gewichtsschritt, sonst +1 Wdh. je Satz
  const workSets = last.sets.filter((s) => s.weightKg === topWeight)
  const allTop = workSets.length >= target.sets && workSets.every((s) => s.reps >= threshold)
  if (rating === 'schwer') {
    return { sets: repeatLast(target.sets), coach: { kind: 'gleich', note: `Letztes Mal „schwer“ – Gewicht bleibt: ${summary}` } }
  }
  if (allTop) {
    const next = roundToStep(topWeight + step, step)
    const pct = Math.round((step / topWeight) * 100)
    const small = pct > 10 ? ` (kleinster Schritt, +${pct} %)` : ''
    return {
      sets: Array.from({ length: target.sets }, () => set(next, lo)),
      coach: { kind: 'gewicht', note: `↑ ${kg(next)}${small} – letztes Mal ${summary}` },
    }
  }
  const reps = Array.from({ length: target.sets }, (_, i) => (workSets[i] ?? workSets[workSets.length - 1] ?? last.sets[0]).reps)
  return {
    sets: reps.map((r) => set(topWeight, Math.min(hi, r + 1))),
    coach: { kind: 'wdh', note: `+1 Wdh. je Satz bei ${kg(topWeight)} – letztes Mal ${summary}` },
  }
}
