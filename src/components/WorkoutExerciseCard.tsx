import { useMemo, useState } from 'react'
import { entryState } from '../domain/progress.ts'
import { lastValuesFor } from '../domain/suggestions.ts'
import type { Exercise, WorkoutEntry, WorkoutSet } from '../domain/types.ts'
import { formatKg, formatRelativeDay, formatSet } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'
import { SetRow } from './SetRow.tsx'

/**
 * Übungskarte im aktiven Training. Eingeklappt nur eine Zeile (Nr., Name, Fortschritt);
 * ausgeklappt die Sätze. Die aktuelle Übung ist farbig markiert, erledigte grün.
 */
export function WorkoutExerciseCard({
  exercise,
  entry,
  workoutId,
  position,
  isCurrent,
  expanded,
  onToggle,
  onSetDone,
  onDeleteSet,
}: {
  exercise: Exercise
  entry: WorkoutEntry
  workoutId: string
  /** 1-basierte Position im Training. */
  position: number
  isCurrent: boolean
  expanded: boolean
  onToggle: () => void
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
  const updateExercise = useAppStore((s) => s.updateExercise)
  const remove = useAppStore((s) => s.removeExerciseFromWorkout)
  const [noteOpen, setNoteOpen] = useState(!!entry.note)
  const [editing, setEditing] = useState(false)
  const last = useMemo(() => lastValuesFor(workouts, exercise.id, workoutId), [workouts, exercise.id, workoutId])
  const currentIndex = entry.sets.findIndex((s) => !s.done)
  const weightStep = exercise.weightStep ?? settings.weightStep
  const noWeight = !!exercise.noWeight
  const doneCount = entry.sets.filter((s) => s.done).length
  const state = entryState(entry, isCurrent)

  const sourceLine = last
    ? `Letztes Mal: ${formatRelativeDay(last.date)} · ${last.sets.length} Sätze`
    : exercise.planTarget
      ? noWeight
        ? `Vorgabe: ${exercise.planTarget.sets} × ${exercise.planTarget.reps} (${exercise.planTarget.source})`
        : `Vorgabe: ${exercise.planTarget.sets} × ${exercise.planTarget.reps} × ${formatKg(exercise.planTarget.weightKg)} (${exercise.planTarget.source})`
      : 'Keine früheren Werte'

  const lastDone = [...entry.sets].reverse().find((s) => s.done && s.reps !== null)
  const collapsedLine =
    state === 'done'
      ? `${doneCount} Sätze erledigt${lastDone ? ` · ${formatSet(lastDone.reps!, noWeight ? null : lastDone.weightKg, true)}` : ''}`
      : `${doneCount}/${entry.sets.length} Sätze${lastDone ? ` · zuletzt ${formatSet(lastDone.reps!, noWeight ? null : lastDone.weightKg, true)}` : ''}`

  return (
    <section className={`card wcard wcard-${state} ${expanded ? 'wcard-open' : ''}`} aria-label={exercise.name} data-state={state}>
      <button type="button" className="wcard-head" aria-expanded={expanded} onClick={onToggle}>
        <span className={`ex-badge ex-badge-${state}`} aria-hidden="true">{state === 'done' ? '✓' : position}</span>
        <span className="row-main">
          <span className="wcard-title ellipsis">
            {exercise.name}
            {exercise.machineNo && <span className="muted wcard-machine"> · {exercise.machineNo}</span>}
          </span>
          <span className="row-sub ellipsis" data-testid={expanded ? 'source-line' : 'progress-line'}>{expanded ? sourceLine : collapsedLine}</span>
        </span>
        <span className="set-dots" aria-label={`${doneCount} von ${entry.sets.length} Sätzen erledigt`}>
          {entry.sets.map((s, i) => (
            <span key={s.id} className={`set-dot ${s.done ? 'set-dot-done' : i === currentIndex && state === 'current' ? 'set-dot-current' : ''}`} />
          ))}
        </span>
        <svg className={`chevron ${expanded ? 'chevron-open' : ''}`} viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 4l6 6-6 6" />
        </svg>
      </button>

      {expanded && (
        <div className="wcard-body">
          {exercise.hint && <p className="muted wcard-hint ellipsis" title={exercise.hint}>{exercise.hint}</p>}

          <div className="setrows">
            <div className="setrow-header muted">
              <span />
              <span className="set-last">Zuletzt</span>
              <span>{noWeight ? 'Wdh.' : 'kg × Wdh.'}</span>
            </div>
            {entry.sets.map((s, i) => (
              <SetRow
                key={s.id}
                index={i + 1}
                set={s}
                last={last ? (last.sets[i] ?? null) : null}
                current={i === currentIndex}
                editing={editing}
                noWeight={noWeight}
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
            <button type="button" className="btn btn-sm" aria-pressed={editing} aria-label={editing ? `${exercise.name}: Bearbeiten beenden` : `${exercise.name}: Sätze bearbeiten`} onClick={() => setEditing(!editing)}>
              {editing ? 'Fertig' : 'Bearbeiten'}
            </button>
          </div>
          {editing && (
            <div className="btn-row" style={{ marginTop: 8 }}>
              <button
                type="button"
                className={`btn btn-sm ${noWeight ? 'btn-on' : ''}`}
                aria-pressed={noWeight}
                aria-label={`${exercise.name}: ohne Gewicht`}
                onClick={() => updateExercise(exercise.id, { noWeight: !noWeight })}
              >
                {noWeight ? '✓ Ohne Gewicht' : 'Ohne Gewicht'}
              </button>
              <button type="button" className="btn btn-sm btn-danger-text" aria-label={`${exercise.name} entfernen`} onClick={() => remove(exercise.id)}>
                Übung entfernen
              </button>
            </div>
          )}
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
        </div>
      )}
    </section>
  )
}
