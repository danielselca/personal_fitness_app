import { useEffect } from 'react'

type WakeLockSentinelLike = { release(): Promise<void>; addEventListener?: (t: string, cb: () => void) => void }

/** Bildschirm während des Trainings anlassen (F10); wird nach Rückkehr in den Vordergrund erneuert. */
export function useWakeLock(enabled: boolean): void {
  useEffect(() => {
    if (!enabled) return
    const nav = navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<WakeLockSentinelLike> } }
    if (!nav.wakeLock) return
    let sentinel: WakeLockSentinelLike | null = null
    let cancelled = false
    const request = async () => {
      try {
        if (document.visibilityState !== 'visible') return
        sentinel = await nav.wakeLock!.request('screen')
        if (cancelled) await sentinel.release()
      } catch {
        sentinel = null
      }
    }
    const onVisible = () => {
      if (document.visibilityState === 'visible') void request()
    }
    void request()
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', onVisible)
      void sentinel?.release()
    }
  }, [enabled])
}
