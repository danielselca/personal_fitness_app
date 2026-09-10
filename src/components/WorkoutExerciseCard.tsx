import { useMemo, useState } from 'react'
import { lastValuesFor } from '../domain/suggestions.ts'
import type { Exercise, WorkoutEntry, WorkoutSet } from '../domain/types.ts'
import { formatKg, formatRelativeDay } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'
import { SetRow } from './SetRow.tsx'

export function WorkoutExerciseCard({
  exercise,
  entry,
  workoutId,
  isFirst,
  isLast,
  onSetDone,
  onDeleteSet,
}: {
  exercise: Exercise
  entry: WorkoutEntry
  workoutId: string
  isFirst: boolean
  isLast: boolean
  onSetDone: (set: WorkoutSet) => void
  onDeleteSet: (set: WorkoutSet, index: number) => void
}) {
  const workouts = useAppStore((s) => s.data.workouts)
  const settings = useAppStore((s) => s.data.settings)
  const updateSet = useAppStore((s) => s.updateSet)
  const setSetDone = useAppStore((s) => s.setSetDone)
  const addSet = useAppStore((s) => s.addSet)
  const deleteSet = useAppStore((s) => s.deleteSet)
  const setEntryNote = useAppStore((s) => s.setEntryNote)
  const move = useAppStore((s) => s.moveWorkoutEntry)
  const remove = useAppStore((s) => s.removeExerciseFromWorkout)
  const [noteOpen, setNoteOpen] = useState(!!entry.note)
  const last = useMemo(() => lastValuesFor(workouts, exercise.id, workoutId), [workouts, exercise.id, workoutId])
  const currentIndex = entry.sets.findIndex((s) => !s.done)
  const weightStep = exercise.weightStep ?? settings.weightStep

  const sourceLine = last
    ? `Letztes Mal: ${formatRelativeDay(last.date)} · ${last.sets.length} Sätze`
    : exercise.planTarget
      ? `Vorgabe: ${exercise.planTarget.sets} × ${exercise.planTarget.reps} × ${formatKg(exercise.planTarget.weightKg)} (${exercise.planTarget.source})`
      : 'Keine früheren Werte'

  return (
    <section className="card wcard" aria-label={exercise.name}>
      <div className="wcard-head">
        <div className="row-main">
          <h3 className="wcard-title ellipsis">{exercise.name}{exercise.machineNo && <span className="muted"> · {exercise.machineNo}</span>}</h3>
          <div className="row-sub" data-testid="source-line">{sourceLine}</div>
        </div>
        <div className="wcard-actions">
          <button type="button" className="btn btn-icon btn-sm" aria-label={`${exercise.name} nach oben`} disabled={isFirst} onClick={() => move(exercise.id, -1)}>↑</button>
          <button type="button" className="btn btn-icon btn-sm" aria-label={`${exercise.name} nach unten`} disabled={isLast} onClick={() => move(exercise.id, 1)}>↓</button>
          <button type="button" className="btn btn-icon btn-sm" aria-label={`${exercise.name} entfernen`} onClick={() => remove(exercise.id)}>✕</button>
        </div>
      </div>
      {exercise.hint && <p className="muted" style={{ fontSize: 13, margin: '0 0 6px' }}>{exercise.hint}</p>}

      <div className="setrows">
        <div className="setrow-header muted">
          <span className="set-no">#</span>
          <span className="set-last">Letztes Mal</span>
          <span>kg × Wdh.</span>
        </div>
        {entry.sets.map((s, i) => (
          <SetRow
            key={s.id}
            index={i + 1}
            set={s}
            last={last ? (last.sets[i] ?? null) : null}
            current={i === currentIndex}
            weightStep={weightStep}
            onChange={(patch) => updateSet(exercise.id, s.id, patch)}
            onToggleDone={() => {
              const ok = setSetDone(exercise.id, s.id, !s.done)
              if (ok && !s.done) onSetDone(s)
            }}
            onDelete={() => {
              const removed = deleteSet(exercise.id, s.id)
              if (removed) onDeleteSet(removed.set, removed.index)
            }}
          />
        ))}
      </div>

      <div className="btn-row" style={{ marginTop: 8 }}>
        <button type="button" className="btn btn-sm" onClick={() => addSet(exercise.id)}>+ Satz</button>
        <button type="button" className="btn btn-sm" aria-expanded={noteOpen} onClick={() => setNoteOpen(!noteOpen)}>
          {entry.note ? 'Notiz ✎' : 'Notiz'}
        </button>
      </div>
      {noteOpen && (
        <input
          className="input"
          style={{ marginTop: 8 }}
          aria-label={`Notiz zu ${exercise.name}`}
          placeholder="Kurze Notiz, z. B. Griff eng"
          value={entry.note ?? ''}
          onChange={(e) => setEntryNote(exercise.id, e.target.value)}
        />
      )}
    </section>
  )
}
