import { useMemo, useState } from 'react'
import { ExerciseForm } from '../components/ExerciseForm.tsx'
import { ConfirmDialog } from '../components/Sheet.tsx'
import { WeightChart } from '../components/WeightChart.tsx'
import { weightProgression } from '../domain/stats.ts'
import { matchesQuery } from '../domain/suggestions.ts'
import type { Exercise } from '../domain/types.ts'
import { formatDate, formatKg, formatMmSs, formatNumber } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'

export function ExercisesScreen() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  if (selectedId) return <ExerciseDetail id={selectedId} onBack={() => setSelectedId(null)} />
  return <ExerciseList onSelect={setSelectedId} />
}

function ExerciseList({ onSelect }: { onSelect: (id: string) => void }) {
  const exercises = useAppStore((s) => s.data.exercises)
  const addExercise = useAppStore((s) => s.addExercise)
  const [query, setQuery] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const [creating, setCreating] = useState(false)

  const list = useMemo(() => {
    const q = query.trim()
    return exercises
      .filter((e) => (showArchived ? e.archived : !e.archived))
      .filter((e) => matchesQuery(e, q))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }, [exercises, query, showArchived])
  const archivedCount = exercises.filter((e) => e.archived).length

  return (
    <>
      <div className="input-inline" style={{ marginBottom: 12 }}>
        <input
          className="input"
          type="search"
          placeholder="Suchen (Name, Gerät-Nr.)"
          aria-label="Übungen suchen"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          enterKeyHint="search"
        />
        <button type="button" className="btn btn-primary" onClick={() => setCreating(true)} aria-label="Neue Übung">
          +
        </button>
      </div>
      {list.length === 0 && (
        <div className="card empty">
          <strong>{showArchived ? 'Keine archivierten Übungen' : 'Nichts gefunden'}</strong>
          {!showArchived && query.trim() && (
            <button type="button" className="btn" style={{ marginTop: 8 }} onClick={() => setCreating(true)}>
              „{query.trim()}“ als neue Übung anlegen
            </button>
          )}
        </div>
      )}
      <ul className="list">
        {list.map((e) => (
          <li key={e.id}>
            <button type="button" className="card card-tap row" onClick={() => onSelect(e.id)}>
              <span className="row-main">
                <span className="row-title ellipsis" style={{ display: 'block' }}>{e.name}</span>
                <span className="row-sub">
                  {e.machineNo && `Gerät ${e.machineNo} · `}
                  {e.planTarget ? `Vorgabe ${e.planTarget.sets} × ${e.planTarget.reps} × ${formatKg(e.planTarget.weightKg)}` : 'keine Vorgabe'}
                </span>
              </span>
              <span className="muted" aria-hidden="true">›</span>
            </button>
          </li>
        ))}
      </ul>
      {archivedCount > 0 && (
        <button type="button" className="btn" style={{ marginTop: 16, width: '100%' }} onClick={() => setShowArchived(!showArchived)}>
          {showArchived ? 'Aktive Übungen anzeigen' : `Archivierte anzeigen (${archivedCount})`}
        </button>
      )}
      {creating && (
        <ExerciseForm
          title="Neue Übung"
          submitLabel="Anlegen"
          initial={query.trim() ? ({ name: query.trim(), aliases: [] } as unknown as Exercise) : undefined}
          onSubmit={(v) => {
            const r = addExercise(v)
            if (!r.ok) return r.error
            setCreating(false)
            setQuery('')
            onSelect(r.exercise.id)
            return null
          }}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  )
}

function ExerciseDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const exercise = useAppStore((s) => s.data.exercises.find((e) => e.id === id))
  const workouts = useAppStore((s) => s.data.workouts)
  const settings = useAppStore((s) => s.data.settings)
  const updateExercise = useAppStore((s) => s.updateExercise)
  const setArchived = useAppStore((s) => s.setExerciseArchived)
  const [editing, setEditing] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const history = useMemo(() => weightProgression(workouts, id), [workouts, id])

  if (!exercise) {
    return (
      <div className="card empty">
        <strong>Übung nicht gefunden</strong>
        <button type="button" className="btn" onClick={onBack}>Zurück</button>
      </div>
    )
  }

  return (
    <>
      <button type="button" className="btn btn-sm" onClick={onBack} style={{ marginBottom: 12 }}>
        ‹ Alle Übungen
      </button>
      <div className="card">
        <h2 style={{ margin: '0 0 4px', fontSize: 22 }}>{exercise.name}</h2>
        {exercise.archived && <p className="muted" style={{ margin: 0 }}>Archiviert</p>}
        <dl className="kv">
          {exercise.machineNo && (<><dt>Gerät</dt><dd>{exercise.machineNo}</dd></>)}
          {exercise.aliases.length > 0 && (<><dt>Auch</dt><dd>{exercise.aliases.join(', ')}</dd></>)}
          <dt>Pause</dt><dd>{formatMmSs(exercise.defaultRestSec ?? settings.defaultRestSec)} min{exercise.defaultRestSec ? '' : ' (Standard)'}</dd>
          <dt>Schritt</dt><dd>{formatNumber(exercise.weightStep ?? settings.weightStep)} kg{exercise.weightStep ? '' : ' (Standard)'}</dd>
          {exercise.planTarget && (
            <>
              <dt>Vorgabe</dt>
              <dd>
                {exercise.planTarget.sets} × {exercise.planTarget.reps} × {formatKg(exercise.planTarget.weightKg)}
                <span className="muted"> ({exercise.planTarget.source})</span>
              </dd>
            </>
          )}
          {exercise.hint && (<><dt>Hinweis</dt><dd>{exercise.hint}</dd></>)}
        </dl>
        <div className="btn-row" style={{ marginTop: 12 }}>
          <button type="button" className="btn" onClick={() => setEditing(true)}>Bearbeiten</button>
          {exercise.archived ? (
            <button type="button" className="btn" onClick={() => setArchived(id, false)}>Wiederherstellen</button>
          ) : (
            <button type="button" className="btn" onClick={() => setConfirmArchive(true)}>Archivieren</button>
          )}
        </div>
      </div>

      <h2 className="section-title">Verlauf</h2>
      {history.length === 0 ? (
        <div className="card empty">
          <strong>Noch keine Trainingswerte</strong>
          Sobald du diese Übung in einem Training abhakst, siehst du hier Gewicht und Wiederholungen.
        </div>
      ) : (
        <>
          <div className="card">
            <WeightChart points={history} />
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr><th>Datum</th><th>Max.</th><th>Sätze</th></tr>
              </thead>
              <tbody>
                {[...history].reverse().map((p) => (
                  <tr key={p.workoutId}>
                    <td>{formatDate(p.date)}</td>
                    <td className="num">{p.maxWeightKg === null ? '–' : `${p.reps} × ${formatKg(p.maxWeightKg)}`}</td>
                    <td className="num muted">{p.sets.map((s) => `${s.reps}×${s.weightKg === null ? '–' : formatNumber(s.weightKg)}`).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {editing && (
        <ExerciseForm
          title="Übung bearbeiten"
          submitLabel="Speichern"
          initial={exercise}
          onSubmit={(v) => {
            const r = updateExercise(id, v)
            if (!r.ok) return r.error
            setEditing(false)
            return null
          }}
          onClose={() => setEditing(false)}
        />
      )}
      {confirmArchive && (
        <ConfirmDialog
          title="Übung archivieren?"
          text="Die Übung verschwindet aus der Auswahl. Bisherige Trainings bleiben erhalten. Du kannst sie jederzeit wiederherstellen."
          confirmLabel="Archivieren"
          onConfirm={() => {
            setArchived(id, true)
            setConfirmArchive(false)
          }}
          onCancel={() => setConfirmArchive(false)}
        />
      )}
    </>
  )
}
