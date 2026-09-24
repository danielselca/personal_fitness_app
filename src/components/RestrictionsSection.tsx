import { useState } from 'react'
import { activeRestrictions, dayKey, restrictionLabel } from '../domain/restrictions.ts'
import { BODY_PARTS, BODY_PART_LABEL, MUSCLES, MUSCLE_INFO, type BodyPart, type Muscle } from '../domain/taxonomy.ts'
import { useAppStore } from '../store/appStore.ts'
import { Sheet } from './Sheet.tsx'

/**
 * Körperbereiche vorübergehend schonen (z. B. Schulter): betroffene Übungen werden im Training
 * markiert, „Übung tauschen“ schlägt nur Übungen ohne diese Bereiche vor. Abgelaufene Einträge
 * (nach dem Enddatum) wirken nicht mehr und werden ausgeblendet.
 */
export function RestrictionsSection() {
  const restrictions = useAppStore((s) => s.data.restrictions)
  const remove = useAppStore((s) => s.removeRestriction)
  const [adding, setAdding] = useState(false)
  const active = activeRestrictions(restrictions, dayKey())

  return (
    <>
      <h2 className="section-title">Körperbereiche schonen</h2>
      <div className="card">
        {active.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            Probleme mit Schulter, Knie oder Rücken? Wähle Bereiche, die du vorübergehend schonen möchtest. Betroffene Übungen werden im Training markiert und lassen sich tauschen.
          </p>
        ) : (
          <ul className="list" aria-label="Geschonte Bereiche">
            {active.map((r) => (
              <li key={r.id} className="restrict-row">
                <span className="row-main">
                  <span className="row-title" style={{ display: 'block' }}>{restrictionLabel(r)}</span>
                  {r.note && <span className="row-sub">{r.note}</span>}
                </span>
                <button type="button" className="btn btn-sm" aria-label={`Schonen beenden: ${restrictionLabel(r)}`} onClick={() => remove(r.id)}>
                  Beenden
                </button>
              </li>
            ))}
          </ul>
        )}
        <button type="button" className="btn btn-block" style={{ marginTop: 12 }} onClick={() => setAdding(true)}>
          + Bereich schonen
        </button>
        <p className="muted" style={{ fontSize: 13, margin: '10px 0 0' }}>Kein Ersatz für ärztlichen oder physiotherapeutischen Rat – bei Schmerzen bitte abklären lassen.</p>
      </div>
      {adding && <AddRestrictionSheet onClose={() => setAdding(false)} />}
    </>
  )
}

function AddRestrictionSheet({ onClose }: { onClose: () => void }) {
  const add = useAppStore((s) => s.addRestriction)
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([])
  const [muscles, setMuscles] = useState<Muscle[]>([])
  const [note, setNote] = useState('')
  const [until, setUntil] = useState('')
  const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v])
  const empty = bodyParts.length === 0 && muscles.length === 0

  return (
    <Sheet
      title="Bereich schonen"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={empty}
          onClick={() => {
            if (add({ bodyParts, muscles, note, until: until || undefined })) onClose()
          }}
        >
          {empty ? 'Bereich wählen' : 'Schonen'}
        </button>
      }
    >
      <div className="field">
        <span>Körperbereiche</span>
        <div className="chip-wrap" role="group" aria-label="Körperbereiche">
          {BODY_PARTS.map((b) => (
            <button key={b} type="button" className="chip" aria-pressed={bodyParts.includes(b)} onClick={() => setBodyParts(toggle(bodyParts, b))}>
              {BODY_PART_LABEL[b]}
            </button>
          ))}
        </div>
      </div>
      <details className="form-section">
        <summary>Muskeln (optional)</summary>
        <div className="chip-wrap" role="group" aria-label="Muskeln">
          {MUSCLES.map((m) => (
            <button key={m} type="button" className="chip" aria-pressed={muscles.includes(m)} onClick={() => setMuscles(toggle(muscles, m))}>
              {MUSCLE_INFO[m].label}
            </button>
          ))}
        </div>
      </details>
      <label className="field">
        <span>Bis einschließlich (optional)</span>
        <input className="input" type="date" value={until} min={dayKey()} onChange={(e) => setUntil(e.target.value)} aria-label="Schonen bis" />
      </label>
      <label className="field">
        <span>Notiz (optional)</span>
        <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="z. B. Impingement links" aria-label="Notiz" />
      </label>
    </Sheet>
  )
}
