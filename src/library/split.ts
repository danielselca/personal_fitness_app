import type { LibraryDetails, LibraryEntry, LibraryIndexEntry } from './types.ts'

/** Teilt die kuratierten Einträge in den kleinen Index und die nachgeladenen Details. */
export function splitLibrary(entries: LibraryEntry[]): { index: LibraryIndexEntry[]; details: Record<string, LibraryDetails> } {
  const index = entries.map(({ cues: _cues, mistakes: _mistakes, ...rest }) => rest)
  const details = Object.fromEntries(entries.map((e) => [e.id, { cues: e.cues, mistakes: e.mistakes }]))
  return { index, details }
}
