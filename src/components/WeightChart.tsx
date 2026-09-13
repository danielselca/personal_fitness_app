import type { WeightPoint } from '../domain/stats.ts'
import { formatDate, formatNumber } from '../lib/format.ts'

/**
 * Liniendiagramm: Höchstgewicht je Training mit Wdh.-Beschriftung (F11, AK19).
 * Eigenes SVG, keine Bibliothek; Farben aus den Design-Tokens.
 */
export function WeightChart({ points, mode = 'weight' }: { points: WeightPoint[]; mode?: 'weight' | 'reps' }) {
  const data = points
    .map((p) => ({ ...p, value: mode === 'reps' ? Math.max(...p.sets.map((s) => s.reps)) : p.maxWeightKg }))
    .filter((p): p is typeof p & { value: number } => p.value !== null)
  if (data.length === 0) {
    return <p className="muted" style={{ margin: 0 }}>Alle Sätze ohne Gewicht, kein Gewichtsverlauf.</p>
  }
  const title = mode === 'reps' ? 'Wiederholungsverlauf' : 'Gewichtsverlauf'
  const W = 320
  const H = 160
  const padL = 36
  const padR = 12
  const padT = 22
  const padB = 28
  const shown = data.slice(-20)
  const ys = shown.map((p) => p.value)
  let min = Math.min(...ys)
  let max = Math.max(...ys)
  if (min === max) {
    min -= mode === 'reps' ? 2 : 2.5
    max += mode === 'reps' ? 2 : 2.5
  }
  const span = max - min
  min -= span * 0.1
  max += span * 0.1
  const x = (i: number) => (shown.length === 1 ? W / 2 : padL + (i * (W - padL - padR)) / (shown.length - 1))
  const y = (v: number) => padT + ((max - v) * (H - padT - padB)) / (max - min)
  const path = shown.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(' ')
  const ticks = [min + span * 0.1, (min + max) / 2, max - span * 0.1]

  return (
    <figure className="chart" aria-label={title}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={title} width="100%" height="auto">
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} className="chart-grid" />
            <text x={padL - 6} y={y(t) + 4} textAnchor="end" className="chart-tick">{mode === 'reps' ? Math.round(t) : formatNumber(Math.round(t * 2) / 2)}</text>
          </g>
        ))}
        <path d={path} className="chart-line" />
        {shown.map((p, i) => (
          <g key={p.workoutId}>
            <circle cx={x(i)} cy={y(p.value)} r={4} className="chart-dot" />
            {mode === 'weight' && <text x={x(i)} y={y(p.value) - 9} textAnchor="middle" className="chart-label">{p.reps}×</text>}
          </g>
        ))}
        {shown.length > 0 && (
          <>
            <text x={x(0)} y={H - 8} textAnchor={shown.length === 1 ? 'middle' : 'start'} className="chart-tick">{formatDate(shown[0].date).slice(-10)}</text>
            {shown.length > 1 && (
              <text x={x(shown.length - 1)} y={H - 8} textAnchor="end" className="chart-tick">{formatDate(shown[shown.length - 1].date).slice(-10)}</text>
            )}
          </>
        )}
      </svg>
      <figcaption className="muted" style={{ fontSize: 13 }}>
        {mode === 'reps' ? 'Meiste Wiederholungen je Training' : 'Höchstgewicht je Training, Beschriftung = Wiederholungen'}{data.length > 20 ? ` (letzte 20 von ${data.length})` : ''}
      </figcaption>
    </figure>
  )
}
