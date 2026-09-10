import { useRegisterSW } from 'virtual:pwa-register/react'

/** Zeigt einen Hinweis, wenn eine neue Version der App bereitliegt (N5). */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  if (!needRefresh) return null

  return (
    <div className="toast" role="status">
      <span>Neue Version verfügbar.</span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button type="button" className="btn" onClick={() => setNeedRefresh(false)}>
          Später
        </button>
        <button type="button" className="btn" onClick={() => updateServiceWorker(true)}>
          Aktualisieren
        </button>
      </div>
    </div>
  )
}
