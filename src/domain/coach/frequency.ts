import type { Muscle } from '../taxonomy.ts'
import type { HardSet } from './week.ts'
import type { MuscleGroupId } from './volume.ts'

/**
 * Häufigkeit: an wie vielen Tagen der Woche eine große Muskelgruppe mindestens einen Satz als
 * Hauptmuskel bekam. Faustregel: jede große Gruppe ≥ 2× pro Woche (Schoenfeld 2016).
 */

export const FREQUENCY_TARGET = 2

export const BIG_GROUPS = [
  { id: 'brust', label: 'Brust', muscles: ['brust'], groups: ['brust'] },
  { id: 'ruecken', label: 'Rücken', muscles: ['lat', 'oberer-ruecken'], groups: ['ruecken'] },
  { id: 'schultern', label: 'Schultern', muscles: ['schulter-vorne', 'schulter-seitlich', 'schulter-hinten'], groups: ['schultern'] },
  { id: 'beine', label: 'Beine', muscles: ['quadrizeps', 'beinbeuger', 'gesaess'], groups: ['quadrizeps', 'beinbeuger', 'gesaess'] },
] as const satisfies readonly { id: string; label: string; muscles: readonly Muscle[]; groups: readonly MuscleGroupId[] }[]
export type BigGroupId = (typeof BIG_GROUPS)[number]['id']

export interface GroupFrequency {
  id: BigGroupId
  label: string
  days: number
  /** Geschont: Gruppe wird nicht bewertet (alle zugehörigen Muskelgruppen geschont). */
  restricted: boolean
}

export function groupFrequencies(sets: HardSet[], restricted: ReadonlySet<MuscleGroupId> = new Set()): GroupFrequency[] {
  return BIG_GROUPS.map((g) => {
    const days = new Set(sets.filter((s) => s.meta.muscles.primary.some((m) => (g.muscles as readonly Muscle[]).includes(m))).map((s) => s.day))
    return { id: g.id, label: g.label, days: days.size, restricted: g.groups.every((x) => restricted.has(x)) }
  })
}
