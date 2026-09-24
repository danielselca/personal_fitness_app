import { useState } from 'react'
import { formatNumber } from '../lib/format.ts'
import { groupOf, GROUP_LABEL, muscleMapStatus, type GroupVolume, type MuscleMapStatus } from '../domain/coach/volume.ts'
import { MUSCLE_INFO, MUSCLES, type Muscle } from '../domain/taxonomy.ts'

/**
 * Muskelkarte (vorne/hinten): schlichte, eigene Figur; jede Fläche zeigt den Wochenstatus des
 * Muskels. Tippen zeigt Sätze und Übungen; dieselben Angaben gibt es als Liste.
 */

type Shape = { e: [number, number, number, number, number?] } | { d: string } | { r: [number, number, number, number] }

/** Formen je Muskel für die Vorderseite (F) und Rückseite (B), Koordinaten der linken Figur (Mitte x = 60). */
const mirror = (cx: number) => 120 - cx
const pair = (cx: number, cy: number, rx: number, ry: number, rot = 0): Shape[] => [{ e: [cx, cy, rx, ry, rot] }, { e: [mirror(cx), cy, rx, ry, -rot] }]

const FRONT: Partial<Record<Muscle, Shape[]>> = {
  brust: [{ d: 'M40 46Q50 42 59 46L59 62Q48 66 40 60Z' }, { d: 'M80 46Q70 42 61 46L61 62Q72 66 80 60Z' }],
  'schulter-vorne': pair(35, 46, 6, 7),
  'schulter-seitlich': pair(29, 48, 4, 7, 10),
  bizeps: pair(27, 67, 5, 12, 8),
  unterarme: pair(21, 102, 4.5, 14, 6),
  serratus: pair(41, 69, 3, 5),
  bauch: [{ r: [51, 66, 18, 42] }],
  'seitliche-bauchmuskeln': pair(44, 90, 5, 13),
  abduktoren: pair(38, 126, 4, 8),
  adduktoren: pair(55.5, 138, 3.5, 12),
  quadrizeps: pair(47, 152, 8.5, 24),
}

const BACK: Partial<Record<Muscle, Shape[]>> = {
  nacken: [{ r: [55, 24, 10, 9] }],
  'oberer-trapez': [{ d: 'M47 34L60 31L73 34L79 42L60 47L41 42Z' }],
  'schulter-hinten': pair(35, 46, 6, 7),
  'schulter-seitlich': pair(29, 48, 4, 7, 10),
  rotatorenmanschette: pair(47, 55, 6, 5),
  'oberer-ruecken': [{ d: 'M54 50L66 50L70 72L50 72Z' }],
  lat: [{ d: 'M38 58L48 66L54 100L43 96L36 72Z' }, { d: 'M82 58L72 66L66 100L77 96L84 72Z' }],
  trizeps: pair(27, 67, 5, 12, 8),
  unterarme: pair(21, 102, 4.5, 14, 6),
  'unterer-ruecken': [{ r: [52, 94, 16, 22] }],
  gesaess: pair(50, 128, 10, 10),
  beinbeuger: pair(48, 160, 8, 22),
  waden: pair(48, 202, 6, 16),
}

/** Umriss einer Figur. */
function Silhouette() {
  return (
    <g className="bm-body">
      <ellipse cx="60" cy="15" rx="10" ry="12" />
      <rect x="54" y="24" width="12" height="12" rx="3" />
      <path d="M34 40Q60 33 86 40L90 58L82 120Q60 128 38 120L30 58Z" />
      <rect x="22" y="42" width="11" height="48" rx="5.5" transform="rotate(8 27 42)" />
      <rect x="87" y="42" width="11" height="48" rx="5.5" transform="rotate(-8 93 42)" />
      <rect x="15" y="86" width="10" height="44" rx="5" transform="rotate(6 20 86)" />
      <rect x="95" y="86" width="10" height="44" rx="5" transform="rotate(-6 100 86)" />
      <rect x="38" y="116" width="20" height="66" rx="9" />
      <rect x="62" y="116" width="20" height="66" rx="9" />
      <rect x="40" y="180" width="16" height="56" rx="7" />
      <rect x="64" y="180" width="16" height="56" rx="7" />
    </g>
  )
}

