import { DEFAULT_SETTINGS, SCHEMA_VERSION, type AppData } from './types.ts'

/**
 * Migrationsgerüst: hebt gespeicherte Daten älterer Versionen auf die aktuelle an.
 * Jede Migration bekommt die Daten der Vorversion und liefert die nächste.
 */
const MIGRATIONS: Record<number, (d: Record<string, unknown>) => Record<string, unknown>> = {
  // 0 → 1: erste Version (nur Vollständigkeit der Felder sicherstellen)
  0: (d) => ({ ...d, schemaVersion: 1 }),
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
