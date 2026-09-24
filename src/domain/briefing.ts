import { formatDate, formatNumber } from '../lib/format.ts'
import { exerciseTrends } from './coach/consistency.ts'
import { OVERALL_LABEL, weekCheck } from './coach/hints.ts'
import { lastSummary } from './coach/progression.ts'
import { exerciseRecords } from './coach/records.ts'
import { groupVolumes } from './coach/volume.ts'
import { hardSets, weekRange, workoutsInWeek } from './coach/week.ts'
import { exerciseMeta } from './library.ts'
import { GOAL_LABEL } from './programs.ts'
import { PROGRAM_FORMAT } from './programJson.ts'
import { activeRestrictions, dayKey, restrictionLabel } from './restrictions.ts'
import { workoutDurationMin } from './stats.ts'
import { LEVEL_LABEL } from './taxonomy.ts'
import type { AppData, Exercise, Template } from './types.ts'

/**
 * Brief an Claude (Roadmap Schritt 22): deutscher Text mit Profil, Programm, geschonten Bereichen,
 * Kennzahlen der letzten Wochen, Übungen und Befunden des Coachs, dazu das Antwortformat für
 * Programmvorschläge. Keine Namen, keine Trainingsnotizen; Körpergewicht nur auf Wunsch.
 * Wird bei Bedarf gekürzt, damit er in eine Nachricht passt.
 */

export const BRIEF_MAX_CHARS = 6000
export const QUESTION_MAX_CHARS = 500
const DEFAULT_QUESTION = 'Wie kann ich mein Training verbessern?'

export interface BriefOptions {
  question?: string
  includeBodyWeight?: boolean
  now: Date
}

interface Detail {
  weeks: number
  exercises: number
  coach: boolean
}

const LEVELS: Detail[] = [
  { weeks: 8, exercises: 15, coach: true },
  { weeks: 8, exercises: 10, coach: true },
  { weeks: 4, exercises: 8, coach: true },
  { weeks: 4, exercises: 5, coach: true },
  { weeks: 4, exercises: 5, coach: false },
  { weeks: 4, exercises: 0, coach: false },
]

const LIGHT_WORD = { gruen: 'grün', gelb: 'gelb', rot: 'rot', grau: 'keine Daten' } as const
const round = (n: number) => formatNumber(Math.round(n * 10) / 10)

function entryLine(ex: Exercise | undefined, e: Template['entries'][number]): string {
  if (!ex) return ''
  const hold = ex.mode === 'hold'
  const reps = hold ? `${ex.holdSec ?? 60} s halten` : e.repMin !== undefined ? `${e.repMin === e.repMax ? e.repMin : `${e.repMin}–${e.repMax}`} Wdh.` : 'Wdh. frei'
  const rest = e.restSec ?? ex.defaultRestSec
  const physio = exerciseMeta(ex).category === 'physio' ? ' (Physio)' : ''
  return `- ${ex.name}${physio} [${ex.id}] – ${e.sets} × ${reps}${rest ? `, Pause ${rest} s` : ''}`
}

function templateBlock(t: Template, exercises: Map<string, Exercise>): string[] {
  return [`${t.name}:`, ...t.entries.map((e) => entryLine(exercises.get(e.exerciseId), e)).filter(Boolean)]
}

function section(title: string, lines: string[]): string {
  return lines.length ? `## ${title}\n${lines.join('\n')}` : ''
}

