import type { LibraryMediaRef } from '../library/types.ts'

/** Feste Quell-Stände der Bewegungsgrafiken (siehe scripts/library/media.ts). */
export const MEDIA_SOURCES = {
  'workout-guide': { name: 'Workout Guide (Bryl Lim)', url: 'https://github.com/bryllim/workout-guide', commit: 'aac599224bb9780305239607ef98540b7e0ce389' },
  everkinetic: { name: 'Everkinetic', url: 'https://github.com/everkinetic/data', commit: '446bb9a3d0c3beb6b84f7c9d77dfc8af707a2ab6' },
} as const

/** Bewegungsphasen je Quelle: workout-guide 3, Everkinetic 2. */
export function mediaFrameCount(source: LibraryMediaRef['source']): number {
  return source === 'workout-guide' ? 3 : 2
}

export function mediaFileName(libraryId: string, frame: number): string {
  return `${libraryId}-${frame}.svg`
}
