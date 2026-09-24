import { SCHEMA_VERSION, type AppData, type Exercise, type Meta, type Settings, type Template, type TemplateEntry, type TimerState, type Workout, type WorkoutEntry, type WorkoutSet } from '../domain/types.ts'

/**
 * Vollständig befüllte Daten für Rundreise-Tests: jedes optionale Feld ist gesetzt.
 * Die `Required<…>`-Typen sorgen dafür, dass ein neues Feld im Datenmodell hier einen
 * Typfehler auslöst, bis es ergänzt ist – und der Rundreise-Test prüft dann, dass Laden,
 * Export und Import es nicht verlieren.
 */

const AT = '2026-09-20T08:00:00.000Z'
const LATER = '2026-09-21T09:30:00.000Z'

const exerciseFull: Required<Exercise> = {
  id: 'ex-voll',
  name: 'Vollständige Übung',
  aliases: ['Alias A', 'Alias B'],
  machineNo: '42',
  hint: 'Sitz auf Stufe 3',
  defaultRestSec: 75,
  weightStep: 1.25,
  planTarget: { sets: 4, reps: 10, weightKg: 22.5, source: 'Test' },
  noWeight: false,
  mode: 'reps',
  holdSec: 30,
  archived: false,
  createdAt: AT,
  updatedAt: LATER,
}

/** Halteübung ohne Gewicht, archiviert: deckt die anderen Werte der Kennzeichen ab. */
const exerciseHold: Exercise = {
  id: 'ex-halten',
  name: 'Halteübung',
  aliases: [],
  noWeight: true,
  mode: 'hold',
  holdSec: 45,
  planTarget: { sets: 3, reps: 45, weightKg: null, source: 'eigene Vorgabe' },
  archived: true,
  createdAt: AT,
  updatedAt: AT,
}

const entryFull: Required<TemplateEntry> = { exerciseId: exerciseFull.id, sets: 4 }

const templateFull: Required<Template> = {
  id: 'tpl-voll',
  name: 'Vollständige Vorlage',
  entries: [entryFull, { exerciseId: exerciseHold.id, sets: 3 }],
  createdAt: AT,
  updatedAt: LATER,
}

const setFull: Required<WorkoutSet> = { id: 'set-1', weightKg: 22.5, reps: 10, done: true, doneAt: '2026-09-21T09:05:00.000Z' }

/** `hold` ist flüchtig (nur im laufenden Training) und wird bewusst nicht exportiert. */
const workoutEntryFull: Omit<Required<WorkoutEntry>, 'hold'> = {
  exerciseId: exerciseFull.id,
  note: 'Griff eng',
  sets: [setFull, { id: 'set-2', weightKg: null, reps: 12, done: true, doneAt: '2026-09-21T09:08:00.000Z' }],
}

const workoutFull: Required<Workout> = {
  id: 'wo-voll',
  startedAt: '2026-09-21T09:00:00.000Z',
  finishedAt: '2026-09-21T09:45:00.000Z',
  status: 'done',
  templateId: templateFull.id,
  note: 'Gutes Training',
  entries: [workoutEntryFull, { exerciseId: exerciseHold.id, sets: [{ id: 'set-3', weightKg: null, reps: 45, done: true, doneAt: '2026-09-21T09:20:00.000Z' }] }],
  updatedAt: '2026-09-21T09:45:00.000Z',
}

const settingsFull: Required<Settings> = {
  defaultRestSec: 120,
  autoStartTimer: false,
  sound: false,
  vibration: true,
  keepScreenOn: false,
  weightStep: 1.25,
  theme: 'dark',
}

const metaFull: Required<Meta> = {
  lastBackupAt: '2026-09-19T20:00:00.000Z',
  workoutsSinceBackup: 2,
  hintsSeen: ['install', 'storage'],
  seededAt: '2026-09-01T00:00:00.000Z',
}

const timerFull: Required<TimerState> = {
  endsAt: '2026-09-21T09:10:00.000Z',
  durationSec: 90,
  startedAt: '2026-09-21T09:08:30.000Z',
  exerciseId: exerciseFull.id,
  signalled: false,
}

export function fullAppData(): Required<AppData> {
  return structuredClone({
    schemaVersion: SCHEMA_VERSION,
    exercises: [exerciseFull, exerciseHold],
    templates: [templateFull],
    workouts: [workoutFull],
    settings: settingsFull,
    timer: timerFull,
    meta: metaFull,
  })
}
