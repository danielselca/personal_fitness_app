import type { LibraryIndexEntry } from '../../library/types.ts'
import { count, formatMmSs, formatNumber } from '../../lib/format.ts'
import { exerciseMeta, visibleLibrary } from '../library.ts'
import { activeRestrictions, dayKey, exerciseHits, hitsFor, restrictionLabel } from '../restrictions.ts'
import type { Muscle } from '../taxonomy.ts'
import type { AppData, Exercise, Template } from '../types.ts'
import { PULL_PATTERNS, ratioText, weekBalance, type Balance } from './balance.ts'
import { exerciseTrends, STAGNATION_SESSIONS } from './consistency.ts'
import { deloadAdvice, type DeloadAdvice } from './deload.ts'
import { FREQUENCY_TARGET, groupFrequencies, type GroupFrequency } from './frequency.ts'
import { restStats, type RestStats } from './rest.ts'
import { groupVolumes, MUSCLE_GROUPS, muscleSets, restrictedGroups, VOLUME_TARGET, type GroupVolume } from './volume.ts'
import { hardSets, weekRange, workoutsInWeek, type WeekRange } from './week.ts'

/**
 * Wochencheck (Coach II): vier Ampeln mit Begründung, Gesamturteil und bis zu drei Vorschläge
 * für die nächste Woche. Alles sind Faustregeln; die App ändert nichts automatisch.
 */

export type LightLevel = 'gruen' | 'gelb' | 'rot' | 'grau'
export type LightKey = 'regelmaessigkeit' | 'fortschritt' | 'volumen' | 'dichte'

export interface Light {
  key: LightKey
  label: string
  level: LightLevel
  text: string
}

export type SuggestionTarget = { kind: 'template'; id: string } | { kind: 'exercise'; id: string } | { kind: 'library'; id: string }

export interface Suggestion {
  text: string
  why: string
  target?: SuggestionTarget
}

export type Overall = 'gut' | 'okay' | 'ausbaufaehig'
export const OVERALL_LABEL: Record<Overall, string> = { gut: 'gut', okay: 'okay', ausbaufaehig: 'ausbaufähig' }

export interface WeekCheck {
  range: WeekRange
  /** Laufende Woche (noch nicht vorbei). */
  current: boolean
  workouts: number
  goal: number
  lights: Light[]
  overall: Overall | null
  volumes: GroupVolume[]
  perMuscle: Map<Muscle, number>
  target: { min: number; max: number }
  frequencies: GroupFrequency[]
  balance: Balance
  rest: RestStats
  /** „Schulter · bis 15.10.2026“ für jede aktive Schonung. */
  restricted: string[]
  unassigned: Exercise[]
  deload: DeloadAdvice | null
  suggestions: Suggestion[]
}

export const MAX_SUGGESTIONS = 3
const SCORE: Record<Exclude<LightLevel, 'grau'>, number> = { gruen: 2, gelb: 1, rot: 0 }

export function overallOf(lights: Light[]): Overall | null {
  const rated = lights.filter((l) => l.level !== 'grau')
  if (rated.length === 0) return null
  const avg = rated.reduce((s, l) => s + SCORE[l.level as Exclude<LightLevel, 'grau'>], 0) / rated.length
  const red = rated.filter((l) => l.level === 'rot').length
  // Eine rote Ampel verhindert „gut“, zwei ergeben „ausbaufähig“
  if (red >= 2) return 'ausbaufaehig'
  const overall: Overall = avg >= 1.5 ? 'gut' : avg >= 0.75 ? 'okay' : 'ausbaufaehig'
  return red === 1 && overall === 'gut' ? 'okay' : overall
}

/** Vorlagen, an denen Vorschläge ansetzen: Tage des aktiven Programms, sonst die Vorlagen der Woche. */
function planTemplates(data: AppData, weekTemplateIds: string[]): Template[] {
  const program = data.programs.find((p) => p.id === data.settings.activeProgramId)
  const ids = program ? program.days.map((d) => d.templateId) : weekTemplateIds
  return [...new Set(ids)].map((id) => data.templates.find((t) => t.id === id)).filter((t): t is Template => !!t)
}

