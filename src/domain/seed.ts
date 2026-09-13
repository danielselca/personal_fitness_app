import { DEFAULT_SETTINGS, SCHEMA_VERSION, type AppData, type Exercise, type Template } from './types.ts'

const SOURCE = 'Fit7.11-Plan'

interface SeedExercise {
  id: string
  name: string
  aliases?: string[]
  machineNo?: string
  hint?: string
  defaultRestSec?: number
  /** Ohne Gewichtsangabe (Körpergewicht, Band, Dehnung). */
  noWeight?: boolean
  plan?: { sets: number; reps: number; weightKg: number | null }
}

/**
 * Übungskatalog aus den Notizen (1–18, Namen wörtlich) und dem Fit7.11-Plan (19–21).
 * Siehe SPEC.md Abschnitt 2. Die Haken in den Notizen werden ignoriert.
 */
const SEED_EXERCISES: SeedExercise[] = [
  { id: 'ex-aufdehnen-seitlich', name: 'Aufdehnen seitlich', noWeight: true },
  { id: 'ex-ueberzuege', name: 'Überzüge' },
  { id: 'ex-bein-absenken', name: 'Bein absenken (unterer Bauch)', noWeight: true },
  { id: 'ex-serratusstuetz', name: 'Serratusstütz', noWeight: true },
  { id: 'ex-stuetz-auf-step', name: 'Stütz auf Step', noWeight: true },
  { id: 'ex-uppercut-theraband', name: 'Uppercut Theraband', noWeight: true },
  { id: 'ex-uppercut-tuch', name: 'Uppercut Tuch', noWeight: true },
  { id: 'ex-bear-hug', name: 'Bear hug' },
  { id: 'ex-tiefes-v', name: 'Tiefes V' },
  { id: 'ex-holzhacken', name: 'Holzhacken Gummiball Wand', noWeight: true },
  {
    id: 'ex-kopfheben',
    name: '10x10s Kopfheben 1 cm Doppelkinn',
    noWeight: true,
    hint: '10 × 10 s halten, als 10 Wdh. erfassen.',
  },
  { id: 'ex-incline-frontraise', name: 'Incline Frontraise' },
  { id: 'ex-kreuzheben', name: 'Kreuzheben' },
  {
    id: 'ex-rudern',
    name: 'Rudern',
    aliases: ['Ruderzug am Kabel', '711 #29'],
    machineNo: '29',
    defaultRestSec: 60,
    plan: { sets: 3, reps: 12, weightKg: 50 },
  },
  {
    id: 'ex-reverse-butterfly',
    name: 'Reverse Butterfly',
    aliases: ['Butterfly reverse', '711 #13'],
    machineNo: '13',
    defaultRestSec: 60,
    plan: { sets: 3, reps: 10, weightKg: 30 },
  },
  {
    id: 'ex-adduktion',
    name: 'Adduktion',
    aliases: ['Arm-Adduktion einarmig Kabelzug'],
    plan: { sets: 3, reps: 12, weightKg: 15 },
  },
  {
    id: 'ex-lat-zug',
    name: 'Lat-Zug',
    aliases: ['Latzug am Kabel', '711 #28'],
    machineNo: '28',
    defaultRestSec: 90,
    plan: { sets: 4, reps: 10, weightKg: 45 },
  },
  {
    id: 'ex-schraegbank-kurzhantel',
    name: 'Schrägbank Kurzhantel',
    aliases: ['Bankdrücken schräg Kurzhantel'],
    hint: 'Gewicht pro Hantel',
    defaultRestSec: 60,
    plan: { sets: 3, reps: 12, weightKg: 10 },
  },
  // Nur im Fit7.11-Plan, nicht in den Notizen:
  {
    id: 'ex-butterfly-maschine',
    name: 'Butterfly Maschine',
    aliases: ['711 #17'],
    machineNo: '17',
    defaultRestSec: 60,
    plan: { sets: 4, reps: 10, weightKg: 35 },
  },
  {
    id: 'ex-facepulls',
    name: 'Facepulls',
    aliases: ['711 Cable - Facepulls', 'Face Pulls'],
    defaultRestSec: 60,
    plan: { sets: 3, reps: 10, weightKg: 30 },
  },
  {
    id: 'ex-seitheben-kurzhantel',
    name: 'Seitheben Kurzhantel',
    hint: 'Gewicht pro Hantel',
    defaultRestSec: 90,
    plan: { sets: 3, reps: 15, weightKg: 2 },
  },
]

