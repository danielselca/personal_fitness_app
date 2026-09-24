import { useEffect, useRef } from 'react'
import { holdRemainingSec, holdSecFor, holdSegments, restSecFor } from '../domain/hold.ts'
import type { Exercise, WorkoutEntry } from '../domain/types.ts'
import { useNow } from '../hooks/useNow.ts'
import { playTimerSound, unlockAudio, vibrateTimer } from '../lib/audio.ts'
import { formatMmSs } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'

const SIZE = 220
const STROKE = 18
const R = (SIZE - STROKE) / 2 - 2
const C = 2 * Math.PI * R
const GAP_DEG = 2.5

/**
 * Halteübung als Donut: je Satz ein Arbeitsstück (60 s halten), dazwischen Pausenstücke.
 * In der Mitte läuft die aktuelle Phase rückwärts. Arbeit → Pause → nächster Satz laufen
 * automatisch durch; Endzeitpunkte sind gespeichert, daher nach App-Wechsel korrekt.
 */
export function HoldDonut({ exercise, entry }: { exercise: Exercise; entry: WorkoutEntry }) {
  const settings = useAppStore((s) => s.data.settings)
  const start = useAppStore((s) => s.startHold)
  const pause = useAppStore((s) => s.pauseHold)
  const resume = useAppStore((s) => s.resumeHold)
  const skip = useAppStore((s) => s.skipHoldPhase)
  const stop = useAppStore((s) => s.stopHold)
  const advance = useAppStore((s) => s.advanceHold)
  const addSet = useAppStore((s) => s.addSet)
  const deleteSet = useAppStore((s) => s.deleteSet)
  const hold = entry.hold
  const running = !!hold && hold.pausedRemainingSec === undefined
  const now = useNow(250, running)
  const holdSec = holdSecFor(exercise)
  const restSec = restSecFor(exercise, settings, entry)
  const signalRef = useRef(0)

  // Abgelaufene Phasen nachziehen und signalisieren
  useEffect(() => {
    if (!running) return
    const events = advance(exercise.id, now)
    if (events > 0 && signalRef.current !== now) {
      signalRef.current = now
      if (settings.sound) playTimerSound()
      if (settings.vibration) vibrateTimer()
    }
  }, [now, running, advance, exercise.id, settings.sound, settings.vibration])

  const segments = holdSegments(entry, holdSec, restSec, now)
  const total = segments.reduce((a, s) => a + s.sec, 0)
  const gaps = segments.length
  const usable = 360 - gaps * GAP_DEG
  const doneCount = entry.sets.filter((s) => s.done).length
  const allDone = entry.sets.length > 0 && doneCount === entry.sets.length
  const remaining = hold ? holdRemainingSec(hold, now) : 0
  const lastUndone = [...entry.sets].reverse().find((s) => !s.done)

  const arcs = segments.reduce<{ list: { seg: (typeof segments)[number]; startAngle: number; sweep: number; key: number }[]; angle: number }>(
    (acc, seg, i) => {
      const sweep = (seg.sec / total) * usable
      acc.list.push({ seg, startAngle: acc.angle, sweep, key: i })
      return { list: acc.list, angle: acc.angle + sweep + GAP_DEG }
    },
    { list: [], angle: -90 },
  ).list

  const arc = (startAngle: number, sweep: number, cls: string, opacity?: number) => {
    const len = (sweep / 360) * C
    return (
      <circle
        cx={SIZE / 2}
        cy={SIZE / 2}
        r={R}
        className={cls}
        strokeWidth={STROKE}
        strokeDasharray={`${len} ${C - len}`}
        transform={`rotate(${startAngle} ${SIZE / 2} ${SIZE / 2})`}
        style={opacity !== undefined ? { opacity } : undefined}
      />
    )
  }

  const centerLabel = allDone
    ? 'Fertig'
    : hold
      ? `Satz ${hold.setIndex + 1}/${entry.sets.length} · ${hold.phase === 'work' ? 'Halten' : 'Pause'}${running ? '' : ' · pausiert'}`
      : `${entry.sets.length} × ${holdSec} s · Pause ${restSec} s`
  const centerValue = allDone ? '✓' : hold ? formatMmSs(remaining) : formatMmSs(holdSec)

  return (
    <div className="hold" data-testid="hold-donut" data-phase={hold?.phase ?? (allDone ? 'done' : 'idle')}>
      <div className="hold-ring">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${doneCount} von ${entry.sets.length} Sätzen gehalten`}>
          <g fill="none" strokeLinecap="butt">
            {arcs.map(({ seg, startAngle, sweep, key }) => (
              <g key={key} data-testid={`hold-seg-${seg.kind}-${seg.setIndex}`} data-state={seg.state}>
                {arc(startAngle, sweep, `hold-arc hold-arc-${seg.kind} hold-arc-${seg.state}`)}
                {seg.state === 'current' && seg.progress > 0 && arc(startAngle, sweep * Math.min(1, seg.progress), `hold-arc hold-arc-${seg.kind} hold-arc-fill`)}
              </g>
            ))}
          </g>
        </svg>
        <button
          type="button"
          className="hold-center"
          aria-label={allDone ? 'Alle Sätze gehalten' : hold ? (running ? 'Pausieren' : 'Weiter') : 'Halten starten'}
          onClick={() => {
            unlockAudio()
            if (allDone) return
            if (!hold) start(exercise.id)
            else if (running) pause(exercise.id)
            else resume(exercise.id)
          }}
        >
          <span className={`hold-time num ${hold?.phase === 'rest' ? 'hold-time-rest' : ''}`} data-testid="hold-remaining">{centerValue}</span>
          <span className="hold-label">{centerLabel}</span>
          {!allDone && <span className="hold-hint">{hold ? (running ? 'Tippen = Pause' : 'Tippen = Weiter') : 'Tippen = Start'}</span>}
        </button>
      </div>

      <div className="hold-legend label">
        <span><i className="hold-dot hold-dot-work" /> Halten {holdSec} s</span>
        <span><i className="hold-dot hold-dot-rest" /> Pause {restSec} s</span>
      </div>

      <div className="btn-row" style={{ marginTop: 8 }}>
        {hold ? (
          <>
            <button type="button" className="btn btn-sm" onClick={() => skip(exercise.id)}>{hold.phase === 'work' ? 'Satz fertig' : 'Pause überspringen'}</button>
            <button type="button" className="btn btn-sm btn-danger-text" onClick={() => stop(exercise.id)}>Abbrechen</button>
          </>
        ) : (
          <>
            <button type="button" className="btn btn-sm" onClick={() => addSet(exercise.id)}>+ Satz</button>
            <button type="button" className="btn btn-sm" disabled={!lastUndone} aria-label="Letzten offenen Satz entfernen" onClick={() => lastUndone && deleteSet(exercise.id, lastUndone.id)}>− Satz</button>
          </>
        )}
      </div>
    </div>
  )
}
