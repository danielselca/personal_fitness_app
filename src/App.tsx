import { useState } from 'react'
import { TabBar, type TabId } from './components/TabBar.tsx'
import { UpdatePrompt } from './pwa/UpdatePrompt.tsx'
import { TrainingScreen } from './screens/TrainingScreen.tsx'
import { ExercisesScreen } from './screens/ExercisesScreen.tsx'
import { HistoryScreen } from './screens/HistoryScreen.tsx'
import { MoreScreen } from './screens/MoreScreen.tsx'
import { useTheme } from './hooks/useTheme.ts'
import { formatDate } from './lib/format.ts'
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
  const updateSettings = useAppStore((s) => s.updateSettings)
  const theme = useTheme()

  return (
    <div className="app">
      <header className="header">
        <div className="header-row">
          <div>
            <div className="header-date">{formatDate(new Date().toISOString())}</div>
            <h1>{TITLES[tab]}</h1>
          </div>
          <button
            type="button"
            className="icon-btn"
            aria-label={theme === 'dark' ? 'Hellen Modus einschalten' : 'Dunklen Modus einschalten'}
            aria-pressed={theme === 'dark'}
            onClick={() => updateSettings({ theme: theme === 'dark' ? 'light' : 'dark' })}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>
        </div>
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

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a7 7 0 1 0 10.5 10.5z" />
    </svg>
  )
}