/** Standard-Oberkörpertraining des Nutzers (Reihenfolge vom 2026-09-13): erst ohne Gewicht, dann Geräte. */
export const STANDARD_TEMPLATE_ORDER = [
  'ex-aufdehnen-seitlich',
  'ex-bein-absenken',
  'ex-serratusstuetz',
  'ex-stuetz-auf-step',
  'ex-adduktion',
  'ex-tiefes-v',
  'ex-reverse-butterfly',
  'ex-butterfly-maschine',
  'ex-incline-frontraise',
  'ex-schraegbank-kurzhantel',
  'ex-rudern',
  'ex-lat-zug',
]

export const SEED_TEMPLATE_ID = 'tpl-oberkoerper-fokus-schulter'
/** Früherer Name der Seed-Vorlage (bis Schema 3). */
export const LEGACY_TEMPLATE_NAME = 'Oberkörper Fokus Schulter'
export const SEED_TEMPLATE_NAME = 'Oberkörper'

export function buildSeedExercises(at: string): Exercise[] {
  return SEED_EXERCISES.map((s) => ({
    id: s.id,
    name: s.name,
    aliases: s.aliases ?? [],
    machineNo: s.machineNo,
    hint: s.hint,
    defaultRestSec: s.defaultRestSec,
    noWeight: s.noWeight,
    planTarget: s.plan ? { ...s.plan, source: SOURCE } : undefined,
    archived: false,
    createdAt: at,
    updatedAt: at,
  }))
}

/** Einträge der Standard-Vorlage; nur vorhandene, nicht archivierte Übungen. */
export function buildStandardEntries(exercises: Exercise[]): Template['entries'] {
  const byId = new Map(exercises.map((e) => [e.id, e]))
  return STANDARD_TEMPLATE_ORDER.filter((id) => byId.get(id) && !byId.get(id)!.archived).map((exerciseId) => ({
    exerciseId,
    sets: byId.get(exerciseId)?.planTarget?.sets ?? 3,
  }))
}

export function buildSeedTemplate(at: string, exercises: Exercise[]): Template {
  return {
    id: SEED_TEMPLATE_ID,
    name: SEED_TEMPLATE_NAME,
    entries: buildStandardEntries(exercises),
    createdAt: at,
    updatedAt: at,
  }
}

export function createSeedData(at = new Date().toISOString()): AppData {
  const exercises = buildSeedExercises(at)
  return {
    schemaVersion: SCHEMA_VERSION,
    exercises,
    templates: [buildSeedTemplate(at, exercises)],
    workouts: [],
    settings: { ...DEFAULT_SETTINGS },
    timer: null,
    meta: { workoutsSinceBackup: 0, hintsSeen: [], seededAt: at },
  }
}

export const SEED_EXERCISE_COUNT = SEED_EXERCISES.length

/** Aktuelle Seed-Hinweise je ID (für die Bereinigung alter Hinweise in der Migration). */
export const SEED_HINTS: ReadonlyMap<string, string | undefined> = new Map(SEED_EXERCISES.map((s) => [s.id, s.hint]))

/** IDs der Seed-Übungen ohne Gewicht; für die Migration bestehender Daten (Schema 1 → 2). */
export const SEED_NO_WEIGHT_IDS: ReadonlySet<string> = new Set(SEED_EXERCISES.filter((s) => s.noWeight).map((s) => s.id))
