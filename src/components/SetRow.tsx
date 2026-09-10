import type { WorkoutSet } from '../domain/types.ts'
import { formatNumber } from '../lib/format.ts'
import { NumberField } from './NumberField.tsx'

export interface SetRowProps {
  index: number
  set: WorkoutSet
  last?: { weightKg: number | null; reps: number } | null
  current: boolean
  /** Bearbeiten-Modus der Karte: Haken wird zum Löschen-Button, Stepper ausgeblendet. */
  editing: boolean
  weightStep: number
  onChange: (patch: Partial<Pick<WorkoutSet, 'weightKg' | 'reps'>>) => void
  onToggleDone: () => void
  onDelete: () => void
}

/**
 * Eine Satzzeile: Nr. · Letztes Mal · Gewicht · Wdh. · Haken. Der aktuelle Satz zeigt
 * zusätzlich große +/−-Tasten, damit im Training keine Tastatur nötig ist.
 */
export function SetRow({ index, set, last, current, editing, weightStep, onChange, onToggleDone, onDelete }: SetRowProps) {
  const canDone = set.reps !== null && set.reps >= 1
  const lastText = last ? `${last.reps} × ${last.weightKg === null ? '–' : formatNumber(last.weightKg)}` : '–'
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

  return (
    <div className={`setrow ${set.done ? 'setrow-done' : ''} ${current ? 'setrow-current' : ''}`} data-testid={`set-${index}`}>
      <div className="setrow-line">
        <span className="set-no num">{index}</span>
        <span className="set-last num" title="Letztes Mal">{lastText}</span>
        {set.done ? (
          <span className="set-values num">
            <strong>{set.reps}</strong> × <strong>{set.weightKg === null ? '–' : formatNumber(set.weightKg)}</strong> kg
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
            className={`btn check-btn ${set.done ? 'check-btn-done' : ''}`}
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
          <div className="stepper">
            <button type="button" className="btn" aria-label={`Gewicht minus ${formatNumber(weightStep)} kg`} onClick={() => stepWeight(-1)}>−{formatNumber(weightStep)}</button>
            <button type="button" className="btn" aria-label={`Gewicht plus ${formatNumber(weightStep)} kg`} onClick={() => stepWeight(1)}>+{formatNumber(weightStep)}</button>
          </div>
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
