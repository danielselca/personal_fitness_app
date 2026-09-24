import { adoptExercise } from './adopt.ts'
import { newId } from './ids.ts'
import { libraryEntry, visibleLibrary } from './library.ts'
import { createProgramData } from './programs.ts'
import { searchKeys } from './search.ts'
import type { AppData, Exercise, Program, ProgramGoal, TemplateEntry } from './types.ts'

/**
 * Programm-Import (Roadmap Schritt 22): Claude liefert Programmvorschläge zusätzlich als JSON im
 * Format `fitness-app-programm/v1`. Die App findet den Block in der eingefügten Antwort, prüft ihn,
 * ordnet die Übungen zu und legt ein eigenes Programm an – eine normale Kopie wie jedes andere.
 */

export const PROGRAM_FORMAT = 'fitness-app-programm/v1'

export const LIMITS = {
  nameMax: 60,
  days: [1, 7],
  exercises: [1, 15],
  sets: [1, 10],
  reps: [1, 50],
  holdSec: [5, 600],
  restSec: [0, 600],
  noteMax: 200,
} as const

export interface ImportExercise {
  id?: string
  library?: string
  name: string
  sets: number
  repMin?: number
  repMax?: number
  holdSec?: number
  restSec?: number
  note?: string
}

export interface ImportDay {
  name: string
  exercises: ImportExercise[]
}

export interface ImportProgram {
  name: string
  sessionsPerWeek: number
  goal?: ProgramGoal
  days: ImportDay[]
}

export type ParseResult = { ok: true; program: ImportProgram } | { ok: false; errors: string[] }

/** Alle JSON-Objekte der obersten Ebene im Text (auch in Fließtext oder ```json-Blöcken). */
function jsonObjects(text: string): string[] {
  const out: string[] = []
  let depth = 0
  let start = -1
  let inString = false
  let escaped = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inString) {
      if (escaped) escaped = false
      else if (c === '\\') escaped = true
      else if (c === '"') inString = false
      continue
    }
    if (c === '"' && depth > 0) inString = true
    else if (c === '{') {
      if (depth === 0) start = i
      depth++
    } else if (c === '}' && depth > 0) {
      depth--
      if (depth === 0) out.push(text.slice(start, i + 1))
    }
  }
  return out
}

/**
 * Programm-Objekt im eingefügten Text finden: das letzte JSON-Objekt mit dem passenden `format`.
 * `invalid`: Der Text nennt das Format, aber das JSON ist fehlerhaft (z. B. abgeschnitten).
 */
export function extractProgramJson(text: string): { value: Record<string, unknown> } | { error: 'none' | 'invalid' } {
  // typografische Anführungszeichen (beim Kopieren aus Chats möglich) zurückwandeln
  const clean = text.replace(/[“”„]/g, '"')
  let found: Record<string, unknown> | null = null
  for (const raw of jsonObjects(clean)) {
    try {
      const v = JSON.parse(raw) as unknown
      if (v && typeof v === 'object' && !Array.isArray(v) && (v as Record<string, unknown>).format === PROGRAM_FORMAT) found = v as Record<string, unknown>
    } catch {
      /* kein gültiges JSON – nächstes Objekt */
    }
  }
  if (found) return { value: found }
  return { error: clean.includes(PROGRAM_FORMAT) ? 'invalid' : 'none' }
}

const isInt = (v: unknown): v is number => typeof v === 'number' && Number.isInteger(v)
const inRange = (v: number, [lo, hi]: readonly [number, number]) => v >= lo && v <= hi
const str = (v: unknown) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '')

/** Wdh. als Zahl, [von, bis] oder Text „8–12“. */
function parseReps(v: unknown): [number, number] | null | 'invalid' {
  if (v === undefined || v === null) return null
  let pair: [number, number] | null = null
  if (isInt(v)) pair = [v, v]
  else if (Array.isArray(v) && v.length === 2 && isInt(v[0]) && isInt(v[1])) pair = [v[0], v[1]]
  else if (typeof v === 'string') {
    const m = v.trim().match(/^(\d+)\s*(?:[-–—]|bis)\s*(\d+)$/) ?? v.trim().match(/^(\d+)$/)
    if (m) pair = [Number(m[1]), Number(m[2] ?? m[1])]
  }
  if (!pair || pair[0] > pair[1] || !inRange(pair[0], LIMITS.reps) || !inRange(pair[1], LIMITS.reps)) return 'invalid'
  return pair
}

