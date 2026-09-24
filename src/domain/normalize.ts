import { isCategory, isEquipment, isMuscle, isPattern, type MuscleSet } from './taxonomy.ts'
import {
  DEFAULT_SETTINGS,
  type Exercise,
  type Meta,
  type Settings,
  type Template,
  type TemplateEntry,
  type ThemeSetting,
  type TimerState,
  type Workout,
} from './types.ts'

/**
 * Normalisierer für geladene und importierte Daten. Grundsatz: bekannte Felder werden geprüft
 * und übernommen, nichts Gültiges geht verloren. Neue Felder müssen hier ergänzt werden; der
 * Rundreise-Test mit vollständig befüllten Daten (`src/test/fixtures.ts`) erzwingt das.
 */

export const isObj = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v)
export const isStr = (v: unknown): v is string => typeof v === 'string'
export const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
export const isBool = (v: unknown): v is boolean => typeof v === 'boolean'
export const isIso = (v: unknown): v is string => isStr(v) && !Number.isNaN(Date.parse(v))

const THEMES: ThemeSetting[] = ['system', 'light', 'dark']
const intIn = (v: unknown, min: number, max: number): v is number => isNum(v) && Number.isInteger(v) && v >= min && v <= max

/** Einstellungen: Standardwerte für fehlende oder ungültige Felder; unbekannte Felder bleiben erhalten. */
export function normalizeSettings(v: unknown): Settings {
  const s = isObj(v) ? v : {}
  const d = DEFAULT_SETTINGS
  return {
    ...s,
    defaultRestSec: intIn(s.defaultRestSec, 5, 900) ? s.defaultRestSec : d.defaultRestSec,
    autoStartTimer: isBool(s.autoStartTimer) ? s.autoStartTimer : d.autoStartTimer,
    sound: isBool(s.sound) ? s.sound : d.sound,
    vibration: isBool(s.vibration) ? s.vibration : d.vibration,
    keepScreenOn: isBool(s.keepScreenOn) ? s.keepScreenOn : d.keepScreenOn,
    weightStep: isNum(s.weightStep) && s.weightStep > 0 && s.weightStep <= 50 ? s.weightStep : d.weightStep,
    theme: THEMES.includes(s.theme as ThemeSetting) ? (s.theme as ThemeSetting) : d.theme,
  }
}

/** Metadaten: fehlende Felder ergänzen, unbekannte behalten. */
export function normalizeMeta(v: unknown): Meta {
  const m = isObj(v) ? v : {}
  return {
    ...m,
    lastBackupAt: isIso(m.lastBackupAt) ? m.lastBackupAt : undefined,
    workoutsSinceBackup: intIn(m.workoutsSinceBackup, 0, Number.MAX_SAFE_INTEGER) ? m.workoutsSinceBackup : 0,
    hintsSeen: Array.isArray(m.hintsSeen) ? m.hintsSeen.filter(isStr) : [],
    seededAt: isIso(m.seededAt) ? m.seededAt : new Date().toISOString(),
  }
}

export function normalizeTimer(v: unknown): TimerState | null {
  if (!isObj(v) || !isIso(v.endsAt) || !isNum(v.durationSec)) return null
  return v as unknown as TimerState
}

/** Übung aus einer geprüften Sicherung. Ausdrücklich gesetzte Werte (`noWeight: false`, `mode: 'reps'`) bleiben erhalten. */
export function normalizeExercise(e: Record<string, unknown>): Exercise {
  const at = isIso(e.createdAt) ? e.createdAt : new Date(0).toISOString()
  const plan = isObj(e.planTarget) ? e.planTarget : null
  return {
    id: e.id as string,
    name: (e.name as string).trim(),
    aliases: Array.isArray(e.aliases) ? e.aliases.filter(isStr) : [],
    machineNo: isStr(e.machineNo) ? e.machineNo : undefined,
    hint: isStr(e.hint) ? e.hint : undefined,
    defaultRestSec: isNum(e.defaultRestSec) ? e.defaultRestSec : undefined,
    weightStep: isNum(e.weightStep) ? e.weightStep : undefined,
    planTarget: plan
      ? {
          sets: plan.sets as number,
          reps: plan.reps as number,
          weightKg: (plan.weightKg as number | null) ?? null,
          source: isStr(plan.source) ? plan.source : 'Import',
        }
      : undefined,
    noWeight: isBool(e.noWeight) ? e.noWeight : undefined,
    mode: e.mode === 'hold' || e.mode === 'reps' ? e.mode : undefined,
    holdSec: isNum(e.holdSec) && e.holdSec > 0 ? e.holdSec : undefined,
    libraryId: isStr(e.libraryId) && e.libraryId ? e.libraryId : undefined,
    equipment: isEquipment(e.equipment) ? e.equipment : undefined,
    muscles: normalizeMuscles(e.muscles),
    category: isCategory(e.category) ? e.category : undefined,
    pattern: isPattern(e.pattern) ? e.pattern : undefined,
    archived: e.archived === true,
    createdAt: at,
    updatedAt: isIso(e.updatedAt) ? e.updatedAt : at,
  }
}

function normalizeMuscles(v: unknown): MuscleSet | undefined {
  if (!isObj(v)) return undefined
  const list = (x: unknown) => (Array.isArray(x) ? x.filter(isMuscle) : [])
  return { primary: list(v.primary), secondary: list(v.secondary) }
}

/** Vorlage aus einer geprüften Sicherung. */
export function normalizeTemplate(t: Record<string, unknown>): Template {
  const at = isIso(t.createdAt) ? t.createdAt : new Date(0).toISOString()
  return {
    id: t.id as string,
    name: t.name as string,
    entries: (t.entries as Record<string, unknown>[]).map(
      (en): TemplateEntry => ({ exerciseId: en.exerciseId as string, sets: en.sets as number }),
    ),
    createdAt: at,
    updatedAt: isIso(t.updatedAt) ? t.updatedAt : at,
  }
}

/** Training aus einer geprüften Sicherung. Der Halte-Ablauf (`hold`) ist flüchtig und wird nicht übernommen. */
export function normalizeWorkout(w: Record<string, unknown>): Workout {
  return {
    id: w.id as string,
    startedAt: w.startedAt as string,
    finishedAt: isIso(w.finishedAt) ? w.finishedAt : undefined,
    status: w.status as Workout['status'],
    templateId: isStr(w.templateId) ? w.templateId : undefined,
    note: isStr(w.note) ? w.note : undefined,
    updatedAt: isIso(w.updatedAt) ? w.updatedAt : ((w.finishedAt as string | undefined) ?? (w.startedAt as string)),
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
