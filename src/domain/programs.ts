import { BUILTIN_PROGRAMS, type ProgramDefinition } from '../programs/builtin.ts'
import { adoptExercise } from './adopt.ts'
import { newId } from './ids.ts'
import { exerciseMeta } from './library.ts'
import { SEED_TEMPLATE_ID } from './seed.ts'
import type { AppData, Exercise, Program, ProgramGoal, Template, TemplateEntry, Workout } from './types.ts'

export const GOAL_LABEL: Record<ProgramGoal, string> = { muskelaufbau: 'Muskelaufbau', fitness: 'Fitness & Abnehmen' }

/** Wiederholungsbereich je Ziel (ACSM 2009: Hypertrophie 8–12, Kraftausdauer höher). */
export const GOAL_REPS: Record<ProgramGoal, [number, number]> = { muskelaufbau: [8, 12], fitness: [12, 15] }

export const PROGRAM_SETS = 3

export interface InstallOptions {
  goal: ProgramGoal
  /** Deine Physio-Übungen aus „Oberkörper“ als Block am Anfang jedes Tages. */
  physioBlock: boolean
}

export function builtinProgram(id: string): ProgramDefinition | undefined {
  return BUILTIN_PROGRAMS.find((p) => p.id === id)
}

/** Empfehlung nach Trainingstagen pro Woche: 2–3 → Ganzkörper, 4 → Oberkörper/Unterkörper, ≥ 5 → Push/Pull/Beine. */
export function recommendProgram(sessionsPerWeek: number): ProgramDefinition {
  return BUILTIN_PROGRAMS.find((p) => sessionsPerWeek >= p.recommendedFor[0] && sessionsPerWeek <= p.recommendedFor[1]) ?? BUILTIN_PROGRAMS[0]
}

/** Physio-Übungen deiner Vorlage „Oberkörper“ (in deren Reihenfolge), ohne archivierte. */
export function physioEntries(data: Pick<AppData, 'templates' | 'exercises'>): TemplateEntry[] {
  const seed = data.templates.find((t) => t.id === SEED_TEMPLATE_ID)
  if (!seed) return []
  return seed.entries
    .filter((en) => {
      const ex = data.exercises.find((e) => e.id === en.exerciseId)
      return !!ex && !ex.archived && exerciseMeta(ex).category === 'physio'
    })
    .map((en) => ({ ...en }))
}

/** Vorlagen-Eintrag mit Ziel: Halteübungen ohne Wdh.-Bereich. */
function programEntry(ex: Exercise, goal: ProgramGoal): TemplateEntry {
  if (ex.mode === 'hold') return { exerciseId: ex.id, sets: PROGRAM_SETS }
  const [repMin, repMax] = GOAL_REPS[goal]
  return { exerciseId: ex.id, sets: PROGRAM_SETS, repMin, repMax }
}

/**
 * Mitgeliefertes Programm übernehmen: eigenes Programm mit eigenen Tages-Vorlagen. Übungen kommen
 * zuerst aus deinem Bestand (verknüpft, feste ID, gleicher Name), nur fehlende werden aus der
 * Bibliothek übernommen – so läuft dein Verlauf („Letztes Mal“) weiter.
 */
export function installProgram(data: AppData, def: ProgramDefinition, opts: InstallOptions, at: string): { data: AppData; program: Program } {
  let exercises = data.exercises
  const physio = opts.physioBlock ? physioEntries(data) : []
  const days = def.days.map((day) => {
    let entries: TemplateEntry[]
    const source = day.fromTemplate ? data.templates.find((t) => t.id === day.fromTemplate) : undefined
    if (source) {
      entries = source.entries.map((en) => ({ ...en }))
    } else {
      entries = []
      for (const libId of day.exercises) {
        const r = adoptExercise(exercises, libId, at, { useNameMatch: true })
        if (r.status === 'unknown') continue
        exercises = r.exercises
        entries.push(programEntry(r.exercise, opts.goal))
      }
    }
    const withPhysio = [...physio.filter((p) => !entries.some((e) => e.exerciseId === p.exerciseId)), ...entries]
    return { name: day.name, entries: withPhysio }
  })
  return createProgramData({ ...data, exercises }, { name: def.name, goal: opts.goal, sessionsPerWeek: def.sessionsPerWeek, copiedFrom: def.id }, days, at)
}

/**
 * Gemeinsamer Kern fürs Anlegen (mitgelieferte Programme und Import von Claude): Programm mit je
 * einer Tages-Vorlage pro Tag; doppelte Übungen innerhalb eines Tages werden zusammengefasst.
 */
