import { exerciseMeta, visibleLibrary } from './library.ts'
import { hitsFor } from './restrictions.ts'
import { normalizeName } from './suggestions.ts'
import type { LibraryIndexEntry } from '../library/types.ts'
import type { Exercise, Restriction } from './types.ts'

export interface SwapCandidates {
  own: Exercise[]
  library: LibraryIndexEntry[]
}

/**
 * Vorschläge für „Übung tauschen“: gleiches Bewegungsmuster oder gleiche Hauptmuskeln –
 * zuerst deine Übungen, dann die Bibliothek; ohne Übungen, die geschonte Bereiche belasten,
 * und ohne `excludeIds` (z. B. schon im Training).
 */
export function swapCandidates(exercises: Exercise[], exerciseId: string, active: Restriction[], excludeIds: string[] = []): SwapCandidates {
  const ex = exercises.find((e) => e.id === exerciseId)
  if (!ex) return { own: [], library: [] }
  const meta = exerciseMeta(ex)
  const primary = meta.muscles.primary
  if (!meta.pattern && primary.length === 0) return { own: [], library: [] }
  // Nähe: Hauptmuskeln der Übung als Hauptmuskel (2) oder mitbeteiligt (1) beim Kandidaten
  const overlap = (m: { primary: string[]; secondary: string[] }) =>
    primary.reduce((n, x) => n + (m.primary.includes(x) ? 2 : m.secondary.includes(x) ? 1 : 0), 0)
  const score = (m: { pattern?: string; muscles: { primary: string[]; secondary: string[] } }) => (meta.pattern && m.pattern === meta.pattern ? 10 : 0) + overlap(m.muscles)
  // Gleiches Muster oder gleiche Muskeln; gleiches Muster steht oben (z. B. bei geschonter Schulter
  // statt Reverse Butterfly ein Rudern, das die hintere Schulter mittrainiert)
  const fits = (m: { pattern?: string; muscles: { primary: string[]; secondary: string[] } }) => (!!meta.pattern && m.pattern === meta.pattern) || overlap(m.muscles) > 0

  const own = exercises
    .filter((o) => o.id !== ex.id && !o.archived && !excludeIds.includes(o.id))
    .map((o) => ({ o, m: exerciseMeta(o) }))
    .filter(({ m }) => fits(m) && hitsFor(m, active).length === 0)
    .sort((a, b) => score(b.m) - score(a.m) || a.o.name.localeCompare(b.o.name, 'de'))
    .map(({ o }) => o)

  // Bibliothekseinträge, die du schon als eigene Übung hast, erscheinen oben bei „Deine Übungen“
  const linked = new Set(exercises.filter((e) => e.libraryId).map((e) => e.libraryId))
  const names = new Set(exercises.map((e) => normalizeName(e.name)))
  const library = visibleLibrary()
    .filter((l) => l.id !== ex.libraryId && !linked.has(l.id) && !names.has(normalizeName(l.name)) && !exercises.some((e) => e.id === `ex-lib-${l.id}`))
    .filter((l) => fits(l) && hitsFor(l, active).length === 0)
    .sort((a, b) => score(b) - score(a) || a.name.localeCompare(b.name, 'de'))
  return { own, library }
}
