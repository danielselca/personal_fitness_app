import type { WorkoutEntry } from './types.ts'

export type EntryState = 'done' | 'current' | 'pending'

/** Zustand einer Übung im aktiven Training: alle Sätze abgehakt → done, sonst aktuell oder offen. */
export function entryState(entry: WorkoutEntry, isCurrent: boolean): EntryState {
  if (entry.sets.length > 0 && entry.sets.every((s) => s.done)) return 'done'
  return isCurrent ? 'current' : 'pending'
}

/** Erste Übung mit offenem Satz (oder ohne Sätze); null, wenn alles erledigt ist. */
export function currentEntryId(entries: WorkoutEntry[]): string | null {
  return entries.find((e) => e.sets.length === 0 || e.sets.some((s) => !s.done))?.exerciseId ?? null
}
