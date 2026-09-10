/** Einfaches Balkendiagramm (eigenes SVG) für Trainings pro Woche und Volumen je Training (F11). */
export function BarChart({
  bars,
  label,
  formatValue,
  height = 150,
}: {
  bars: { key: string; label: string; value: number; sub?: string }[]
  label: string
  formatValue: (v: number) => string
  height?: number
}) {
  const W = 320
  const H = height
  const padL = 8
  const padR = 8
  const padT = 18
  const padB = 22
  const n = bars.length
  const max = Math.max(1, ...bars.map((b) => b.value))
  const slot = (W - padL - padR) / Math.max(1, n)
  const barW = Math.max(6, Math.min(28, slot * 0.62))
  const y = (v: number) => padT + ((max - v) * (H - padT - padB)) / max
  return (
    <figure className="chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={label} width="100%" height="auto">
        <line x1={padL} x2={W - padR} y1={H - padB} y2={H - padB} className="chart-grid" />
        {bars.map((b, i) => {
          const x = padL + i * slot + (slot - barW) / 2
          const top = y(b.value)
          const h = b.value === 0 ? 2 : H - padB - top
          return (
            <g key={b.key}>
              <rect x={x} y={b.value === 0 ? H - padB - 2 : top} width={barW} height={h} rx={3} className={b.value === 0 ? 'chart-bar-zero' : 'chart-bar'} />
              {(n <= 14 || b.value > 0) && (
                <text x={x + barW / 2} y={(b.value === 0 ? H - padB - 2 : top) - 4} textAnchor="middle" className="chart-bar-label">{formatValue(b.value)}</text>
              )}
              {(n <= 8 || i % Math.ceil(n / 6) === 0 || i === n - 1) && (
                <text x={x + barW / 2} y={H - 6} textAnchor="middle" className="chart-tick">{b.label}</text>
              )}
            </g>
          )
        })}
      </svg>
    </figure>
  )
}
