import { useEffect, useRef, useState } from 'react'
import { useNow } from '../hooks/useNow.ts'
import { playTimerSound, vibrateTimer } from '../lib/audio.ts'
import { formatMmSs } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'

const PRESETS = [60, 90, 120]

/**
 * Pausentimer-Leiste über der Tab-Leiste (F9). Restzeit aus gespeichertem Endzeitpunkt,
 * daher nach App-Wechsel korrekt (AK12). Signal nur im Vordergrund.
 */
export function TimerBar({ defaultSec }: { defaultSec: number }) {
  const timer = useAppStore((s) => s.data.timer)
  const settings = useAppStore((s) => s.data.settings)
  const startTimer = useAppStore((s) => s.startTimer)
  const addTimerSeconds = useAppStore((s) => s.addTimerSeconds)
  const restartTimer = useAppStore((s) => s.restartTimer)
  const stopTimer = useAppStore((s) => s.stopTimer)
  const markSignalled = useAppStore((s) => s.markTimerSignalled)
  const exerciseName = useAppStore((s) => (timer?.exerciseId ? s.data.exercises.find((e) => e.id === timer.exerciseId)?.name : undefined))
  const now = useNow(250, !!timer)
  const [custom, setCustom] = useState(false)
  const [customText, setCustomText] = useState(String(defaultSec))
  const signalledRef = useRef(false)

  const remaining = timer ? Math.ceil((new Date(timer.endsAt).getTime() - now) / 1000) : 0
  const finished = !!timer && remaining <= 0

  useEffect(() => {
    if (!timer) {
      signalledRef.current = false
      return
    }
    if (finished && !timer.signalled && !signalledRef.current) {
      signalledRef.current = true
      if (settings.sound) playTimerSound()
      if (settings.vibration) vibrateTimer()
      markSignalled()
    }
    if (!finished) signalledRef.current = false
  }, [timer, finished, settings.sound, settings.vibration, markSignalled])

  const startCustom = () => {
    const n = Number(customText)
    if (Number.isInteger(n) && n >= 5 && n <= 900) {
      startTimer(n)
      setCustom(false)
    }
  }

  if (!timer) {
    return (
      <div className="timerbar timerbar-idle" data-testid="timer-idle">
        <span className="muted" style={{ fontSize: 14, flex: 'none' }}>Pause</span>
        {PRESETS.map((p) => (
          <button type="button" key={p} className="btn btn-sm" onClick={() => startTimer(p)}>
            {formatMmSs(p)}
          </button>
        ))}
        {custom ? (
          <span className="input-inline" style={{ flex: 1 }}>
            <input className="input input-num" style={{ fontSize: 17, minHeight: 36, padding: 4 }} inputMode="numeric" aria-label="Eigene Dauer in Sekunden" value={customText} onChange={(e) => setCustomText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && startCustom()} autoFocus />
            <button type="button" className="btn btn-sm btn-primary" onClick={startCustom}>Start</button>
          </span>
        ) : (
          <button type="button" className="btn btn-sm" onClick={() => setCustom(true)} aria-label="Eigene Dauer">
            {formatMmSs(defaultSec)} ⋯
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={`timerbar ${finished ? 'timerbar-done' : ''}`} role="timer" aria-live={finished ? 'assertive' : 'off'} data-testid="timer">
      <div className="timer-main">
        <span className="timer-time num" data-testid="timer-remaining">{finished ? 'Pause vorbei' : formatMmSs(remaining)}</span>
        <span className="timer-sub ellipsis">{exerciseName ?? 'Pause'} · {formatMmSs(timer.durationSec)}</span>
      </div>
      {finished ? (
        <>
          <button type="button" className="btn btn-sm" onClick={restartTimer}>Neu</button>
          <button type="button" className="btn btn-sm btn-primary" onClick={stopTimer}>OK</button>
        </>
      ) : (
        <>
          <button type="button" className="btn btn-sm" onClick={() => addTimerSeconds(30)}>+30 s</button>
          <button type="button" className="btn btn-sm" onClick={restartTimer} aria-label="Neu starten">Neu</button>
          <button type="button" className="btn btn-sm" onClick={stopTimer} aria-label="Überspringen">Skip</button>
        </>
      )}
    </div>
  )
}
