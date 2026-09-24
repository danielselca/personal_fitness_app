import type { BodyPart, Category, Equipment, Level, MuscleSet, Pattern, Tag } from '../domain/taxonomy.ts'

/** Herkunft einer Bewegungsgrafik (eingebunden ab Roadmap Schritt 19). */
export interface LibraryMediaRef {
  source: 'workout-guide' | 'everkinetic'
  ref: string
}

/**
 * Ein kuratierter Bibliothekseintrag. Die `id` ist ein dauerhafter deutscher Slug: einmal
 * ausgeliefert, wird sie nie geändert oder gelöscht (höchstens `hidden`), denn übernommene
 * Übungen verweisen per `libraryId` darauf.
 */
export interface LibraryEntry {
  id: string
  name: string
  /** Englische Bezeichnung (Anzeige und Suche). */
  en: string
  /** Weitere Namen für die Suche. */
  aliases: string[]
  equipment: Equipment
  category: Category
  pattern: Pattern
  muscles: MuscleSet
  /** Körperbereiche, die die Übung belastet (fürs Schonen). */
  loads: BodyPart[]
  level: Level
  tags?: Tag[]
  /** Verhalten, wird beim Übernehmen in die eigene Übung kopiert. */
  restSec: number
  noWeight?: true
  mode?: 'hold'
  holdSec?: number
  /** Eingestelltes Gewicht ist Unterstützung (mehr = leichter), z. B. Klimmzugmaschine. */
  assisted?: true
  media?: LibraryMediaRef
  /** Ausführungstipps (3–5) und typische Fehler (2–3). */
  cues: string[]
  mistakes: string[]
  hidden?: true
}

export type LibraryIndexEntry = Omit<LibraryEntry, 'cues' | 'mistakes'>

export interface LibraryDetails {
  cues: string[]
  mistakes: string[]
}
