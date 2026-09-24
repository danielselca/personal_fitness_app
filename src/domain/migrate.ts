import { applySeedLibrary, AUFDEHNEN_PLAN, buildStandardEntries, HOLD_SEED, LEGACY_KOPFHEBEN_NAME, LEGACY_TEMPLATE_NAME, SEED_HINTS, SEED_NO_WEIGHT_IDS, SEED_TEMPLATE_ID, SEED_TEMPLATE_NAME } from './seed.ts'
import { normalizeMeta, normalizeSettings, normalizeTimer } from './normalize.ts'
import { SCHEMA_VERSION, type AppData, type Exercise, type Template, type Workout } from './types.ts'

/**
 * Migrationsgerüst: hebt gespeicherte Daten älterer Versionen auf die aktuelle an.
 * Jede Migration bekommt die Daten der Vorversion und liefert die nächste.
 * Regeln ab Schema 8: nur leere Felder ergänzen, Nutzerwerte nie überschreiben und `updatedAt`
 * nicht setzen (sonst gewinnt beim Zusammenführen eine alte Sicherung gegen neuere Änderungen).
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
  // 3 → 4 (Feedback 2026-09-13): „Bear hug“ mit Gewicht; alte Seed-Hinweise („Zuordnung zu Fit7.11 … vermutet“)
  // entfernen bzw. kürzen; Seed-Vorlage auf die Standard-Reihenfolge des Nutzers bringen und umbenennen.
  3: (d) => {
    const exercises = (Array.isArray(d.exercises) ? (d.exercises as Exercise[]) : []).map((e) => {
      let next = e
      if (e.id === 'ex-bear-hug' && e.noWeight === true) next = { ...next, noWeight: undefined }
      if (SEED_HINTS.has(e.id) && e.hint && (e.hint.startsWith('Zuordnung zu Fit7.11') || e.hint.startsWith('Laut Notizen') || e.hint.startsWith('Gewicht vermutlich pro Hantel'))) {
        next = { ...next, hint: SEED_HINTS.get(e.id) }
      }
      return next
    })
    const templates = (Array.isArray(d.templates) ? (d.templates as Template[]) : []).map((t) =>
      t.id === SEED_TEMPLATE_ID
        ? { ...t, name: t.name === LEGACY_TEMPLATE_NAME ? SEED_TEMPLATE_NAME : t.name, entries: buildStandardEntries(exercises), updatedAt: new Date().toISOString() }
        : t,
    )
    return { ...d, schemaVersion: 4, exercises, templates }
  },
  // 4 → 5: „Aufdehnen seitlich“ bekommt die Vorgabe 2 × 10 (nur wenn noch keine eigene Vorgabe gesetzt ist);
  // Seed-Vorlage übernimmt 2 Sätze, sofern dort noch der alte Standard 3 steht.
  4: (d) => {
    const exercises = (Array.isArray(d.exercises) ? (d.exercises as Exercise[]) : []).map((e) =>
      e.id === 'ex-aufdehnen-seitlich' && !e.planTarget ? { ...e, planTarget: { ...AUFDEHNEN_PLAN } } : e,
    )
    const templates = (Array.isArray(d.templates) ? (d.templates as Template[]) : []).map((t) =>
      t.id === SEED_TEMPLATE_ID
        ? { ...t, entries: t.entries.map((en) => (en.exerciseId === 'ex-aufdehnen-seitlich' && en.sets === 3 ? { ...en, sets: AUFDEHNEN_PLAN.sets } : en)) }
        : t,
    )
    return { ...d, schemaVersion: 5, exercises, templates }
  },
  // 5 → 6: Serratusstütz und Stütz auf Step werden gehalten (4 × 60 s, 60 s Pause) → Halte-Modus,
  // sofern der Nutzer die Art nicht schon selbst gesetzt hat. Seed-Vorlage: 3 → 4 Sätze.
  5: (d) => {
    const exercises = (Array.isArray(d.exercises) ? (d.exercises as Exercise[]) : []).map(applyHoldSeed)
    const templates = (Array.isArray(d.templates) ? (d.templates as Template[]) : []).map((t) =>
      t.id === SEED_TEMPLATE_ID
        ? { ...t, entries: t.entries.map((en) => (HOLD_SEED.has(en.exerciseId) && en.sets === 3 ? { ...en, sets: HOLD_SEED.get(en.exerciseId)!.sets } : en)) }
        : t,
    )
    return { ...d, schemaVersion: 6, exercises, templates }
  },
  // 6 → 7: Kopfheben als Halteübung 10 × 10 s (10 s Pause); Name gekürzt, alter Name bleibt als Alias suchbar.
  6: (d) => {
    const exercises = (Array.isArray(d.exercises) ? (d.exercises as Exercise[]) : []).map((e) => {
      if (e.id !== 'ex-kopfheben') return e
      let next = applyHoldSeed(e)
      if (next.name === LEGACY_KOPFHEBEN_NAME) {
        next = { ...next, name: 'Kopfheben (Doppelkinn)', aliases: next.aliases.includes(LEGACY_KOPFHEBEN_NAME) ? next.aliases : [...next.aliases, LEGACY_KOPFHEBEN_NAME] }
      }
      if (next.hint?.startsWith('10 × 10 s halten')) next = { ...next, hint: 'Kopf nur 1 cm anheben' }
      return next
    })
    return { ...d, schemaVersion: 7, exercises }
  },
  // 7 → 8: Übungsbibliothek. Eindeutige Studio-Übungen werden verknüpft, Physio-Übungen zugeordnet;
  // nur leere Felder, kein updatedAt (Historie und Nutzerwerte bleiben unberührt).
  7: (d) => {
    const exercises = (Array.isArray(d.exercises) ? (d.exercises as Exercise[]) : []).map(applySeedLibrary)
    return { ...d, schemaVersion: 8, exercises }
  },
}

/** Seed-Halteübung auf eine bestehende Übung anwenden, sofern der Nutzer die Art nicht selbst gesetzt hat. */
function applyHoldSeed(e: Exercise): Exercise {
  const h = HOLD_SEED.get(e.id)
  if (!h || e.mode !== undefined) return e
  return {
    ...e,
    mode: 'hold',
    holdSec: h.holdSec,
    defaultRestSec: e.defaultRestSec ?? h.restSec,
    planTarget: e.planTarget ?? { sets: h.sets, reps: h.holdSec, weightKg: null, source: 'eigene Vorgabe' },
  }
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

type Normalizers = { [K in keyof AppData]: (v: unknown) => AppData[K] }

/**
 * Ein Normalisierer je Schlüssel von `AppData`. Kommt ein Schlüssel hinzu, meldet TypeScript
 * hier einen Fehler, bis er ergänzt ist – so gehen neue Daten beim Laden nicht verloren.
 * Übungen, Vorlagen und Trainings werden beim Laden unverändert übernommen (selbst geschrieben).
 */
const NORMALIZERS: Normalizers = {
  schemaVersion: () => SCHEMA_VERSION,
  exercises: (v) => (Array.isArray(v) ? (v as AppData['exercises']) : []),
  templates: (v) => (Array.isArray(v) ? (v as AppData['templates']) : []),
  workouts: (v) => (Array.isArray(v) ? (v as AppData['workouts']) : []),
  settings: normalizeSettings,
  timer: normalizeTimer,
  meta: normalizeMeta,
}

/** Ergänzt fehlende Felder, ohne vorhandene zu überschreiben. */
export function fillDefaults(d: Record<string, unknown>): AppData {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(NORMALIZERS) as (keyof AppData)[]) out[key] = NORMALIZERS[key](d[key])
  return out as unknown as AppData
}
