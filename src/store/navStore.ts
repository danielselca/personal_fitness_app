import { create } from 'zustand'
import type { TabId } from '../components/TabBar.tsx'

/** Ziel innerhalb eines Tabs, z. B. Coach-Vorschlag → Vorlage im Editor öffnen. */
export type NavTarget = { kind: 'template' | 'exercise' | 'library' | 'programs'; id: string }

/**
 * Aktiver Tab. Eigener Store, damit Bildschirme auf andere Tabs verweisen können (z. B. Coach → Übung).
 * `target` wird vom Ziel-Bildschirm beim Öffnen übernommen und dann gelöscht.
 */
export const useNav = create<{
  tab: TabId
  target: NavTarget | null
  setTab: (tab: TabId) => void
  go: (tab: TabId, target: NavTarget) => void
  clearTarget: () => void
}>((set) => ({
  tab: 'training',
  target: null,
  setTab: (tab) => set({ tab, target: null }),
  go: (tab, target) => set({ tab, target }),
  clearTarget: () => set({ target: null }),
}))

/** Anfangswert aus dem Navigationsziel (rein, auch bei doppeltem Aufruf im StrictMode). */
export function initialTarget(kind: NavTarget['kind']): string | null {
  const t = useNav.getState().target
  return t?.kind === kind ? t.id : null
}
