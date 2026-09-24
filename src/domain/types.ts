/** Datenmodell der App (SPEC.md Abschnitt 5). Alle Zeitstempel sind ISO-8601-Strings. */

import type { BodyPart, Category, Equipment, Level, Muscle, MuscleSet, Pattern } from './taxonomy.ts'

export const SCHEMA_VERSION = 10 as const

export type ExerciseMode = 'reps' | 'hold'

export const DEFAULT_HOLD_SEC = 60

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
  /** true = Übung ohne Gewichtsangabe (Körpergewicht, Band, Dehnung): kg-Feld wird ausgeblendet. */
  noWeight?: boolean
  /**
   * 'hold' = Halteübung: jeder Satz ist eine gehaltene Position über `holdSec` Sekunden,
   * dargestellt als Donut mit Countdown. `WorkoutSet.reps` speichert dann die gehaltenen Sekunden.
   * Fehlt → 'reps'.
   */
  mode?: ExerciseMode
  /** Haltedauer je Satz in Sekunden (nur mode 'hold'); fehlt → 60. */
  holdSec?: number
  /** Verknüpfter Bibliothekseintrag (Tipps, Muskeln, Ausrüstung kommen von dort). */
  libraryId?: string
  /** Eigene Zuordnung; überschreibt die Werte des Bibliothekseintrags. */
  equipment?: Equipment
  muscles?: MuscleSet
  category?: Category
  pattern?: Pattern
  /** Eigene belastete Körperbereiche (fürs Schonen); überschreibt die Bibliothek. */
  loads?: BodyPart[]
  archived: boolean
  createdAt: string
  updatedAt: string
}

export interface TemplateEntry {
  exerciseId: string
  sets: number
  /** Zielbereich der Wiederholungen (z. B. 8–12); fehlt → kein Ziel. */
  repMin?: number
  repMax?: number
  /** Pause in Sekunden für diese Übung in dieser Vorlage; fehlt → Pause der Übung. */
  restSec?: number
  note?: string
}

export interface Template {
  id: string
  name: string
  entries: TemplateEntry[]
  /** Gesetzt bei Tages-Vorlagen eines Programms (erscheinen dann nicht in der Vorlagen-Liste). */
  programId?: string
  createdAt: string
  updatedAt: string
}

export type ProgramGoal = 'muskelaufbau' | 'fitness'

export interface ProgramDay {
  id: string
  name: string
  templateId: string
}

/** Trainingsprogramm: Folge von Tagen, jeder Tag ist eine eigene Vorlage. Immer die Kopie des Nutzers. */
export interface Program {
  id: string
  name: string
  goal: ProgramGoal
  sessionsPerWeek: number
  days: ProgramDay[]
  /** Herkunft: ID eines mitgelieferten Programms oder eines duplizierten Programms. */
  copiedFrom?: string
  createdAt: string
  updatedAt: string
}

/** Vorübergehend geschonte Körperbereiche und Muskeln, optional bis einschließlich `until` (JJJJ-MM-TT). */
export interface Restriction {
  id: string
  bodyParts: BodyPart[]
  muscles: Muscle[]
  note?: string
  until?: string
  createdAt: string
  updatedAt: string
}

export interface WorkoutSet {
  id: string
  /** null = kein Gewicht (Körpergewicht, Band). */
  weightKg: number | null
  /** null nur bei noch nicht abgehakten Vorschlägen erlaubt. Bei Halteübungen: Sekunden. */
  reps: number | null
  done: boolean
  doneAt?: string
}

/** Laufender Halte-Ablauf einer Übung (nur im aktiven Training). Restzeit aus `endsAt`, daher nach App-Wechsel korrekt. */
export interface HoldState {
  /** Index des Satzes, der gerade gehalten wird bzw. auf den die Pause folgt. */
  setIndex: number
  phase: 'work' | 'rest'
  /** Endzeitpunkt der Phase; fehlt, wenn pausiert. */
  endsAt?: string
  durationSec: number
  /** Restsekunden, solange pausiert. */
  pausedRemainingSec?: number
}

/** „Wie war's?“ nach dem Training; beeinflusst die nächste Steigerung. */
export type EntryRating = 'leicht' | 'passend' | 'schwer'

export const COACH_KINDS = ['gewicht', 'wdh', 'satz', 'variante', 'halten', 'gleich', 'pause', 'geschont', 'wiedereinstieg', 'erstes-mal'] as const
export type CoachKind = (typeof COACH_KINDS)[number]

/** Steigerungsvorschlag des Coachs, mit dem ein Trainingseintrag vorbelegt wurde. */
export interface CoachNote {
  kind: CoachKind
  /** Kurzer, begründeter Hinweis, z. B. „↑ 47,5 kg – letztes Mal 3 × 12“. */
  note: string
}

export interface WorkoutEntry {
  exerciseId: string
  /** Beim Start aus der Vorlage kopiert (spätere Änderungen der Vorlage ändern die Historie nicht). */
  repMin?: number
  repMax?: number
  restSec?: number
  note?: string
  rating?: EntryRating
  coach?: CoachNote
  sets: WorkoutSet[]
  hold?: HoldState
}

export type WorkoutStatus = 'active' | 'done'

export interface Workout {
  id: string
  startedAt: string
  finishedAt?: string
  status: WorkoutStatus
  templateId?: string
  programId?: string
  programDayId?: string
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

export type ThemeSetting = 'system' | 'light' | 'dark'

export interface Settings {
  defaultRestSec: number
  autoStartTimer: boolean
  sound: boolean
  vibration: boolean
  keepScreenOn: boolean
  weightStep: number
  /** Erscheinungsbild; 'system' folgt dem Gerät. */
  theme: ThemeSetting
  /** Aktives Programm für „Nächstes Training“; fehlt → keins. */
  activeProgramId?: string
  /** Trainings pro Woche als Ziel. */
  weeklyGoal: number
  /** Steigerungsvorschläge des Coachs in Vorlagen/Programmen mit Zielbereich. */
  coachProgression: boolean
  /** Profil für den Coach (Schritt 20b). */
  profile?: Profile
}

export interface Profile {
  goal: ProgramGoal
  experience: Level
}

/** Körpergewicht an einem Tag (JJJJ-MM-TT). */
export interface BodyLogEntry {
  id: string
  date: string
  weightKg: number
  createdAt: string
  updatedAt: string
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
  programs: Program[]
  restrictions: Restriction[]
  bodyLog: BodyLogEntry[]
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
  programs: Program[]
  restrictions: Restriction[]
  bodyLog: BodyLogEntry[]
  settings: Settings
}

export const DEFAULT_SETTINGS: Settings = {
  defaultRestSec: 90,
  autoStartTimer: true,
  sound: true,
  vibration: false,
  keepScreenOn: true,
  weightStep: 2.5,
  theme: 'system',
  weeklyGoal: 3,
  coachProgression: true,
}

export const BACKUP_APP_ID = 'personal-fitness-app'
