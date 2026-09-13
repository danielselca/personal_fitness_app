import { migrateAppData } from './migrate.ts'
import { BACKUP_APP_ID, SCHEMA_VERSION, type AppData, type Backup, type Exercise, type Template, type Workout } from './types.ts'

/** Export (F12): vollständige Datenstruktur mit Version und Zeitstempel. */
export function buildBackup(data: AppData, appVersion: string, now = new Date()): Backup {
  return {
    schemaVersion: data.schemaVersion,
    app: BACKUP_APP_ID,
    appVersion,
    exportedAt: now.toISOString(),
    exercises: data.exercises,
    templates: data.templates,
    workouts: data.workouts,
    settings: data.settings,
  }
}

export function backupFileName(now = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `fitness-backup-${y}-${m}-${d}.json`
}

export type ValidationResult = { ok: true; backup: Backup; warnings: string[] } | { ok: false; errors: string[] }

const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
const isStr = (v: unknown): v is string => typeof v === 'string'
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const isBool = (v: unknown): v is boolean => typeof v === 'boolean'
const isIso = (v: unknown): v is string => isStr(v) && !Number.isNaN(Date.parse(v))

/** Import-Validierung (F13, AK22): Struktur, Typen, Version. Ungültig → Fehlerliste, nichts wird geändert. */
export function validateBackup(raw: unknown): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  if (!isObj(raw)) return { ok: false, errors: ['Die Datei enthält kein JSON-Objekt.'] }
  if (raw.app !== BACKUP_APP_ID) errors.push('Die Datei stammt nicht aus dieser App (Feld „app“ fehlt oder ist falsch).')
  if (!isNum(raw.schemaVersion)) errors.push('Feld „schemaVersion“ fehlt.')
  else if (raw.schemaVersion > SCHEMA_VERSION) {
    errors.push(`Die Datei stammt aus einer neueren App-Version (Schema ${raw.schemaVersion}, unterstützt bis ${SCHEMA_VERSION}).`)
  }
  for (const key of ['exercises', 'templates', 'workouts'] as const) {
    if (!Array.isArray(raw[key])) errors.push(`Feld „${key}“ fehlt oder ist keine Liste.`)
  }
  if (errors.length) return { ok: false, errors }

  const exercises = raw.exercises as unknown[]
  exercises.forEach((e, i) => {
    if (!isObj(e)) return errors.push(`Übung ${i + 1}: kein Objekt.`)
    if (!isStr(e.id) || !e.id) errors.push(`Übung ${i + 1}: „id“ fehlt.`)
    if (!isStr(e.name) || !e.name.trim()) errors.push(`Übung ${i + 1}: „name“ fehlt.`)
    if (e.aliases !== undefined && !Array.isArray(e.aliases)) errors.push(`Übung ${i + 1}: „aliases“ ist keine Liste.`)
    if (e.archived !== undefined && !isBool(e.archived)) errors.push(`Übung ${i + 1}: „archived“ ist kein Wahrheitswert.`)
    if (e.planTarget !== undefined && e.planTarget !== null) {
      const p = e.planTarget
      if (!isObj(p) || !isNum(p.sets) || !isNum(p.reps) || !(p.weightKg === null || isNum(p.weightKg))) {
        errors.push(`Übung ${i + 1}: „planTarget“ ist ungültig.`)
      }
    }
  })

  const templates = raw.templates as unknown[]
  templates.forEach((t, i) => {
    if (!isObj(t)) return errors.push(`Vorlage ${i + 1}: kein Objekt.`)
    if (!isStr(t.id) || !t.id) errors.push(`Vorlage ${i + 1}: „id“ fehlt.`)
    if (!isStr(t.name)) errors.push(`Vorlage ${i + 1}: „name“ fehlt.`)
    if (!Array.isArray(t.entries)) errors.push(`Vorlage ${i + 1}: „entries“ fehlt.`)
    else {
      ;(t.entries as unknown[]).forEach((en, j) => {
        if (!isObj(en) || !isStr(en.exerciseId) || !isNum(en.sets)) errors.push(`Vorlage ${i + 1}, Eintrag ${j + 1}: ungültig.`)
      })
    }
  })

  const workouts = raw.workouts as unknown[]
  workouts.forEach((w, i) => {
    if (!isObj(w)) return errors.push(`Training ${i + 1}: kein Objekt.`)
    if (!isStr(w.id) || !w.id) errors.push(`Training ${i + 1}: „id“ fehlt.`)
    if (!isIso(w.startedAt)) errors.push(`Training ${i + 1}: „startedAt“ fehlt oder ist kein Datum.`)
    if (w.status !== 'active' && w.status !== 'done') errors.push(`Training ${i + 1}: „status“ muss active oder done sein.`)
    if (w.status === 'done' && !isIso(w.finishedAt)) errors.push(`Training ${i + 1}: abgeschlossen, aber „finishedAt“ fehlt.`)
    if (!Array.isArray(w.entries)) return errors.push(`Training ${i + 1}: „entries“ fehlt.`)
    ;(w.entries as unknown[]).forEach((en, j) => {
      if (!isObj(en) || !isStr(en.exerciseId) || !Array.isArray(en.sets)) {
        return errors.push(`Training ${i + 1}, Übung ${j + 1}: ungültig.`)
      }
      ;(en.sets as unknown[]).forEach((s, k) => {
        if (!isObj(s) || !isStr(s.id) || !isBool(s.done)) return errors.push(`Training ${i + 1}, Übung ${j + 1}, Satz ${k + 1}: ungültig.`)
        if (!(s.weightKg === null || s.weightKg === undefined || isNum(s.weightKg))) errors.push(`Training ${i + 1}, Übung ${j + 1}, Satz ${k + 1}: Gewicht ungültig.`)
        if (!(s.reps === null || s.reps === undefined || (isNum(s.reps) && Number.isInteger(s.reps)))) errors.push(`Training ${i + 1}, Übung ${j + 1}, Satz ${k + 1}: Wdh. ungültig.`)
      })
    })
  })

  if (raw.settings !== undefined && !isObj(raw.settings)) errors.push('Feld „settings“ ist kein Objekt.')
  if (errors.length) return { ok: false, errors: errors.slice(0, 12) }

  // Fehlende optionale Felder ergänzen, Schema anheben
  const migrated = migrateAppData({
    schemaVersion: raw.schemaVersion,
    exercises: exercises.map((e) => normalizeExercise(e as Record<string, unknown>)),
    templates,
    workouts: workouts.map((w) => normalizeWorkout(w as Record<string, unknown>)),
    settings: raw.settings ?? {},
  })
  const knownIds = new Set(migrated.exercises.map((e) => e.id))
  const missing = new Set<string>()
  for (const w of migrated.workouts) for (const e of w.entries) if (!knownIds.has(e.exerciseId)) missing.add(e.exerciseId)
  if (missing.size) warnings.push(`${missing.size} Übungs-ID(s) in Trainings sind im Katalog der Datei nicht enthalten.`)

  return {
    ok: true,
    warnings,
    backup: {
      schemaVersion: SCHEMA_VERSION,
      app: BACKUP_APP_ID,
      appVersion: isStr(raw.appVersion) ? raw.appVersion : undefined,
      exportedAt: isIso(raw.exportedAt) ? raw.exportedAt : new Date().toISOString(),
      exercises: migrated.exercises,
      templates: migrated.templates,
      workouts: migrated.workouts,
      settings: migrated.settings,
    },
  }
}

