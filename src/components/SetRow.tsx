import type { WorkoutSet } from '../domain/types.ts'
import { formatNumber, formatSet } from '../lib/format.ts'
import { NumberField } from './NumberField.tsx'

export interface SetRowProps {
  index: number
  set: WorkoutSet
  last?: { weightKg: number | null; reps: number } | null
  current: boolean
  /** Bearbeiten-Modus der Karte: Haken wird zum Löschen-Button, Stepper ausgeblendet. */
  editing: boolean
  /** Übung ohne Gewichtsangabe: nur Wiederholungen. */
  noWeight: boolean
  weightStep: number
  onChange: (patch: Partial<Pick<WorkoutSet, 'weightKg' | 'reps'>>) => void
  onToggleDone: () => void
  onDelete: () => void
}

/**
 * Eine Satzzeile: Nr. · Letztes Mal · Gewicht · Wdh. · Haken. Der aktuelle Satz ist farbig
 * hervorgehoben und zeigt große +/−-Tasten, damit im Training keine Tastatur nötig ist.
 * Bei Übungen ohne Gewicht entfallen kg-Feld und kg-Stepper.
 */
export function SetRow({ index, set, last, current, editing, noWeight, weightStep, onChange, onToggleDone, onDelete }: SetRowProps) {
  const canDone = set.reps !== null && set.reps >= 1
  const lastText = last ? (noWeight ? `${last.reps} Wdh.` : formatSet(last.reps, last.weightKg)) : '–'
  const stepWeight = (dir: -1 | 1) => {
    const cur = set.weightKg ?? 0
    const next = Math.max(0, Math.round((cur + dir * weightStep) * 100) / 100)
    onChange({ weightKg: next === 0 && dir < 0 && cur <= weightStep ? null : next })
  }
  const stepReps = (dir: -1 | 1) => {
    const cur = set.reps ?? 0
    const next = Math.max(0, cur + dir)
    onChange({ reps: next === 0 ? null : next })
  }
  const state = set.done ? 'done' : current ? 'current' : 'pending'

  return (
    <div className={`setrow setrow-${state} ${noWeight ? 'setrow-noweight' : ''}`} data-testid={`set-${index}`} data-state={state}>
      <div className="setrow-line">
        <span className={`set-badge set-badge-${state} num`} aria-hidden="true">{set.done ? '✓' : index}</span>
        <span className="set-last num" title="Letztes Mal">{lastText}</span>
        {set.done ? (
          <span className="set-values num">
            {noWeight || set.weightKg === null ? (
              <><strong>{set.reps}</strong> Wdh.</>
            ) : (
              <><strong>{set.reps}</strong> × <strong>{formatNumber(set.weightKg)}</strong> kg</>
            )}
          </span>
        ) : noWeight ? (
          <span className="set-inputs set-inputs-reps">
            <NumberField kind="reps" value={set.reps} onChange={(v) => onChange({ reps: v })} label={`Satz ${index} Wiederholungen`} placeholder="–" />
            <span className="muted set-unit" aria-hidden="true">Wdh.</span>
          </span>
        ) : (
          <span className="set-inputs">
            <NumberField kind="weight" value={set.weightKg} onChange={(v) => onChange({ weightKg: v })} label={`Satz ${index} Gewicht`} placeholder="kg" />
            <span className="muted" aria-hidden="true">×</span>
            <NumberField kind="reps" value={set.reps} onChange={(v) => onChange({ reps: v })} label={`Satz ${index} Wiederholungen`} placeholder="Wdh." />
          </span>
        )}
        {editing ? (
          <button type="button" className="btn check-btn check-btn-delete" aria-label={`Satz ${index} löschen`} onClick={onDelete}>
            ✕
          </button>
        ) : (
          <button
            type="button"
            className={`btn check-btn ${set.done ? 'check-btn-done' : current ? 'check-btn-current' : ''}`}
            aria-label={set.done ? `Satz ${index} zurücksetzen` : `Satz ${index} abhaken`}
            aria-pressed={set.done}
            disabled={!set.done && !canDone}
            onClick={onToggleDone}
          >
            ✓
          </button>
        )}
      </div>
      {current && !set.done && !editing && (
        <div className="setrow-steppers">
          {!noWeight && (
            <div className="stepper">
              <button type="button" className="btn" aria-label={`Gewicht minus ${formatNumber(weightStep)} kg`} onClick={() => stepWeight(-1)}>−{formatNumber(weightStep)}</button>
              <button type="button" className="btn" aria-label={`Gewicht plus ${formatNumber(weightStep)} kg`} onClick={() => stepWeight(1)}>+{formatNumber(weightStep)}</button>
            </div>
          )}
          <div className="stepper">
            <button type="button" className="btn" aria-label="Eine Wiederholung weniger" onClick={() => stepReps(-1)}>−1</button>
            <button type="button" className="btn" aria-label="Eine Wiederholung mehr" onClick={() => stepReps(1)}>+1</button>
          </div>
          <button type="button" className="btn btn-icon set-delete" aria-label={`Satz ${index} löschen`} onClick={onDelete}>🗑</button>
        </div>
      )}
    </div>
  )
}
