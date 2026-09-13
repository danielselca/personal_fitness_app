import { useAppStore } from '../store/appStore.ts'

export const INSTALL_HINT_ID = 'install-ios'

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /iPhone|iPad|iPod/.test(ua) || (ua.includes('Macintosh') && 'ontouchend' in document)
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  return nav.standalone === true || window.matchMedia?.('(display-mode: standalone)').matches === true
}

/**
 * Einmaliger Hinweis auf dem iPhone (A-4): Homescreen-Installation empfohlen, getrennte Speicher
 * von Safari-Tab und installierter App. Erscheint nur im Browser, nicht in der installierten App.
 */
export function InstallHint() {
  const seen = useAppStore((s) => s.data.meta.hintsSeen.includes(INSTALL_HINT_ID))
  const markHintSeen = useAppStore((s) => s.markHintSeen)
  if (seen || !isIos() || isStandalone()) return null
  return (
    <div className="banner" role="note" data-testid="install-hint">
      <span className="banner-text">
        <strong>Tipp:</strong> Über Teilen → „Zum Home-Bildschirm“ installieren, dann bleiben die Daten dauerhaft erhalten.
      </span>
      <button type="button" className="btn btn-sm" onClick={() => markHintSeen(INSTALL_HINT_ID)} aria-label="Hinweis verstanden">
        OK
      </button>
    </div>
  )
}
