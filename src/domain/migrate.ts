import { SEED_NO_WEIGHT_IDS } from './seed.ts'
import { DEFAULT_SETTINGS, SCHEMA_VERSION, type AppData, type Exercise, type Workout } from './types.ts'

/**
 * Migrationsgerüst: hebt gespeicherte Daten älterer Versionen auf die aktuelle an.
 * Jede Migration bekommt die Daten der Vorversion und liefert die nächste.
 */
const MIGRATIONS: Record<number, (d: Record<string, unknown>) => Record<string, unknown>> = {
  // 0 → 1: erste Version (nur Vollständigkeit der Felder sicherstellen)
  0: (d) => ({ ...d, schemaVersion: 1 }),
  // 1 → 2: Kennzeichen „ohne Gewicht“ für die Physio-/Dehnübungen des Seeds nachtragen,
  // sofern der Nutzer dort noch nie ein Gewicht abgehakt hat.
  1: (d) => {
    const exercises = Array.isArray(d.exercises) ? (d.exercises as Exercise[]) : []
    const workouts = Array.isArray(d.workouts) ? (d.workouts as Workout[]) : []
    const weighted = new Set<string>()
    for (const w of workouts) {
      for (const e of w.entries ?? []) {
        if ((e.sets ?? []).some((s) => s.done && s.weightKg !== null && s.weightKg !== undefined)) weighted.add(e.exerciseId)
      }
    }
    return {
      ...d,
      schemaVersion: 2,
      exercises: exercises.map((e) => (e.noWeight === undefined && SEED_NO_WEIGHT_IDS.has(e.id) && !weighted.has(e.id) ? { ...e, noWeight: true } : e)),
    }
  },
  // 2 → 3: „Tiefes V“ wird laut Nutzer mit Gewicht trainiert; das in Schema 2 gesetzte Kennzeichen zurücknehmen.
  2: (d) => {
    const exercises = Array.isArray(d.exercises) ? (d.exercises as Exercise[]) : []
    return {
      ...d,
      schemaVersion: 3,
      exercises: exercises.map((e) => (e.id === 'ex-tiefes-v' && e.noWeight === true ? { ...e, noWeight: undefined } : e)),
    }
  },
}

export class MigrationError extends Error {}

export function migrateAppData(raw: unknown): AppData {
  if (!raw || typeof raw !== 'object') throw new MigrationError('Gespeicherte Daten sind kein Objekt.')
  let d = { ...(raw as Record<string, unknown>) }
  let v = typeof d.schemaVersion === 'number' ? d.schemaVersion : 0
  if (v > SCHEMA_VERSION) {
    throw new MigrationError(`Daten stammen aus einer neueren App-Version (Schema ${v}, unterstützt ${SCHEMA_VERSION}).`)
  }
  while (v < SCHEMA_VERSION) {
    const step = MIGRATIONS[v]
    if (!step) throw new MigrationError(`Keine Migration von Schema ${v}.`)
    d = step(d)
    v++
  }
  return fillDefaults(d)
}

/** Ergänzt fehlende Felder, ohne vorhandene zu überschreiben. */
export function fillDefaults(d: Record<string, unknown>): AppData {
  const settings = { ...DEFAULT_SETTINGS, ...((d.settings as object) ?? {}) }
  const metaIn = (d.meta as Partial<AppData['meta']>) ?? {}
  return {
    schemaVersion: SCHEMA_VERSION,
    exercises: Array.isArray(d.exercises) ? (d.exercises as AppData['exercises']) : [],
    templates: Array.isArray(d.templates) ? (d.templates as AppData['templates']) : [],
    workouts: Array.isArray(d.workouts) ? (d.workouts as AppData['workouts']) : [],
    settings,
    timer: (d.timer as AppData['timer']) ?? null,
    meta: {
      lastBackupAt: metaIn.lastBackupAt,
      workoutsSinceBackup: metaIn.workoutsSinceBackup ?? 0,
      hintsSeen: metaIn.hintsSeen ?? [],
      seededAt: metaIn.seededAt ?? new Date().toISOString(),
    },
  }
}
