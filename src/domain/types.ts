/** Datenmodell der App (SPEC.md Abschnitt 5). Alle Zeitstempel sind ISO-8601-Strings. */

export const SCHEMA_VERSION = 1 as const

export interface PlanTarget {
  sets: number
  reps: number
  weightKg: number | null
  /** Herkunft der Vorgabe, z. B. "Fit7.11-Plan" */
  source: string
}

export interface Exercise {
  id: string
  name: string
  /** Weitere Namen, die die Suche findet (z. B. Fit7.11-Bezeichnung). */
  aliases: string[]
  /** Gerätenummer im Studio, z. B. "28". */
  machineNo?: string
  /** Kurzer Hinweis, z. B. "Gewicht pro Hantel". */
  hint?: string
  /** Standardpause in Sekunden; fehlt → Einstellung der App. */
  defaultRestSec?: number
  /** Schrittweite für die +/−-Tasten in kg; fehlt → Einstellung der App. */
  weightStep?: number
  /** Startvorschlag ohne Historie; erzeugt keine Trainingshistorie. */
  planTarget?: PlanTarget
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface TemplateEntry {
  exerciseId: string
  sets: number
}

export interface Template {
  id: string
  name: string
  entries: TemplateEntry[]
  createdAt: string
  updatedAt: string
}

export interface WorkoutSet {
  id: string
  /** null = kein Gewicht (Körpergewicht, Band). */
  weightKg: number | null
  /** null nur bei noch nicht abgehakten Vorschlägen erlaubt. */
  reps: number | null
  done: boolean
  doneAt?: string
}

export interface WorkoutEntry {
  exerciseId: string
  note?: string
  sets: WorkoutSet[]
}

export type WorkoutStatus = 'active' | 'done'

export interface Workout {
  id: string
  startedAt: string
  finishedAt?: string
  status: WorkoutStatus
  templateId?: string
  note?: string
  entries: WorkoutEntry[]
  updatedAt: string
}

export interface TimerState {
  /** Endzeitpunkt; Restzeit wird daraus berechnet (F9). */
  endsAt: string
  durationSec: number
  startedAt: string
  exerciseId?: string
  /** true, sobald das Ablaufsignal einmal ausgelöst wurde. */
  signalled: boolean
}

export interface Settings {
  defaultRestSec: number
  autoStartTimer: boolean
  sound: boolean
  vibration: boolean
  keepScreenOn: boolean
  weightStep: number
}

export interface Meta {
  /** Zeitpunkt des letzten Exports; fehlt → nie gesichert. */
  lastBackupAt?: string
  /** Abgeschlossene Trainings seit dem letzten Export (F15). */
  workoutsSinceBackup: number
  hintsSeen: string[]
  seededAt: string
}

export interface AppData {
  schemaVersion: typeof SCHEMA_VERSION
  exercises: Exercise[]
  templates: Template[]
  workouts: Workout[]
  settings: Settings
  timer: TimerState | null
  meta: Meta
}

export interface Backup {
  schemaVersion: number
  app: string
  appVersion?: string
  exportedAt: string
  exercises: Exercise[]
  templates: Template[]
  workouts: Workout[]
  settings: Settings
}

export const DEFAULT_SETTINGS: Settings = {
  defaultRestSec: 90,
  autoStartTimer: true,
  sound: true,
  vibration: false,
  keepScreenOn: true,
  weightStep: 2.5,
}

export const BACKUP_APP_ID = 'personal-fitness-app'
