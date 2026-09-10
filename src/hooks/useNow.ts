import { useEffect, useState } from 'react'

/** Liefert die aktuelle Zeit im Takt; springt bei Sichtbarkeitswechsel sofort auf den Ist-Wert (F9). */
export function useNow(intervalMs: number, active = true): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    const onVis = () => setNow(Date.now())
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('focus', onVis)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('focus', onVis)
    }
  }, [intervalMs, active])
  return now
}
