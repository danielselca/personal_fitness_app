import type { LibraryIndexEntry } from '../library/types.ts'
import { libraryEntry } from './library.ts'
import { MEDIA_SOURCES, mediaFileName, mediaFrameCount } from './media-sources.ts'
import type { Exercise } from './types.ts'

const BASE = `${import.meta.env.BASE_URL}media/v1/`

export interface MediaInfo {
  /** URLs der Bewegungsphasen in Reihenfolge. */
  frames: string[]
  /** Kurze Quellenangabe, z. B. „Workout Guide (Bryl Lim) · CC BY-SA 4.0“. */
  credit: string
}

/** Grafik eines Bibliothekseintrags; ohne Grafik null. */
export function mediaFor(entry: LibraryIndexEntry | undefined): MediaInfo | null {
  if (!entry?.media) return null
  const n = mediaFrameCount(entry.media.source)
  return {
    frames: Array.from({ length: n }, (_, i) => `${BASE}ex/${mediaFileName(entry.id, i + 1)}`),
    credit: `${MEDIA_SOURCES[entry.media.source].name} · CC BY-SA 4.0`,
  }
}

export function mediaForExercise(ex: Exercise): MediaInfo | null {
  return mediaFor(libraryEntry(ex.libraryId))
}

export const LICENSE_URL = `${BASE}LICENSE-ASSETS.txt`
export const ATTRIBUTION_URL = `${BASE}ATTRIBUTION.json`

/**
 * Grafiken deiner verknüpften Übungen still vorladen, damit sie im Studio auch ohne Netz da sind
 * (der Service Worker legt sie im Laufzeit-Cache ab). Nacheinander, im Leerlauf, nur online.
 */
export async function preloadMedia(exercises: Exercise[], fetchFn: (url: string) => Promise<unknown> = (u) => fetch(u)): Promise<number> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return 0
  const urls = [...new Set(exercises.filter((e) => !e.archived).flatMap((e) => mediaForExercise(e)?.frames ?? []))]
  let loaded = 0
  for (const url of urls) {
    try {
      await fetchFn(url)
      loaded++
    } catch {
      return loaded // offline oder Fehler: später erneut
    }
  }
  return loaded
}
