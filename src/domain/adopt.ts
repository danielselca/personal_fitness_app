import { libraryEntry } from './library.ts'
import { normalizeName } from './suggestions.ts'
import type { Exercise } from './types.ts'

/**
 * Ergebnis beim Übernehmen eines Bibliothekseintrags in „Meine Übungen“. `name-match`: Es gibt
 * schon eine eigene, nicht verknüpfte Übung mit gleichem Namen – die Oberfläche fragt nach.
 */
export type AdoptStatus = 'existing' | 'linked' | 'created' | 'name-match'

export type AdoptOutcome = { status: AdoptStatus; exercise: Exercise; exercises: Exercise[] } | { status: 'unknown' }

export interface AdoptOptions {
  /** Diese eigene Übung mit dem Eintrag verknüpfen. */
  linkTo?: string
  /** Trotz gleichnamiger eigener Übung neu anlegen. */
  createNew?: boolean
  /** Gleichnamige eigene Übung ohne Rückfrage verwenden (Programme: gleicher Name = gleiche Übung). */
  useNameMatch?: boolean
}

/**
 * Bibliotheksübung in „Meine Übungen“ holen, deine Historie zuerst:
 * verknüpfte Übung → feste ID `ex-lib-<id>` (ggf. aus dem Archiv) → gleicher Name → neu anlegen.
 * Rein: gibt die neue Übungsliste zurück, ohne zu speichern.
 */
export function adoptExercise(exercises: Exercise[], entryId: string, at: string, opts: AdoptOptions = {}): AdoptOutcome {
  const entry = libraryEntry(entryId)
  if (!entry) return { status: 'unknown' }
  const unarchive = (ex: Exercise, status: AdoptStatus): AdoptOutcome => {
    if (!ex.archived) return { status, exercise: ex, exercises }
    const next = { ...ex, archived: false, updatedAt: at }
    return { status, exercise: next, exercises: exercises.map((e) => (e.id === ex.id ? next : e)) }
  }

  const fixedId = `ex-lib-${entry.id}`
  const existing =
    exercises.find((e) => e.libraryId === entry.id && !e.archived) ??
    exercises.find((e) => e.libraryId === entry.id) ??
    exercises.find((e) => e.id === fixedId)
  if (existing) return unarchive(existing, 'existing')

  if (opts.linkTo) {
    const target = exercises.find((e) => e.id === opts.linkTo)
    if (!target) return { status: 'unknown' }
    const linked = { ...target, libraryId: entry.id, updatedAt: at }
    return { status: 'linked', exercise: linked, exercises: exercises.map((e) => (e.id === target.id ? linked : e)) }
  }

  const key = normalizeName(entry.name)
  const sameName = exercises.find((e) => !e.libraryId && normalizeName(e.name) === key)
  if (sameName && opts.useNameMatch) return unarchive(sameName, 'existing')
  if (sameName && !opts.createNew) return { status: 'name-match', exercise: sameName, exercises }

  const taken = exercises.some((e) => normalizeName(e.name) === key)
  const exercise: Exercise = {
    id: fixedId,
    name: taken ? `${entry.name} (Bibliothek)` : entry.name,
    aliases: [],
    libraryId: entry.id,
    defaultRestSec: entry.restSec,
    noWeight: entry.noWeight,
    mode: entry.mode,
    holdSec: entry.holdSec,
    archived: false,
    createdAt: at,
    updatedAt: at,
  }
  return { status: 'created', exercise, exercises: [...exercises, exercise] }
}
