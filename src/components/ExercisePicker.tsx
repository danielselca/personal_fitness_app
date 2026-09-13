import { useMemo, useState } from 'react'
import { noWeightFirst, sortForPicker } from '../domain/progress.ts'
import { matchesQuery, normalizeName } from '../domain/suggestions.ts'
import { useAppStore } from '../store/appStore.ts'
import { Sheet } from './Sheet.tsx'

/**
 * Übungsauswahl fürs Training: Suche, Mehrfachauswahl, neue Übung direkt aus dem Suchtext (F1, AK4b).
 */
export function ExercisePicker({ excludeIds, onAdd, onClose }: { excludeIds: string[]; onAdd: (ids: string[]) => void; onClose: () => void }) {
  const exercises = useAppStore((s) => s.data.exercises)
  const addExercise = useAppStore((s) => s.addExercise)
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const available = useMemo(() => sortForPicker(exercises.filter((e) => !e.archived && !excludeIds.includes(e.id))), [exercises, excludeIds])
  const list = useMemo(() => available.filter((e) => matchesQuery(e, query)), [available, query])
  const q = query.trim()
  const exactExists = q ? exercises.some((e) => normalizeName(e.name) === normalizeName(q)) : true

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  // Beim Hinzufügen: ohne Gewicht zuerst, sonst in Antipp-Reihenfolge
  const ordered = (ids: string[]) => noWeightFirst(ids, (id) => !!exercises.find((e) => e.id === id)?.noWeight)

  const createAndAdd = () => {
    const r = addExercise({ name: q })
    if (!r.ok) return setError(r.error)
    onAdd([...ordered(selected), r.exercise.id])
  }

  return (
    <Sheet
      title="Übungen hinzufügen"
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-primary btn-block" disabled={selected.length === 0} onClick={() => onAdd(ordered(selected))}>
          {selected.length === 0 ? 'Übungen auswählen' : `${selected.length} hinzufügen`}
        </button>
      }
    >
      <input
        className="input"
        type="search"
        placeholder="Suchen oder neu anlegen"
        aria-label="Übung suchen"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setError(null)
        }}
        autoFocus
        enterKeyHint="search"
      />
      {error && <p className="error" role="alert">{error}</p>}
      {q && !exactExists && (
        <button type="button" className="btn" style={{ width: '100%', margin: '12px 0 4px' }} onClick={createAndAdd}>
          „{q}“ als neue Übung anlegen
        </button>
      )}
      <ul className="list" style={{ marginTop: 12 }}>
        {list.map((e, i) => {
          const on = selected.includes(e.id)
          const groupStart = !q && (i === 0 || !!list[i - 1].noWeight !== !!e.noWeight)
          return (
            <li key={e.id} className={groupStart ? 'picker-group' : undefined} data-group={groupStart ? (e.noWeight ? 'Ohne Gewicht' : 'Mit Gewicht') : undefined}>
              <button type="button" aria-pressed={on} className={`card card-tap row picker-row ${on ? 'picker-on' : ''}`} onClick={() => toggle(e.id)}>
                <span className="row-main">
                  <span className="row-title ellipsis" style={{ display: 'block' }}>{e.name}</span>
                  {(e.machineNo || (q && e.noWeight)) && (
                    <span className="row-sub">{[e.machineNo && `Gerät ${e.machineNo}`, q && e.noWeight && 'ohne Gewicht'].filter(Boolean).join(' · ')}</span>
                  )}
                </span>
                <span className={`check-mark ${on ? 'check-on' : ''}`} aria-hidden="true">{on ? '✓' : ''}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {list.length === 0 && !q && <p className="muted">Alle Übungen sind bereits im Training.</p>}
      {list.length === 0 && q && exactExists && <p className="muted">Bereits im Training oder archiviert.</p>}
    </Sheet>
  )
}