export function weekCheck(data: AppData, now: Date, offset = 0): WeekCheck {
  const range = weekRange(now, offset)
  const current = offset === 0
  const goal = data.settings.weeklyGoal
  const week = workoutsInWeek(data.workouts, range)
  const active = activeRestrictions(data.restrictions, dayKey(now))
  const restrictedMap = restrictedGroups(active)
  const restrictedIds = new Set(restrictedMap.keys())
  const { sets: hard, unassigned } = hardSets(week, data.exercises)
  const target = VOLUME_TARGET[data.settings.profile?.goal ?? 'muskelaufbau']
  const volumes = groupVolumes(hard, data.settings.profile?.goal ?? 'muskelaufbau', restrictedMap)
  const perMuscle = muscleSets(hard)
  const frequencies = groupFrequencies(hard, restrictedIds)
  const balance = weekBalance(hard)
  const rest = restStats(week, data.exercises, data.settings)
  // Laufende Woche gilt als abgeschlossen, sobald das Wochenziel erreicht ist
  const complete = !current || week.length >= goal
  const isRestricted = (ex: Exercise) => exerciseHits(ex, active).length > 0
  const exById = new Map(data.exercises.map((e) => [e.id, e]))

  // Fortschritt: Übungen dieser Woche, Stand am Wochenende
  const until = range.end.getTime()
  const trends = exerciseTrends(
    data.workouts.filter((w) => w.status === 'done' && w.finishedAt && new Date(w.finishedAt).getTime() < until),
    data.exercises,
  ).filter((t) => new Date(t.date).getTime() >= range.start.getTime() && !isRestricted(t.exercise))
  const up = trends.filter((t) => t.kind === 'gesteigert')
  const stuck = trends.filter((t) => t.kind === 'stagniert')
  const less = trends.filter((t) => t.kind === 'weniger')

  const lights: Light[] = []

  // Regelmäßigkeit
  {
    const n = week.length
    const text = `${n} von ${goal} Trainings${current && n < goal ? ` – noch ${goal - n} diese Woche` : ''}`
    const level: LightLevel = n >= goal ? 'gruen' : current || (n > 0 && n >= goal - 1) ? 'gelb' : 'rot'
    lights.push({ key: 'regelmaessigkeit', label: 'Regelmäßigkeit', level, text })
  }

  // Fortschritt
  {
    const parts: string[] = []
    if (up.length) parts.push(`${count(up.length, 'Übung', 'Übungen')} gesteigert`)
    if (stuck.length) parts.push(`${stuck[0].exercise.name} seit ${STAGNATION_SESSIONS} Einheiten gleich${stuck.length > 1 ? ` (+${stuck.length - 1})` : ''}`)
    if (less.length) parts.push(`${count(less.length, 'Übung', 'Übungen')} weniger`)
    const bad = stuck.length + less.length
    const level: LightLevel = trends.length === 0 ? 'grau' : bad === 0 ? 'gruen' : up.length >= bad ? 'gelb' : 'rot'
    const text = trends.length === 0 ? 'Noch keine Vergleichswerte' : parts.length ? parts.join(', ') : `${count(trends.length, 'Übung', 'Übungen')} wie zuletzt`
    lights.push({ key: 'fortschritt', label: 'Fortschritt', level, text })
  }

  // Volumen & Balance
  const rated = volumes.filter((v) => v.status !== 'geschont')
  const under = rated.filter((v) => v.status === 'unter').sort((a, b) => a.sets - b.sets)
  // Gar nicht trainierte Gruppen fallen schon beim Volumen auf; hier nur „nur an einem Tag“
  const lowFreq = week.length >= 2 ? frequencies.filter((f) => !f.restricted && f.days > 0 && f.days < FREQUENCY_TARGET) : []
  const pushHeavy = balance.pushHeavy && !restrictedIds.has('schultern')
  {
    const parts: string[] = []
    if (under.length) {
      parts.push(`${under.slice(0, 2).map((v) => `${v.label} ${formatNumber(v.sets)}`).join(' · ')} ${under.length > 2 ? `(+${under.length - 2}) ` : ''}Sätze (Ziel ≥ ${target.min})`)
    }
    if (pushHeavy) parts.push(balance.ratio === null ? 'nur Drücken, kein Ziehen' : `Drücken : Ziehen = ${ratioText(balance.ratio)}`)
    if (balance.lacking) parts.push(balance.lacking === 'unterkoerper' ? 'wenig Unterkörper' : 'wenig Oberkörper')
    if (complete && lowFreq.length) parts.push(`${lowFreq.map((f) => f.label).join(', ')} nur 1×`)
    const issues = under.length + (pushHeavy ? 1 : 0) + (balance.lacking ? 1 : 0) + (complete ? lowFreq.length : 0)
    const level: LightLevel = hard.length === 0 ? 'grau' : issues === 0 ? 'gruen' : complete && under.length >= 4 ? 'rot' : 'gelb'
    const text = hard.length === 0 ? 'Keine Kraftsätze' : issues === 0 ? `Alle Gruppen im Ziel (${target.min}–${target.max} Sätze)` : parts.join(' · ')
    lights.push({ key: 'volumen', label: 'Volumen & Balance', level, text })
  }

  // Dichte
  {
    const dur = rest.avgDurationMin ? `Ø ${rest.avgDurationMin} min` : ''
    const level: LightLevel = rest.count === 0 ? 'grau' : rest.tooLong ? 'gelb' : 'gruen'
    const text = rest.count === 0 ? ['Keine Pausen gemessen', dur].filter(Boolean).join(' · ') : [`Pausen Ø ${formatMmSs(rest.avgSec)} (Soll ${formatMmSs(rest.targetSec)})`, dur].filter(Boolean).join(' · ')
    lights.push({ key: 'dichte', label: 'Dichte', level, text })
  }

  // Vorschläge
  const deload = deloadAdvice(data.workouts, data.exercises, range, active)
  const plan = planTemplates(data, week.map((w) => w.templateId).filter((id): id is string => !!id))
  const inPlan = new Set(plan.flatMap((t) => t.entries.map((e) => e.exerciseId)))
  const trainedIds = new Set(week.flatMap((w) => w.entries.map((e) => e.exerciseId)))
  const ownIds = new Set(data.exercises.flatMap((e) => (e.libraryId ? [e.libraryId] : [])))
  const usable = (ex: Exercise | undefined): ex is Exercise => !!ex && !ex.archived && !isRestricted(ex)
  const freeLibrary = (pred: (l: LibraryIndexEntry) => boolean) =>
    visibleLibrary().filter((l) => l.category === 'kraft' && !ownIds.has(l.id) && hitsFor(l, active).length === 0 && pred(l))

  const suggestions: Suggestion[] = []
  if (deload) {
    suggestions.push({ text: 'Leichtere Woche einlegen', why: `${deload.reason}. Faustregel: etwa halb so viele Sätze oder −10 % Gewicht, danach weiter wie gewohnt.` })
  }

  if (complete && !deload) {
    for (const v of under.slice(0, 2)) {
      const group = MUSCLE_GROUPS.find((g) => g.id === v.id)!
      const hits = (primary: readonly Muscle[]) => primary.some((m) => (group.muscles as readonly Muscle[]).includes(m))
      const why = `${v.label} ${formatNumber(v.sets)} von ${target.min} Sätzen`
      const inTemplate = plan
        .flatMap((t) => t.entries.map((e) => ({ t, ex: exById.get(e.exerciseId) })))
        .find(({ ex }) => usable(ex) && hits(exerciseMeta(ex).muscles.primary))
      if (inTemplate) {
        suggestions.push({ text: `${inTemplate.t.name}: + 1 Satz ${inTemplate.ex!.name}`, why, target: { kind: 'template', id: inTemplate.t.id } })
        continue
      }
      const own = data.exercises.find((ex) => usable(ex) && exerciseMeta(ex).category !== 'physio' && hits(exerciseMeta(ex).muscles.primary))
      if (own) {
        suggestions.push({ text: `${own.name} einplanen`, why, target: { kind: 'exercise', id: own.id } })
        continue
      }
      const lib = freeLibrary((l) => hits(l.muscles.primary))[0]
      if (lib) suggestions.push({ text: `${lib.name} ergänzen`, why, target: { kind: 'library', id: lib.id } })
    }
  }

  if (pushHeavy && complete) {
    const why = balance.ratio === null ? 'Nur Drücken, kein Ziehen' : `Drücken : Ziehen = ${ratioText(balance.ratio)}`
    const pullRank = (p?: string) => (p === 'reverse-fliegende' ? 0 : p === 'ziehen-horizontal' ? 1 : 2)
    const own = data.exercises
      .filter((ex) => usable(ex) && !inPlan.has(ex.id) && !trainedIds.has(ex.id))
      .filter((ex) => {
        const p = exerciseMeta(ex).pattern
        return !!p && PULL_PATTERNS.includes(p)
      })
      .sort((a, b) => pullRank(exerciseMeta(a).pattern) - pullRank(exerciseMeta(b).pattern))[0]
    if (own) suggestions.push({ text: `${own.name} ergänzen (mehr Ziehen)`, why, target: { kind: 'exercise', id: own.id } })
    else {
      const lib = freeLibrary((l) => PULL_PATTERNS.includes(l.pattern)).sort((a, b) => pullRank(a.pattern) - pullRank(b.pattern))[0]
      if (lib) suggestions.push({ text: `${lib.name} ergänzen (mehr Ziehen)`, why, target: { kind: 'library', id: lib.id } })
    }
  }

  for (const t of stuck) {
    const why = `${t.text} (Faustregel)`
    const hit = plan.flatMap((tpl) => tpl.entries.map((e) => ({ tpl, e }))).find(({ e }) => e.exerciseId === t.exercise.id && e.repMin !== undefined && e.repMax !== undefined)
    if (hit && hit.e.repMin! - 2 >= 4) {
      const lo = hit.e.repMin!
      const hi = hit.e.repMax!
      suggestions.push({ text: `${t.exercise.name}: ${lo - 2}–${hi - 2} statt ${lo}–${hi} Wdh.`, why, target: { kind: 'template', id: hit.tpl.id } })
    } else {
      suggestions.push({ text: `${t.exercise.name}: Übung tauschen oder Wdh.-Bereich wechseln`, why, target: { kind: 'exercise', id: t.exercise.id } })
    }
  }

  if (complete && !deload) {
    for (const f of lowFreq) {
      suggestions.push({ text: `${f.label} an einem zweiten Tag trainieren`, why: `${f.label} diese Woche an ${count(f.days, 'Tag', 'Tagen')}, Faustregel ≥ ${FREQUENCY_TARGET}×` })
    }
    if (balance.lacking) {
      const half = balance.lacking === 'unterkoerper' ? 'Unterkörper' : 'Oberkörper'
      const share = Math.round(((balance.lacking === 'unterkoerper' ? balance.lower : balance.upper) / (balance.upper + balance.lower)) * 100)
      suggestions.push({ text: `Mehr ${half} einplanen`, why: `${half} nur ${share} % der Sätze` })
    }
  }

  return {
    range,
    current,
    workouts: week.length,
    goal,
    lights,
    overall: overallOf(lights),
    volumes,
    perMuscle,
    target,
    frequencies,
    balance,
    rest,
    restricted: active.map(restrictionLabel),
    unassigned,
    deload,
    suggestions: suggestions.slice(0, MAX_SUGGESTIONS),
  }
}
