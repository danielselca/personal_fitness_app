import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { App } from './App.tsx'
import { appStore } from './store/appStore.ts'
import { requestPersistentStorage } from './store/persistence.ts'

void appStore.getState().hydrate()
void requestPersistentStorage()

// Beim Verlassen der Seite ausstehende Schreibvorgänge anstoßen (F6).
const flush = () => void appStore.getState().flush()
window.addEventListener('pagehide', flush)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') flush()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