function normalizeExercise(e: Record<string, unknown>): Exercise {
  const at = isIso(e.createdAt) ? e.createdAt : new Date(0).toISOString()
  return {
    id: e.id as string,
    name: (e.name as string).trim(),
    aliases: Array.isArray(e.aliases) ? (e.aliases as unknown[]).filter(isStr) : [],
    machineNo: isStr(e.machineNo) ? e.machineNo : undefined,
    hint: isStr(e.hint) ? e.hint : undefined,
    defaultRestSec: isNum(e.defaultRestSec) ? e.defaultRestSec : undefined,
    weightStep: isNum(e.weightStep) ? e.weightStep : undefined,
    noWeight: e.noWeight === true ? true : undefined,
    planTarget: isObj(e.planTarget)
      ? {
          sets: e.planTarget.sets as number,
          reps: e.planTarget.reps as number,
          weightKg: (e.planTarget.weightKg as number | null) ?? null,
          source: isStr(e.planTarget.source) ? e.planTarget.source : 'Import',
        }
      : undefined,
    archived: e.archived === true,
    createdAt: at,
    updatedAt: isIso(e.updatedAt) ? e.updatedAt : at,
  }
}

function normalizeWorkout(w: Record<string, unknown>): Workout {
  return {
    id: w.id as string,
    startedAt: w.startedAt as string,
    finishedAt: isIso(w.finishedAt) ? w.finishedAt : undefined,
    status: w.status as Workout['status'],
    templateId: isStr(w.templateId) ? w.templateId : undefined,
    note: isStr(w.note) ? w.note : undefined,
    updatedAt: isIso(w.updatedAt) ? w.updatedAt : (w.finishedAt as string | undefined) ?? (w.startedAt as string),
    entries: (w.entries as Record<string, unknown>[]).map((en) => ({
      exerciseId: en.exerciseId as string,
      note: isStr(en.note) ? en.note : undefined,
      sets: (en.sets as Record<string, unknown>[]).map((s) => ({
        id: s.id as string,
        weightKg: (s.weightKg as number | null | undefined) ?? null,
        reps: (s.reps as number | null | undefined) ?? null,
        done: s.done as boolean,
        doneAt: isIso(s.doneAt) ? s.doneAt : undefined,
      })),
    })),
  }
}

