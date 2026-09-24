import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/global.css'
import { App } from './App.tsx'
import { preloadMedia } from './domain/media.ts'
import { appStore } from './store/appStore.ts'
import { requestPersistentStorage } from './store/persistence.ts'

void appStore.getState().hydrate().then(scheduleMediaPreload)
void requestPersistentStorage()

// Nach einem Update fehlen alte, nachgeladene Teile (z. B. Übungstipps) – dann neu laden.
window.addEventListener('vite:preloadError', () => window.location.reload())

/**
 * Grafiken deiner Übungen still vorladen, sobald der Service Worker aktiv ist und der Browser
 * Zeit hat – so sind sie im Studio auch ohne Netz da.
 */
function scheduleMediaPreload() {
  if (!('serviceWorker' in navigator)) return
  void navigator.serviceWorker.ready.then(() => {
    const run = () => void preloadMedia(appStore.getState().data.exercises)
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 10_000 })
    else setTimeout(run, 3000)
  })
}

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
