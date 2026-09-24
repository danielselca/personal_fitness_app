import { LIBRARY_INDEX } from '../library/index.generated.ts'
import type { LibraryDetails, LibraryIndexEntry } from '../library/types.ts'
import { matchesText } from './search.ts'
import {
  EQUIPMENT_GROUPS,
  MUSCLE_INFO,
  REGION_LABEL,
  REGIONS,
  equipmentGroupOf,
  regionsOf,
  type BodyPart,
  type Category,
  type Equipment,
  type EquipmentGroupId,
  type Level,
  type Muscle,
  type MuscleSet,
  type Pattern,
  type Region,
  type Tag,
} from './taxonomy.ts'
import type { Exercise } from './types.ts'

const BY_ID = new Map(LIBRARY_INDEX.map((e) => [e.id, e]))

export function libraryEntry(id: string | undefined): LibraryIndexEntry | undefined {
  return id ? BY_ID.get(id) : undefined
}

/** Alle sichtbaren Bibliothekseinträge, alphabetisch. */
export function visibleLibrary(): LibraryIndexEntry[] {
  return LIBRARY_INDEX.filter((e) => !e.hidden).sort((a, b) => a.name.localeCompare(b.name, 'de'))
}

/** Tipps und typische Fehler; getrennt nachgeladen, damit der Start klein bleibt. */
export async function loadLibraryDetails(id: string): Promise<LibraryDetails | undefined> {
  const { LIBRARY_DETAILS } = await import('../library/details.generated.ts')
  return LIBRARY_DETAILS[id]
}

export interface ExerciseMeta {
  equipment?: Equipment
  category?: Category
  pattern?: Pattern
  muscles: MuscleSet
  loads: BodyPart[]
  level?: Level
  tags: Tag[]
  library?: LibraryIndexEntry
}

/** Zuordnung einer eigenen Übung: Werte des verknüpften Bibliothekseintrags, eigene Felder haben Vorrang. */
export function exerciseMeta(ex: Exercise): ExerciseMeta {
  const lib = libraryEntry(ex.libraryId)
  return {
    equipment: ex.equipment ?? lib?.equipment,
    category: ex.category ?? lib?.category,
    pattern: ex.pattern ?? lib?.pattern,
    muscles: ex.muscles ?? lib?.muscles ?? { primary: [], secondary: [] },
    loads: lib?.loads ?? [],
    level: lib?.level,
    tags: lib?.tags ?? [],
    library: lib,
  }
}

/** Suchtexte einer eigenen Übung inklusive Namen des verknüpften Bibliothekseintrags. */
export function exerciseSearchTexts(ex: Exercise): string[] {
  const lib = libraryEntry(ex.libraryId)
  return lib ? [lib.name, lib.en, ...lib.aliases] : []
}

export type EquipmentFilter = EquipmentGroupId | 'calisthenics'
export type RegionFilter = Region | 'physio' | 'ohne'

export interface LibraryFilter {
  equipment?: EquipmentFilter
  region?: RegionFilter
}

type MetaLike = Pick<ExerciseMeta, 'equipment' | 'category' | 'muscles' | 'tags'>

export function matchesFilter(meta: MetaLike, f: LibraryFilter): boolean {
  if (f.equipment) {
    if (f.equipment === 'calisthenics') {
      if (!meta.tags.includes('calisthenics')) return false
    } else if (!meta.equipment || equipmentGroupOf(meta.equipment) !== f.equipment) return false
  }
  if (f.region) {
    if (f.region === 'physio') return meta.category === 'physio'
    if (f.region === 'ohne') return !meta.equipment && meta.muscles.primary.length === 0 && !meta.category
    if (!regionsOf(meta.muscles.primary).includes(f.region)) return false
  }
  return true
}

/** Bibliothekssuche über Name, englischen Namen und Aliasse, eingeschränkt durch Filter. */
export function searchLibrary(query: string, f: LibraryFilter = {}): LibraryIndexEntry[] {
  return visibleLibrary().filter((e) => matchesText([e.name, e.en, ...e.aliases], query) && matchesFilter({ ...e, tags: e.tags ?? [] }, f))
}

/**
 * Alternativen zu einer Bibliotheksübung (für „Übung tauschen“): gleiches Bewegungsmuster,
 * sortiert nach gemeinsamen Hauptmuskeln; `avoid` schließt Übungen aus, die diese Bereiche belasten.
 */
export function alternativesFor(id: string, avoid: BodyPart[] = []): LibraryIndexEntry[] {
  const base = libraryEntry(id)
  if (!base) return []
  const shared = (e: LibraryIndexEntry) => e.muscles.primary.filter((m) => base.muscles.primary.includes(m)).length
  return visibleLibrary()
    .filter((e) => e.id !== id && e.pattern === base.pattern && !e.loads.some((b) => avoid.includes(b)))
    .sort((a, b) => shared(b) - shared(a) || a.name.localeCompare(b.name, 'de'))
}

export interface ChipOption<T extends string> {
  id: T
  label: string
}

export const EQUIPMENT_FILTER_OPTIONS: ChipOption<EquipmentFilter>[] = [
  ...EQUIPMENT_GROUPS.map((g) => ({ id: g.id, label: g.label })),
  { id: 'calisthenics', label: 'Calisthenics' },
]

export function regionFilterOptions(withUnassigned: boolean): ChipOption<RegionFilter>[] {
  return [
    ...REGIONS.map((r) => ({ id: r, label: REGION_LABEL[r] })),
    { id: 'physio', label: 'Physio' },
    ...(withUnassigned ? [{ id: 'ohne' as const, label: 'Ohne Zuordnung' }] : []),
  ]
}

export function muscleText(muscles: Muscle[]): string {
  return muscles.map((m) => MUSCLE_INFO[m].label).join(', ')
}
