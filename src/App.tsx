import { useState } from 'react'
import { TabBar, type TabId } from './components/TabBar.tsx'
import { UpdatePrompt } from './pwa/UpdatePrompt.tsx'
import { TrainingScreen } from './screens/TrainingScreen.tsx'
import { ExercisesScreen } from './screens/ExercisesScreen.tsx'
import { HistoryScreen } from './screens/HistoryScreen.tsx'
import { MoreScreen } from './screens/MoreScreen.tsx'

const TITLES: Record<TabId, string> = {
  training: 'Training',
  exercises: 'Übungen',
  history: 'Verlauf',
  more: 'Mehr',
}

export function App() {
  const [tab, setTab] = useState<TabId>('training')

  return (
    <div className="app">
      <header className="header">
        <h1>{TITLES[tab]}</h1>
      </header>
      <main className="content">
        {tab === 'training' && <TrainingScreen />}
        {tab === 'exercises' && <ExercisesScreen />}
        {tab === 'history' && <HistoryScreen />}
        {tab === 'more' && <MoreScreen />}
      </main>
      <TabBar active={tab} onChange={setTab} />
      <UpdatePrompt />
    </div>
  )
}