/** Eingefügten Text prüfen und in ein Programm übersetzen; Fehler auf Deutsch, mit Tag und Übung. */
export function parseProgramText(text: string): ParseResult {
  const found = extractProgramJson(text)
  if ('error' in found) {
    return {
      ok: false,
      errors: [
        found.error === 'invalid'
          ? 'Der Programm-Block ist kein gültiges JSON (vielleicht unvollständig kopiert).'
          : `Kein Programm gefunden. Claude soll den Vorschlag als JSON-Block mit "format": "${PROGRAM_FORMAT}" anhängen.`,
      ],
    }
  }
  const v = found.value
  const errors: string[] = []
  const name = str(v.name)
  if (!name || name.length > LIMITS.nameMax) errors.push(`Programmname fehlt oder ist zu lang (höchstens ${LIMITS.nameMax} Zeichen).`)
  const goal: ProgramGoal | undefined = v.goal === 'muskelaufbau' || v.goal === 'fitness' ? v.goal : undefined
  const rawDays = Array.isArray(v.days) ? v.days : []
  if (!inRange(rawDays.length, LIMITS.days)) errors.push(`Ein Programm braucht ${LIMITS.days[0]} bis ${LIMITS.days[1]} Tage.`)

  const days: ImportDay[] = rawDays.slice(0, LIMITS.days[1]).map((d: unknown, di: number) => {
    const day = (d && typeof d === 'object' ? d : {}) as Record<string, unknown>
    const dayName = str(day.name).slice(0, 40) || `Tag ${di + 1}`
    const at = `Tag ${di + 1} („${dayName}“)`
    const rawEx = Array.isArray(day.exercises) ? day.exercises : []
    if (!inRange(rawEx.length, LIMITS.exercises)) errors.push(`${at}: ${LIMITS.exercises[0]} bis ${LIMITS.exercises[1]} Übungen erwartet.`)
    const exercises = rawEx.slice(0, LIMITS.exercises[1]).map((x: unknown, ei: number): ImportExercise => {
      const e = (x && typeof x === 'object' ? x : {}) as Record<string, unknown>
      const where = `${at}, Übung ${ei + 1}`
      const exName = str(e.name)
      if (!exName) errors.push(`${where}: Name fehlt.`)
      else if (exName.length > LIMITS.nameMax) errors.push(`${where}: Name ist zu lang.`)
      const sets = e.sets === undefined ? 3 : e.sets
      if (!isInt(sets) || !inRange(sets, LIMITS.sets)) errors.push(`${where} (${exName || '?'}): Sätze müssen ${LIMITS.sets[0]}–${LIMITS.sets[1]} sein.`)
      const reps = parseReps(e.reps)
      if (reps === 'invalid') errors.push(`${where} (${exName || '?'}): Wdh. als Zahl oder [von, bis] zwischen ${LIMITS.reps[0]} und ${LIMITS.reps[1]} angeben.`)
      const holdSec = e.holdSec
      if (holdSec !== undefined && (!isInt(holdSec) || !inRange(holdSec, LIMITS.holdSec))) errors.push(`${where} (${exName || '?'}): Haltedauer ${LIMITS.holdSec[0]}–${LIMITS.holdSec[1]} s.`)
      const restSec = e.restSec
      if (restSec !== undefined && (!isInt(restSec) || !inRange(restSec, LIMITS.restSec))) errors.push(`${where} (${exName || '?'}): Pause ${LIMITS.restSec[0]}–${LIMITS.restSec[1]} s.`)
      const note = str(e.note).slice(0, LIMITS.noteMax)
      return {
        id: typeof e.id === 'string' ? e.id : undefined,
        library: typeof e.library === 'string' ? e.library : undefined,
        name: exName,
        sets: isInt(sets) ? sets : 3,
        ...(Array.isArray(reps) ? { repMin: reps[0], repMax: reps[1] } : {}),
        ...(isInt(holdSec) ? { holdSec } : {}),
        ...(isInt(restSec) ? { restSec } : {}),
        ...(note ? { note } : {}),
      }
    })
    return { name: dayName, exercises }
  })

  if (errors.length) return { ok: false, errors }
  const spw = isInt(v.sessionsPerWeek) && inRange(v.sessionsPerWeek, [1, 7]) ? v.sessionsPerWeek : days.length
  return { ok: true, program: { name, sessionsPerWeek: spw, goal, days } }
}

export type MatchKind = 'eigene' | 'bibliothek' | 'neu'

export interface ExerciseMatch {
  kind: MatchKind
  /** Eigene Übung (kind 'eigene'). */
  exerciseId?: string
  /** Bibliothekseintrag (kind 'bibliothek'). */
  libraryId?: string
  /** Name, unter dem die Übung in der App erscheint. */
  name: string
}

const sameText = (a: string, b: string) => {
  const ka = searchKeys(a)
  return searchKeys(b).some((k) => k && ka.includes(k))
}