export interface ImportSummary {
  exercises: number
  templates: number
  workouts: number
  exportedAt: string
}

export function summarizeBackup(b: Backup): ImportSummary {
  return { exercises: b.exercises.length, templates: b.templates.length, workouts: b.workouts.length, exportedAt: b.exportedAt }
}

export type ImportMode = 'merge' | 'replace'

function mergeById<T extends { id: string; updatedAt: string }>(local: T[], incoming: T[]): { items: T[]; added: number; updated: number } {
  const map = new Map(local.map((x) => [x.id, x]))
  let added = 0
  let updated = 0
  for (const inc of incoming) {
    const cur = map.get(inc.id)
    if (!cur) {
      map.set(inc.id, inc)
      added++
    } else if (inc.updatedAt > cur.updatedAt) {
      map.set(inc.id, inc)
      updated++
    }
  }
  return { items: Array.from(map.values()), added, updated }
}

export interface ImportResult {
  data: AppData
  added: { exercises: number; templates: number; workouts: number }
  updated: { exercises: number; templates: number; workouts: number }
  skippedActiveWorkout: boolean
}

/**
 * Import (F13, AK23): „merge“ ergänzt Neues, gleiche IDs gewinnt der neuere updatedAt;
 * lokale Einstellungen und ein laufendes Training bleiben erhalten.
 * „replace“ ersetzt alles durch die Sicherung.
 */
export function applyImport(local: AppData, backup: Backup, mode: ImportMode): ImportResult {
  if (mode === 'replace') {
    return {
      data: {
        ...local,
        exercises: backup.exercises,
        templates: backup.templates,
        workouts: backup.workouts,
        settings: { ...local.settings, ...backup.settings },
        timer: null,
      },
      added: { exercises: backup.exercises.length, templates: backup.templates.length, workouts: backup.workouts.length },
      updated: { exercises: 0, templates: 0, workouts: 0 },
      skippedActiveWorkout: false,
    }
  }
  const ex = mergeById<Exercise>(local.exercises, backup.exercises)
  const tp = mergeById<Template>(local.templates, backup.templates)
  const localActive = local.workouts.some((w) => w.status === 'active')
  let skippedActiveWorkout = false
  const incomingWorkouts = backup.workouts.filter((w) => {
    if (w.status === 'active' && localActive && !local.workouts.some((l) => l.id === w.id)) {
      skippedActiveWorkout = true
      return false
    }
    return true
  })
  const wo = mergeById<Workout>(local.workouts, incomingWorkouts)
  return {
    data: { ...local, exercises: ex.items, templates: tp.items, workouts: wo.items },
    added: { exercises: ex.added, templates: tp.added, workouts: wo.added },
    updated: { exercises: ex.updated, templates: tp.updated, workouts: wo.updated },
    skippedActiveWorkout,
  }
}
