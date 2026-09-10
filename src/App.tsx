import { useState } from 'react'
import { TabBar, type TabId } from './components/TabBar.tsx'
import { UpdatePrompt } from './pwa/UpdatePrompt.tsx'
import { TrainingScreen } from './screens/TrainingScreen.tsx'
import { ExercisesScreen } from './screens/ExercisesScreen.tsx'
import { HistoryScreen } from './screens/HistoryScreen.tsx'
import { MoreScreen } from './screens/MoreScreen.tsx'
import { useAppStore } from './store/appStore.ts'

const TITLES: Record<TabId, string> = {
  training: 'Training',
  exercises: 'Übungen',
  history: 'Verlauf',
  more: 'Mehr',
}

export function App() {
  const [tab, setTab] = useState<TabId>('training')
  const hydrated = useAppStore((s) => s.hydrated)
  const loadError = useAppStore((s) => s.loadError)

  return (
    <div className="app">
      <header className="header">
        <h1>{TITLES[tab]}</h1>
      </header>
      <main className="content">
        {!hydrated && <p className="muted" role="status">Lade Daten …</p>}
        {hydrated && loadError && (
          <div className="card" role="alert">
            <strong>Daten konnten nicht geladen werden</strong>
            <p className="muted" style={{ margin: '4px 0 0' }}>{loadError}</p>
          </div>
        )}
        {hydrated && !loadError && (
          <>
            {tab === 'training' && <TrainingScreen />}
            {tab === 'exercises' && <ExercisesScreen />}
            {tab === 'history' && <HistoryScreen />}
            {tab === 'more' && <MoreScreen />}
          </>
        )}
      </main>
      <TabBar active={tab} onChange={setTab} />
      <UpdatePrompt />
    </div>
  )
}
