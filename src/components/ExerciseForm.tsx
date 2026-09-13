import { useState } from 'react'
import type { Exercise } from '../domain/types.ts'
import { formatNumber, parseWeight } from '../lib/format.ts'
import { Sheet } from './Sheet.tsx'
import { Toggle } from './Toggle.tsx'
import type { ExerciseInput } from '../store/appStore.ts'

export interface ExerciseFormValues extends ExerciseInput {
  aliases: string[]
}

/** Formular zum Anlegen/Bearbeiten einer Übung (F1). Nur der Name ist Pflicht. */
export function ExerciseForm({
  title,
  initial,
  submitLabel,
  onSubmit,
  onClose,
}: {
  title: string
  initial?: Exercise
  submitLabel: string
  onSubmit: (values: ExerciseFormValues) => string | null
  onClose: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [machineNo, setMachineNo] = useState(initial?.machineNo ?? '')
  const [aliases, setAliases] = useState(initial?.aliases.join(', ') ?? '')
  const [hint, setHint] = useState(initial?.hint ?? '')
  const [noWeight, setNoWeight] = useState(!!initial?.noWeight)
  const [rest, setRest] = useState(initial?.defaultRestSec ? String(initial.defaultRestSec) : '')
  const [step, setStep] = useState(initial?.weightStep ? formatNumber(initial.weightStep) : '')
  const [planSets, setPlanSets] = useState(initial?.planTarget ? String(initial.planTarget.sets) : '')
  const [planReps, setPlanReps] = useState(initial?.planTarget ? String(initial.planTarget.reps) : '')
  const [planWeight, setPlanWeight] = useState(initial?.planTarget?.weightKg != null ? formatNumber(initial.planTarget.weightKg) : '')
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    const restN = rest.trim() ? Number(rest) : undefined
    if (restN !== undefined && (!Number.isInteger(restN) || restN < 5 || restN > 900)) return setError('Pause: ganze Sekunden zwischen 5 und 900.')
    const stepN = step.trim() ? parseWeight(step) : undefined
    if (stepN !== undefined && (stepN === null || Number.isNaN(stepN) || stepN <= 0)) return setError('Gewichtsschritt: Zahl größer 0, z. B. 2,5.')

    let planTarget: Exercise['planTarget'] | undefined
    const anyPlan = planSets.trim() || planReps.trim() || planWeight.trim()
    if (anyPlan) {
      const s = Number(planSets)
      const r = Number(planReps)
      const w = !noWeight && planWeight.trim() ? parseWeight(planWeight) : null
      if (!Number.isInteger(s) || s < 1 || !Number.isInteger(r) || r < 1) return setError('Vorgabe: Sätze und Wdh. als ganze Zahlen ab 1 angeben.')
      if (w !== null && (Number.isNaN(w) || w < 0)) return setError('Vorgabe: Gewicht ungültig.')
      planTarget = { sets: s, reps: r, weightKg: w, source: initial?.planTarget?.source ?? 'eigene Vorgabe' }
    }
    const err = onSubmit({
      name,
      machineNo: machineNo.trim() || undefined,
      aliases: aliases.split(',').map((a) => a.trim()).filter(Boolean),
      hint: hint.trim() || undefined,
      noWeight: noWeight || undefined,
      defaultRestSec: restN,
      weightStep: stepN ?? undefined,
      planTarget,
    })
    if (err) setError(err)
  }

  return (
    <Sheet
      title={title}
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-primary btn-block" onClick={submit}>
          {submitLabel}
        </button>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <label className="field">
          <span>Name *</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus autoComplete="off" enterKeyHint="done" />
        </label>
        {error && (
          <p className="error" role="alert" style={{ marginTop: -8 }}>
            {error}
          </p>
        )}
        <div className="card" style={{ padding: '4px 12px', marginBottom: 16 }}>
          <Toggle label="Ohne Gewicht" hint="Körpergewicht, Band, Dehnung: nur Wiederholungen erfassen" checked={noWeight} onChange={setNoWeight} />
        </div>
        <div className="btn-row" style={{ gap: 12 }}>
          <label className="field" style={{ flex: 1 }}>
            <span>Gerät-Nr.</span>
            <input className="input" value={machineNo} onChange={(e) => setMachineNo(e.target.value)} inputMode="numeric" placeholder="z. B. 28" />
          </label>
          <label className="field" style={{ flex: 1 }}>
            <span>Pause (s)</span>
            <input className="input" value={rest} onChange={(e) => setRest(e.target.value)} inputMode="numeric" placeholder="Standard" />
          </label>
          {!noWeight && (
            <label className="field" style={{ flex: 1 }}>
              <span>Schritt (kg)</span>
              <input className="input" value={step} onChange={(e) => setStep(e.target.value)} inputMode="decimal" placeholder="Standard" />
            </label>
          )}
        </div>
        <label className="field">
          <span>Weitere Namen (durch Komma)</span>
          <input className="input" value={aliases} onChange={(e) => setAliases(e.target.value)} placeholder="z. B. Latzug am Kabel" />
        </label>
        <label className="field">
          <span>Hinweis</span>
          <input className="input" value={hint} onChange={(e) => setHint(e.target.value)} placeholder="z. B. Gewicht pro Hantel" />
        </label>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="muted" style={{ fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
            Startvorgabe ohne Historie (optional)
          </legend>
          <div className="btn-row" style={{ gap: 12 }}>
            <label className="field" style={{ flex: 1 }}>
              <span>Sätze</span>
              <input className="input input-num" value={planSets} onChange={(e) => setPlanSets(e.target.value)} inputMode="numeric" aria-label="Vorgabe Sätze" />
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Wdh.</span>
              <input className="input input-num" value={planReps} onChange={(e) => setPlanReps(e.target.value)} inputMode="numeric" aria-label="Vorgabe Wdh." />
            </label>
            {!noWeight && (
              <label className="field" style={{ flex: 1 }}>
                <span>kg</span>
                <input className="input input-num" value={planWeight} onChange={(e) => setPlanWeight(e.target.value)} inputMode="decimal" aria-label="Vorgabe Gewicht" />
              </label>
            )}
          </div>
          {initial?.planTarget && (
            <p className="muted" style={{ fontSize: 13, marginTop: -6 }}>
              Quelle: {initial.planTarget.source}. Leer lassen, um die Vorgabe zu entfernen.
            </p>
          )}
        </fieldset>
      </form>
    </Sheet>
  )
}
