import { MUSCLE_INFO, type BodyPart, type Muscle } from '../taxonomy.ts'
import type { ProgramGoal, Restriction } from '../types.ts'
import type { HardSet } from './week.ts'

/**
 * Wochenvolumen: harte Sätze je Muskel (Hauptmuskel 1 Satz, mitbeteiligt ½ Satz) und Bewertung
 * für zehn Muskelgruppen gegen einen Zielbereich (Faustregel, Schoenfeld 2017: ≥ 10 Sätze je
 * Muskel und Woche für Muskelaufbau). Kleine Muskeln erscheinen nur auf der Muskelkarte.
 */

export const MUSCLE_GROUPS = [
  { id: 'brust', label: 'Brust', muscles: ['brust'] },
  { id: 'ruecken', label: 'Rücken', muscles: ['lat', 'oberer-ruecken'] },
  { id: 'schultern', label: 'Schultern', muscles: ['schulter-vorne', 'schulter-seitlich', 'schulter-hinten'] },
  { id: 'bizeps', label: 'Bizeps', muscles: ['bizeps'] },
  { id: 'trizeps', label: 'Trizeps', muscles: ['trizeps'] },
  { id: 'quadrizeps', label: 'Quadrizeps', muscles: ['quadrizeps'] },
  { id: 'beinbeuger', label: 'Beinbeuger', muscles: ['beinbeuger'] },
  { id: 'gesaess', label: 'Gesäß', muscles: ['gesaess'] },
  { id: 'waden', label: 'Waden', muscles: ['waden'] },
  { id: 'bauch', label: 'Bauch', muscles: ['bauch', 'seitliche-bauchmuskeln'] },
] as const satisfies readonly { id: string; label: string; muscles: readonly Muscle[] }[]
export type MuscleGroupId = (typeof MUSCLE_GROUPS)[number]['id']

export const GROUP_LABEL = Object.fromEntries(MUSCLE_GROUPS.map((g) => [g.id, g.label])) as Record<MuscleGroupId, string>

export function groupOf(m: Muscle): MuscleGroupId | undefined {
  return MUSCLE_GROUPS.find((g) => (g.muscles as readonly Muscle[]).includes(m))?.id
}

/** Zielbereich harter Sätze je Gruppe und Woche nach Profil-Ziel (Faustregel). */
export const VOLUME_TARGET: Record<ProgramGoal, { min: number; max: number }> = {
  muskelaufbau: { min: 10, max: 20 },
  fitness: { min: 6, max: 12 },
}

/** Welche Gruppen ein geschonter Körperbereich betrifft (sie werden dann nicht bewertet). */
const BODY_PART_GROUPS: Record<BodyPart, MuscleGroupId[]> = {
  schulter: ['schultern'],
  ellbogen: ['bizeps', 'trizeps'],
  handgelenk: [],
  nacken: [],
  'oberer-ruecken': ['ruecken'],
  'unterer-ruecken': [],
  huefte: ['gesaess'],
  knie: ['quadrizeps'],
  sprunggelenk: ['waden'],
}

/** Gruppen, die wegen aktiver Schonung nicht bewertet werden, mit dem Grund (z. B. „Schulter · bis 15.10.2026“). */
export function restrictedGroups(active: Restriction[]): Map<MuscleGroupId, Restriction> {
  const out = new Map<MuscleGroupId, Restriction>()
  for (const r of active) {
    for (const b of r.bodyParts) for (const g of BODY_PART_GROUPS[b]) if (!out.has(g)) out.set(g, r)
    for (const m of r.muscles) {
      const g = groupOf(m)
      if (g && !out.has(g)) out.set(g, r)
    }
  }
  return out
}

/** Harte Sätze je Muskel (Hauptmuskel 1, mitbeteiligt ½). */
export function muscleSets(sets: HardSet[]): Map<Muscle, number> {
  const out = new Map<Muscle, number>()
  const add = (m: Muscle, v: number) => out.set(m, (out.get(m) ?? 0) + v)
  for (const s of sets) {
    const { primary, secondary } = s.meta.muscles
    for (const m of primary) add(m, 1)
    for (const m of secondary) if (!primary.includes(m)) add(m, 0.5)
  }
  return out
}

/**
 * Beitrag eines Satzes zu einer Gruppe: 1, wenn ein Muskel der Gruppe Hauptmuskel ist, sonst ½,
 * wenn einer mitbeteiligt ist. So zählt ein Latzug für „Rücken“ einmal, nicht 1,5-mal.
 */
export function groupContribution(s: HardSet, groupMuscles: readonly Muscle[]): number {
  if (s.meta.muscles.primary.some((m) => groupMuscles.includes(m))) return 1
  if (s.meta.muscles.secondary.some((m) => groupMuscles.includes(m))) return 0.5
  return 0
}

export type VolumeStatus = 'unter' | 'ziel' | 'ueber' | 'geschont'

export interface GroupVolume {
  id: MuscleGroupId
  label: string
  sets: number
  status: VolumeStatus
  /** Übungen mit Beitrag zur Gruppe, meiste Sätze zuerst. */
  exercises: { id: string; name: string; sets: number }[]
  restriction?: Restriction
}

export function groupVolumes(sets: HardSet[], goal: ProgramGoal, restricted: Map<MuscleGroupId, Restriction> = new Map()): GroupVolume[] {
  const target = VOLUME_TARGET[goal]
  return MUSCLE_GROUPS.map((g) => {
    let total = 0
    const perEx = new Map<string, { id: string; name: string; sets: number }>()
    for (const s of sets) {
      const c = groupContribution(s, g.muscles)
      if (!c) continue
      total += c
      const e = perEx.get(s.exercise.id) ?? { id: s.exercise.id, name: s.exercise.name, sets: 0 }
      e.sets += c
      perEx.set(s.exercise.id, e)
    }
    const restriction = restricted.get(g.id)
    const status: VolumeStatus = restriction ? 'geschont' : total < target.min ? 'unter' : total > target.max ? 'ueber' : 'ziel'
    return { id: g.id, label: g.label, sets: total, status, exercises: [...perEx.values()].sort((a, b) => b.sets - a.sets), restriction }
  })
}

/** Status eines einzelnen Muskels für die Muskelkarte (kleine Muskeln: nur trainiert/nicht). */
export type MuscleMapStatus = VolumeStatus | 'keine' | 'trainiert'

export function muscleMapStatus(m: Muscle, perMuscle: Map<Muscle, number>, volumes: GroupVolume[]): MuscleMapStatus {
  const g = groupOf(m)
  const gv = g && volumes.find((v) => v.id === g)
  if (gv?.status === 'geschont') return 'geschont'
  const n = perMuscle.get(m) ?? 0
  if (n === 0) return 'keine'
  return gv ? gv.status : 'trainiert'
}

export const muscleLabel = (m: Muscle) => MUSCLE_INFO[m].label