function build(data: AppData, opts: BriefOptions, d: Detail): string {
  const { now } = opts
  const exById = new Map(data.exercises.map((e) => [e.id, e]))
  const s = data.settings
  const question = (opts.question ?? '').trim().slice(0, QUESTION_MAX_CHARS) || DEFAULT_QUESTION
  const parts: string[] = []

  parts.push(
    `# Mein Training – Bitte um Rat\nIch trainiere mit meiner Fitness-App und hätte gern deine Einschätzung als erfahrener Personal Trainer. Die Daten unten hat die App zusammengestellt (Stand ${formatDate(now.toISOString())}).\n\nMeine Frage: ${question}`,
  )

  // Profil
  const profile = [
    `- Ziel: ${s.profile ? GOAL_LABEL[s.profile.goal] : 'nicht angegeben'}`,
    `- Erfahrung: ${s.profile ? LEVEL_LABEL[s.profile.experience] : 'nicht angegeben'}`,
    `- Geplant: ${s.weeklyGoal} Trainings pro Woche`,
  ]
  if (opts.includeBodyWeight) {
    const last = [...data.bodyLog].sort((a, b) => (a.date < b.date ? 1 : -1))[0]
    if (last) profile.push(`- Körpergewicht: ${formatNumber(last.weightKg)} kg (${formatDate(`${last.date}T12:00:00`)})`)
  }
  parts.push(section('Profil', profile))

  // Programm oder zuletzt genutzte Vorlagen
  const program = data.programs.find((p) => p.id === s.activeProgramId)
  if (program) {
    const lines = program.days.flatMap((day) => {
      const t = data.templates.find((x) => x.id === day.templateId)
      return t ? templateBlock(t, exById) : []
    })
    parts.push(section(`Aktives Programm: ${program.name} (${program.sessionsPerWeek}× pro Woche, ${GOAL_LABEL[program.goal]})`, lines))
  } else {
    const used = [...new Set(data.workouts.filter((w) => w.status === 'done' && w.templateId).sort((a, b) => (a.finishedAt! < b.finishedAt! ? 1 : -1)).map((w) => w.templateId!))]
      .slice(0, 3)
      .map((id) => data.templates.find((t) => t.id === id))
      .filter((t): t is Template => !!t)
    parts.push(used.length ? section('Kein Programm aktiv – zuletzt genutzte Vorlagen', used.flatMap((t) => templateBlock(t, exById))) : '## Programm\nKein Programm aktiv, bisher freies Training.')
  }

  // Geschonte Bereiche
  const active = activeRestrictions(data.restrictions, dayKey(now))
  parts.push(section('Geschonte Bereiche (bitte berücksichtigen)', active.map((r) => `- ${restrictionLabel(r)}${r.note ? ` – ${r.note}` : ''}`)))

  // Kennzahlen der letzten Wochen (abgeschlossene Wochen, dazu die laufende)
  const ranges = Array.from({ length: d.weeks }, (_, i) => weekRange(now, i - d.weeks))
  const perWeek = ranges.map((r) => workoutsInWeek(data.workouts, r))
  const current = workoutsInWeek(data.workouts, weekRange(now))
  const inRange = perWeek.flat()
  if (inRange.length + current.length === 0) {
    parts.push(`## Letzte ${d.weeks} Wochen\nNoch keine abgeschlossenen Trainings.`)
  } else {
    const lines = [`- Trainings je Woche (älteste zuerst): ${perWeek.map((w) => w.length).join(', ')}; laufende Woche bisher ${current.length}`]
    const durations = inRange.map(workoutDurationMin).filter((m): m is number => m !== null && m > 0)
    if (durations.length) lines.push(`- Ø Dauer: ${Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)} min`)
    const trainedWeeks = perWeek.filter((w) => w.length > 0).length
    if (trainedWeeks > 0) {
      const vols = groupVolumes(hardSets(inRange, data.exercises).sets, s.profile?.goal ?? 'muskelaufbau')
      lines.push(`- Ø harte Sätze je Muskelgruppe pro Trainingswoche: ${vols.map((v) => `${v.label} ${round(v.sets / trainedWeeks)}`).join(', ')}`)
    }
    parts.push(section(`Letzte ${d.weeks} Wochen`, lines))
  }

  // Übungen: meist trainierte zuerst
  if (d.exercises > 0) {
    const since = ranges[0].start.getTime()
    const recent = data.workouts.filter((w) => w.status === 'done' && w.finishedAt && new Date(w.finishedAt).getTime() >= since)
    const sessions = new Map<string, number>()
    for (const w of recent) for (const id of new Set(w.entries.filter((e) => e.sets.some((x) => x.done)).map((e) => e.exerciseId))) sessions.set(id, (sessions.get(id) ?? 0) + 1)
    const trends = new Map(exerciseTrends(data.workouts, data.exercises).map((t) => [t.exercise.id, t]))
    const top = [...sessions.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, d.exercises)
      .map(([id, n]) => ({ ex: exById.get(id), n }))
      .filter((x): x is { ex: Exercise; n: number } => !!x.ex)
    const lines = top.map(({ ex, n }) => {
      const hold = ex.mode === 'hold'
      const last = recent
        .filter((w) => w.entries.some((e) => e.exerciseId === ex.id && e.sets.some((x) => x.done)))
        .sort((a, b) => (a.finishedAt! < b.finishedAt! ? 1 : -1))[0]
      const sets = last.entries
        .filter((e) => e.exerciseId === ex.id)
        .flatMap((e) => e.sets)
        .filter((x) => x.done && x.reps !== null)
        .map((x) => ({ weightKg: x.weightKg, reps: x.reps as number }))
      const rec = exerciseRecords(data.workouts, ex.id)
      const best = rec.maxWeight ? `bestes Gewicht ${formatNumber(rec.maxWeight.value)} kg${rec.best1RM ? `, 1RM ~${round(rec.best1RM.value)} kg` : ''}` : rec.maxReps ? `Bestwert ${rec.maxReps.value}${hold ? ' s' : ' Wdh.'}` : ''
      const trend = trends.get(ex.id)
      const bits = [
        `${n}× in ${d.weeks} Wochen`,
        sets.length ? `zuletzt ${formatDate(last.finishedAt!)}: ${lastSummary(sets)}${hold ? ' s' : ''}` : '',
        best,
        trend ? `Trend: ${trend.kind === 'stagniert' ? 'steht' : trend.kind}` : '',
      ].filter(Boolean)
      const physio = exerciseMeta(ex).category === 'physio' ? ' (Physio)' : ''
      return `- ${ex.name}${physio} [${ex.id}]: ${bits.join('; ')}`
    })
    parts.push(section('Übungen (meist trainierte zuerst)', lines))
  }

  // Befunde des Coachs
  if (d.coach) {
    const lastWeek = weekCheck(data, now, -1)
    const check = lastWeek.workouts > 0 ? lastWeek : weekCheck(data, now, 0)
    if (check.workouts > 0) {
      const lines = [
        ...check.lights.map((l) => `- ${l.label} (${LIGHT_WORD[l.level]}): ${l.text}`),
        ...check.suggestions.map((sg) => `- Vorschlag: ${sg.text} (${sg.why})`),
      ]
      const title = `Befunde des App-Coachs (Wochencheck ${check.range.label}${check.overall ? `, gesamt ${OVERALL_LABEL[check.overall]}` : ''}; Faustregeln)`
      parts.push(section(title, lines))
    }
  }

  // Antwortformat
  parts.push(
    [
      '## Antwortformat für Programme',
      'Wenn du ein Programm vorschlägst, hänge es bitte zusätzlich als JSON-Block an, damit ich es direkt in die App übernehmen kann:',
      '```json',
      `{ "format": "${PROGRAM_FORMAT}", "name": "Ganzkörper Herbst", "sessionsPerWeek": 3, "goal": "muskelaufbau",`,
      '  "days": [ { "name": "A", "exercises": [',
      '    { "id": "ex-lat-zug", "name": "Lat-Zug", "sets": 3, "reps": [8, 12], "restSec": 90, "note": "Schulterblätter tief" },',
      '    { "name": "Unterarmstütz", "sets": 3, "holdSec": 30 } ] } ] }',
      '```',
      'Regeln: Für meine Übungen die ID aus den eckigen Klammern als "id" übernehmen, neue Übungen nur mit deutschem "name". "reps" als [von, bis]; Halteübungen mit "holdSec" statt "reps"; "restSec" in Sekunden; "note" optional. 1–7 Tage mit je höchstens 15 Übungen; "goal" ist "muskelaufbau" oder "fitness".',
    ].join('\n'),
  )

  return parts.filter(Boolean).join('\n\n')
}

/** Brief bauen; kürzt schrittweise (weniger Übungen, weniger Wochen, ohne Coach-Befunde). */
export function buildBrief(data: AppData, opts: BriefOptions): string {
  let text = ''
  for (const level of LEVELS) {
    text = build(data, opts, level)
    if (text.length <= BRIEF_MAX_CHARS) return text
  }
  return text
}