function ShapeEl({ s }: { s: Shape }) {
  if ('e' in s) {
    const [cx, cy, rx, ry, rot] = s.e
    return <ellipse cx={cx} cy={cy} rx={rx} ry={ry} transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined} />
  }
  if ('r' in s) {
    const [x, y, w, h] = s.r
    return <rect x={x} y={y} width={w} height={h} rx={4} />
  }
  return <path d={s.d} />
}

const STATUS_LABEL: Record<MuscleMapStatus, string> = {
  keine: 'nicht trainiert',
  unter: 'unter Ziel',
  ziel: 'im Ziel',
  ueber: 'über Ziel',
  trainiert: 'trainiert',
  geschont: 'geschont',
}

const LEGEND: MuscleMapStatus[] = ['keine', 'unter', 'ziel', 'ueber', 'geschont']

export function BodyMap({ perMuscle, volumes, target }: { perMuscle: Map<Muscle, number>; volumes: GroupVolume[]; target: { min: number; max: number } }) {
  const [selected, setSelected] = useState<Muscle | null>(null)
  const status = (m: Muscle) => muscleMapStatus(m, perMuscle, volumes)
  const trained = MUSCLES.filter((m) => (perMuscle.get(m) ?? 0) > 0)
  const summary = trained.length
    ? `Muskelkarte: ${trained.length} Muskeln trainiert, ${MUSCLES.filter((m) => status(m) === 'unter').length} unter Ziel`
    : 'Muskelkarte: diese Woche noch keine Muskeln trainiert'

  const side = (shapes: Partial<Record<Muscle, Shape[]>>, dx: number) => (
    <g transform={dx ? `translate(${dx} 0)` : undefined}>
      <Silhouette />
      {(Object.keys(shapes) as Muscle[]).map((m) => (
        <g key={m} className="bm-muscle" data-status={status(m)} data-selected={selected === m || undefined} onClick={() => setSelected(selected === m ? null : m)}>
          {shapes[m]!.map((s, i) => (
            <ShapeEl key={i} s={s} />
          ))}
        </g>
      ))}
    </g>
  )

  const info = (m: Muscle) => {
    const g = groupOf(m)
    const gv = g && volumes.find((v) => v.id === g)
    const n = perMuscle.get(m) ?? 0
    return { n, gv, text: `${formatNumber(n)} ${n === 1 ? 'Satz' : 'Sätze'} · ${STATUS_LABEL[status(m)]}` }
  }
  const sel = selected && info(selected)

  return (
    <div className="bodymap">
      <svg viewBox="0 0 240 252" role="img" aria-label={summary} className="bm-svg">
        <defs>
          <pattern id="bm-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="4" height="4" className="bm-hatch-bg" />
            <line x1="0" y1="0" x2="0" y2="4" className="bm-hatch-line" />
          </pattern>
        </defs>
        {side(FRONT, 0)}
        {side(BACK, 120)}
        <text x="60" y="249" textAnchor="middle" className="bm-caption">vorne</text>
        <text x="180" y="249" textAnchor="middle" className="bm-caption">hinten</text>
      </svg>
      <ul className="bm-legend" aria-label="Legende">
        {LEGEND.map((s) => (
          <li key={s}>
            <svg width="12" height="12" aria-hidden="true"><rect width="12" height="12" rx="3" className="bm-swatch" data-status={s} /></svg>
            {STATUS_LABEL[s]}
          </li>
        ))}
      </ul>
      {sel && selected && (
        <div className="bm-info" role="status">
          <strong>{MUSCLE_INFO[selected].label}</strong>: {sel.text}
          {sel.gv && sel.gv.status !== 'geschont' && (
            <span className="row-sub" style={{ display: 'block' }}>
              Gruppe {GROUP_LABEL[sel.gv.id]}: {formatNumber(sel.gv.sets)} {sel.gv.sets === 1 ? 'Satz' : 'Sätze'}, Ziel {target.min}–{target.max}
              {sel.gv.exercises.length > 0 && ` · ${sel.gv.exercises.map((e) => e.name).join(', ')}`}
            </span>
          )}
        </div>
      )}
      <details className="form-section">
        <summary>Als Liste</summary>
        <ul className="bm-list" aria-label="Muskeln diese Woche">
          {MUSCLES.map((m) => (
            <li key={m}>
              <span>{MUSCLE_INFO[m].label}</span>
              <span className="muted">{info(m).text}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
