import { exerciseMeta } from './library.ts'
import { BODY_PART_LABEL, MUSCLE_INFO, type BodyPart, type Muscle } from './taxonomy.ts'
import type { Exercise, Restriction, Template } from './types.ts'

/** Heutiges Datum als JJJJ-MM-TT in Ortszeit (Vergleich mit `Restriction.until`). */
export function dayKey(now = new Date()): string {
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${m}-${d}`
}

/** Aktiv bis einschließlich `until`; ohne Datum unbefristet. */
export function isActive(r: Restriction, today: string): boolean {
  return !r.until || r.until >= today
}

export function activeRestrictions(rs: Restriction[], today: string): Restriction[] {
  return rs.filter((r) => isActive(r, today))
}

/** Alle geschonten Bereiche und Muskeln der aktiven Einträge. */
export function restrictedSets(rs: Restriction[]): { bodyParts: Set<BodyPart>; muscles: Set<Muscle> } {
  return { bodyParts: new Set(rs.flatMap((r) => r.bodyParts)), muscles: new Set(rs.flatMap((r) => r.muscles)) }
}

/**
 * Welche geschonten Bereiche belastet eine Übung? Körperbereiche über die belasteten Bereiche,
 * Muskeln über die Hauptmuskeln (eigene Angaben vor der Bibliothek). Liefert deutsche Bezeichnungen.
 */
export function hitsFor(meta: { loads: BodyPart[]; muscles: { primary: Muscle[] } }, active: Restriction[]): string[] {
  if (active.length === 0) return []
  const { bodyParts, muscles } = restrictedSets(active)
  return [
    ...meta.loads.filter((b) => bodyParts.has(b)).map((b) => BODY_PART_LABEL[b]),
    ...meta.muscles.primary.filter((m) => muscles.has(m)).map((m) => MUSCLE_INFO[m].label),
  ]
}

export function exerciseHits(ex: Exercise, active: Restriction[]): string[] {
  return hitsFor(exerciseMeta(ex), active)
}

/** Zahl der Übungen einer Vorlage, die geschonte Bereiche belasten. */
export function templateHitCount(t: Template, exercises: Exercise[], active: Restriction[]): number {
  if (active.length === 0) return 0
  return t.entries.filter((en) => {
    const ex = exercises.find((e) => e.id === en.exerciseId)
    return !!ex && !ex.archived && exerciseHits(ex, active).length > 0
  }).length
}

/** Kurztext eines Eintrags, z. B. „Schulter, Brust · bis 15.10.2026“. */
export function restrictionLabel(r: Restriction): string {
  const parts = [...r.bodyParts.map((b) => BODY_PART_LABEL[b]), ...r.muscles.map((m) => MUSCLE_INFO[m].label)].join(', ')
  if (!r.until) return parts
  const [y, m, d] = r.until.split('-')
  return `${parts} · bis ${d}.${m}.${y}`
}