/**
 * Übung zuordnen: deine Übung per ID → Bibliotheks-ID → Name/Alias deiner Übungen → Name,
 * englischer Name oder Alias in der Bibliothek → sonst neue eigene Übung.
 * Aktive Übungen gehen vor archivierten.
 */
export function matchExercise(exercises: Exercise[], ie: ImportExercise): ExerciseMatch {
  const byActive = (a: Exercise, b: Exercise) => Number(a.archived) - Number(b.archived)
  const own = (ex: Exercise): ExerciseMatch => ({ kind: 'eigene', exerciseId: ex.id, name: ex.name })
  const fromLibrary = (id: string): ExerciseMatch => {
    const linked = [...exercises].sort(byActive).find((e) => e.libraryId === id || e.id === `ex-lib-${id}`)
    return linked ? own(linked) : { kind: 'bibliothek', libraryId: id, name: libraryEntry(id)!.name }
  }

  const byId = ie.id ? exercises.find((e) => e.id === ie.id) : undefined
  if (byId) return own(byId)
  if (ie.library && libraryEntry(ie.library)) return fromLibrary(ie.library)
  const byName = [...exercises].sort(byActive).find((e) => [e.name, ...e.aliases].some((n) => sameText(n, ie.name)))
  if (byName) return own(byName)
  const lib = visibleLibrary().find((l) => [l.name, l.en, ...l.aliases].some((n) => sameText(n, ie.name)))
  if (lib) return fromLibrary(lib.id)
  return { kind: 'neu', name: ie.name }
}

/** Name, der unter den vorhandenen Programmen noch frei ist: „Plan“, sonst „Plan (2)“ … */
export function uniqueProgramName(name: string, taken: string[]): string {
  if (!taken.includes(name)) return name
  let n = 2
  while (taken.includes(`${name} (${n})`)) n++
  return `${name} (${n})`
}

/**
 * Programm aus dem Import anlegen: Übungen zuordnen (Bibliothek per `adoptExercise`, damit dein
 * Verlauf weiterläuft), fehlende als eigene Übung neu anlegen, Tages-Vorlagen mit Sätzen,
 * Wdh.-Bereich, Pause und Notiz. Rein: gibt die neuen Daten zurück.
 */
export function importProgram(data: AppData, def: ImportProgram, at: string): { data: AppData; program: Program } {
  let exercises = data.exercises
  const days = def.days.map((day) => {
    const entries: TemplateEntry[] = []
    for (const ie of day.exercises) {
      const m = matchExercise(exercises, ie)
      let ex: Exercise | undefined
      if (m.kind === 'eigene') {
        ex = exercises.find((e) => e.id === m.exerciseId)
        if (ex?.archived) {
          const restored: Exercise = { ...ex, archived: false, updatedAt: at }
          exercises = exercises.map((e) => (e.id === restored.id ? restored : e))
          ex = restored
        }
      } else if (m.kind === 'bibliothek') {
        const r = adoptExercise(exercises, m.libraryId!, at, { useNameMatch: true })
        if (r.status !== 'unknown') {
          exercises = r.exercises
          ex = r.exercise
          // Neu übernommene Halteübung: Haltedauer aus dem Vorschlag (deine vorhandenen bleiben unverändert)
          if (r.status === 'created' && ex.mode === 'hold' && ie.holdSec) {
            const withHold: Exercise = { ...ex, holdSec: ie.holdSec }
            exercises = exercises.map((e) => (e.id === withHold.id ? withHold : e))
            ex = withHold
          }
        }
      }
      if (!ex) {
        ex = {
          id: newId('ex-'),
          name: ie.name,
          aliases: [],
          ...(ie.holdSec ? { mode: 'hold' as const, holdSec: ie.holdSec, noWeight: true } : {}),
          archived: false,
          createdAt: at,
          updatedAt: at,
        }
        exercises = [...exercises, ex]
      }
      const hold = ex.mode === 'hold'
      entries.push({
        exerciseId: ex.id,
        sets: ie.sets,
        ...(!hold && ie.repMin !== undefined ? { repMin: ie.repMin, repMax: ie.repMax } : {}),
        ...(ie.restSec !== undefined ? { restSec: ie.restSec } : {}),
        ...(ie.note ? { note: ie.note } : {}),
      })
    }
    return { name: day.name, entries }
  })
  return createProgramData(
    { ...data, exercises },
    {
      name: uniqueProgramName(def.name, data.programs.map((p) => p.name)),
      goal: def.goal ?? data.settings.profile?.goal ?? 'muskelaufbau',
      sessionsPerWeek: def.sessionsPerWeek,
      copiedFrom: 'claude',
    },
    days,
    at,
  )
}
