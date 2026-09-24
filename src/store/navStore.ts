import { create } from 'zustand'
import type { TabId } from '../components/TabBar.tsx'

/** Aktiver Tab. Eigener Store, damit Bildschirme auf andere Tabs verweisen können (z. B. Coach → Übung). */
export const useNav = create<{ tab: TabId; setTab: (tab: TabId) => void }>((set) => ({
  tab: 'training',
  setTab: (tab) => set({ tab }),
}))