export function createProgramData(
  data: AppData,
  head: Pick<Program, 'name' | 'goal' | 'sessionsPerWeek' | 'copiedFrom'>,
  dayDefs: { name: string; entries: TemplateEntry[] }[],
  at: string,
): { data: AppData; program: Program } {
  const programId = newId('prg-')
  const templates: Template[] = []
  const days = dayDefs.map((day) => {
    const unique = day.entries.filter((e, i) => day.entries.findIndex((x) => x.exerciseId === e.exerciseId) === i)
    const template: Template = { id: newId('tpl-'), name: day.name, entries: unique, programId, createdAt: at, updatedAt: at }
    templates.push(template)
    return { id: newId('day-'), name: day.name, templateId: template.id }
  })
  const program: Program = { id: programId, ...head, days, createdAt: at, updatedAt: at }
  return {
    program,
    data: { ...data, templates: [...data.templates, ...templates], programs: [...data.programs, program] },
  }
}

/** Leeres eigenes Programm (Tage kommen im Editor dazu). */
export function createEmptyProgram(data: AppData, name: string, at: string): { data: AppData; program: Program } {
  const program: Program = {
    id: newId('prg-'),
    name: name.trim() || 'Mein Programm',
    goal: 'muskelaufbau',
    sessionsPerWeek: 3,
    days: [],
    createdAt: at,
    updatedAt: at,
  }
  return { program, data: { ...data, programs: [...data.programs, program] } }
}

/**
 * Nächster Tag eines Programms, abgeleitet aus dem zuletzt abgeschlossenen Training dieses
 * Programms (robust gegen Löschen und Import). Ohne passendes Training: erster Tag.
 */
export function nextProgramDay(program: Program, workouts: Workout[]): Program['days'][number] | null {
  if (program.days.length === 0) return null
  const last = workouts
    .filter((w) => w.status === 'done' && w.programId === program.id && w.finishedAt)
    .sort((a, b) => (a.finishedAt! < b.finishedAt! ? 1 : -1))[0]
  const i = last ? program.days.findIndex((d) => d.id === last.programDayId) : -1
  return program.days[(i + 1) % program.days.length]
}

/** Name mit „(Kopie)“, bei Bedarf nummeriert, damit er eindeutig bleibt. */
export function copyName(name: string, taken: string[]): string {
  const base = `${name} (Kopie)`
  if (!taken.includes(base)) return base
  let n = 2
  while (taken.includes(`${name} (Kopie ${n})`)) n++
  return `${name} (Kopie ${n})`
}

/**
 * Programm duplizieren: neues Programm und neue Tages-Vorlagen, aber dieselben Übungen –
 * dein Verlauf und spätere Steigerungen laufen weiter. Das Original bleibt unverändert.
 */
export function duplicateProgram(data: AppData, programId: string, at: string): { data: AppData; program: Program } | null {
  const src = data.programs.find((p) => p.id === programId)
  if (!src) return null
  const id = newId('prg-')
  const templates: Template[] = []
  const days = src.days.map((day) => {
    const t = data.templates.find((x) => x.id === day.templateId)
    const copy: Template = {
      id: newId('tpl-'),
      name: t?.name ?? day.name,
      entries: t ? t.entries.map((e) => ({ ...e })) : [],
      programId: id,
      createdAt: at,
      updatedAt: at,
    }
    templates.push(copy)
    return { id: newId('day-'), name: day.name, templateId: copy.id }
  })
  const program: Program = {
    ...src,
    id,
    name: copyName(src.name, data.programs.map((p) => p.name)),
    days,
    copiedFrom: src.id,
    createdAt: at,
    updatedAt: at,
  }
  return { program, data: { ...data, templates: [...data.templates, ...templates], programs: [...data.programs, program] } }
}

/** Vorlage duplizieren (auch einen Programm-Tag) – die Kopie ist eine eigenständige Vorlage. */
export function duplicateTemplate(data: AppData, templateId: string, at: string): { data: AppData; template: Template } | null {
  const src = data.templates.find((t) => t.id === templateId)
  if (!src) return null
  const standalone = data.templates.filter((t) => !t.programId).map((t) => t.name)
  const template: Template = {
    id: newId('tpl-'),
    name: copyName(src.name, standalone),
    entries: src.entries.map((e) => ({ ...e })),
    createdAt: at,
    updatedAt: at,
  }
  return { template, data: { ...data, templates: [...data.templates, template] } }
}

/** Programm löschen: seine Tages-Vorlagen gehen mit, abgeschlossene Trainings bleiben. */
export function deleteProgram(data: AppData, programId: string): AppData {
  return {
    ...data,
    programs: data.programs.filter((p) => p.id !== programId),
    templates: data.templates.filter((t) => t.programId !== programId),
    settings: data.settings.activeProgramId === programId ? { ...data.settings, activeProgramId: undefined } : data.settings,
  }
}
