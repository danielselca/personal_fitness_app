import { get, set, del } from 'idb-keyval'
import type { AppData } from '../domain/types.ts'

export interface DataStorage {
  load(): Promise<unknown | null>
  save(data: AppData): Promise<void>
  clear(): Promise<void>
}

const KEY = 'personal-fitness-app:data'

/** IndexedDB über idb-keyval (N7). */
export const idbStorage: DataStorage = {
  async load() {
    return (await get(KEY)) ?? null
  },
  async save(data) {
    await set(KEY, data)
  },
  async clear() {
    await del(KEY)
  },
}

/** Für Tests: alles im Speicher. */
export function memoryStorage(initial: unknown | null = null): DataStorage & { current: unknown | null; saves: number } {
  const s = {
    current: initial,
    saves: 0,
    async load() {
      return s.current
    },
    async save(data: AppData) {
      s.current = JSON.parse(JSON.stringify(data))
      s.saves++
    },
    async clear() {
      s.current = null
    },
  }
  return s
}

/** Dauerhaften Speicher anfragen, damit der Browser die Daten nicht wegräumt (N7). */
export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (navigator.storage && typeof navigator.storage.persist === 'function') {
      return await navigator.storage.persist()
    }
  } catch {
    // ignorieren – nicht unterstützt
  }
  return false
}
