import { useState } from 'react'
import { libraryEntry } from '../domain/library.ts'
import { CATEGORIES, CATEGORY_LABEL, EQUIPMENT, EQUIPMENT_LABEL, MUSCLES, MUSCLE_INFO, isCategory, isEquipment, type Muscle, type MuscleSet } from '../domain/taxonomy.ts'
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
  const [mode, setMode] = useState<'reps' | 'hold'>(initial?.mode === 'hold' ? 'hold' : 'reps')
  const [holdSec, setHoldSec] = useState(initial?.holdSec ? String(initial.holdSec) : '60')
  const [rest, setRest] = useState(initial?.defaultRestSec ? String(initial.defaultRestSec) : '')
  const [step, setStep] = useState(initial?.weightStep ? formatNumber(initial.weightStep) : '')
  const [planSets, setPlanSets] = useState(initial?.planTarget ? String(initial.planTarget.sets) : '')
  const [planReps, setPlanReps] = useState(initial?.planTarget ? String(initial.planTarget.reps) : '')
  const [planWeight, setPlanWeight] = useState(initial?.planTarget?.weightKg != null ? formatNumber(initial.planTarget.weightKg) : '')
  const [equipment, setEquipment] = useState(initial?.equipment ?? '')
  const [category, setCategory] = useState(initial?.category ?? '')
  // undefined: keine eigenen Muskeln (Werte der Bibliothek gelten, falls verknüpft)
  const [muscles, setMuscles] = useState<MuscleSet | undefined>(initial?.muscles)
  const [error, setError] = useState<string | null>(null)
  const lib = libraryEntry(initial?.libraryId)
  const shownMuscles = muscles ?? lib?.muscles ?? { primary: [], secondary: [] }
  const toggleMuscle = (kind: keyof MuscleSet, m: Muscle) => {
    const without = { primary: shownMuscles.primary.filter((x) => x !== m), secondary: shownMuscles.secondary.filter((x) => x !== m) }
    if (shownMuscles[kind].includes(m)) return setMuscles(without)
    const added = [...without[kind], m].sort((a, b) => MUSCLES.indexOf(a) - MUSCLES.indexOf(b))
    setMuscles({ ...without, [kind]: added })
  }

  const submit = () => {
    const restN = rest.trim() ? Number(rest) : undefined
    if (restN !== undefined && (!Number.isInteger(restN) || restN < 5 || restN > 900)) return setError('Pause: ganze Sekunden zwischen 5 und 900.')
    const stepN = step.trim() ? parseWeight(step) : undefined
    if (stepN !== undefined && (stepN === null || Number.isNaN(stepN) || stepN <= 0)) return setError('Gewichtsschritt: Zahl größer 0, z. B. 2,5.')

    const holdN = mode === 'hold' ? Number(holdSec) : undefined
    if (holdN !== undefined && (!Number.isInteger(holdN) || holdN < 5 || holdN > 900)) return setError('Haltedauer: ganze Sekunden zwischen 5 und 900.')

    let planTarget: Exercise['planTarget'] | undefined
    const anyPlan = planSets.trim() || planReps.trim() || planWeight.trim()
    if (anyPlan) {
      const s = Number(planSets)
      const r = Number(planReps)
      const w = !noWeight && mode !== 'hold' && planWeight.trim() ? parseWeight(planWeight) : null
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
      mode: mode === 'hold' ? 'hold' : undefined,
      holdSec: holdN,
      defaultRestSec: restN,
      weightStep: stepN ?? undefined,
      planTarget,
      equipment: isEquipment(equipment) ? equipment : undefined,
      category: isCategory(category) ? category : undefined,
      muscles: muscles && (muscles.primary.length > 0 || muscles.secondary.length > 0) ? muscles : undefined,
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
        <div className="field">
          <span>Art</span>
          <div className="segment" role="radiogroup" aria-label="Art der Übung" style={{ marginBottom: 0 }}>
            <button type="button" role="radio" aria-checked={mode === 'reps'} className={mode === 'reps' ? 'on' : ''} onClick={() => setMode('reps')}>Wiederholungen</button>
            <button type="button" role="radio" aria-checked={mode === 'hold'} className={mode === 'hold' ? 'on' : ''} onClick={() => setMode('hold')}>Halten (Zeit)</button>
          </div>
        </div>
        {mode === 'hold' ? (
          <label className="field">
            <span>Haltedauer je Satz (s)</span>
            <input className="input input-num" value={holdSec} onChange={(e) => setHoldSec(e.target.value)} inputMode="numeric" aria-label="Haltedauer" />
          </label>
        ) : (
          <div className="card" style={{ padding: '4px 12px', marginBottom: 16 }}>
            <Toggle label="Ohne Gewicht" hint="Körpergewicht, Band, Dehnung: nur Wiederholungen erfassen" checked={noWeight} onChange={setNoWeight} />
          </div>
        )}
        <div className="btn-row" style={{ gap: 12 }}>
          <label className="field" style={{ flex: 1 }}>
            <span>Gerät-Nr.</span>
            <input className="input" value={machineNo} onChange={(e) => setMachineNo(e.target.value)} inputMode="numeric" placeholder="z. B. 28" />
          </label>
          <label className="field" style={{ flex: 1 }}>
            <span>Pause (s)</span>
            <input className="input" value={rest} onChange={(e) => setRest(e.target.value)} inputMode="numeric" placeholder="Standard" />
          </label>
          {!noWeight && mode !== 'hold' && (
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
        <details className="form-section" open={!!(initial?.equipment || initial?.category || initial?.muscles)}>
          <summary>Zuordnung (Ausrüstung, Muskeln)</summary>
          {lib && <p className="muted" style={{ fontSize: 13, margin: '0 0 10px' }}>Verknüpft mit „{lib.name}“. Leere Felder übernehmen die Werte der Bibliothek.</p>}
          <div className="btn-row" style={{ gap: 12 }}>
            <label className="field" style={{ flex: 1 }}>
              <span>Ausrüstung</span>
              <select className="input" value={equipment} onChange={(e) => setEquipment(e.target.value)}>
                <option value="">{lib ? `Wie Bibliothek (${EQUIPMENT_LABEL[lib.equipment]})` : 'Keine Angabe'}</option>
                {EQUIPMENT.map((q) => <option key={q} value={q}>{EQUIPMENT_LABEL[q]}</option>)}
              </select>
            </label>
            <label className="field" style={{ flex: 1 }}>
              <span>Kategorie</span>
              <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">{lib ? `Wie Bibliothek (${CATEGORY_LABEL[lib.category]})` : 'Keine Angabe'}</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>)}
              </select>
            </label>
          </div>
          {(['primary', 'secondary'] as const).map((kind) => (
            <div className="field" key={kind}>
              <span>{kind === 'primary' ? 'Hauptmuskeln' : 'Mitbeteiligt'}</span>
              <div className="chip-wrap" role="group" aria-label={kind === 'primary' ? 'Hauptmuskeln' : 'Mitbeteiligte Muskeln'}>
                {MUSCLES.map((m) => (
                  <button key={m} type="button" className="chip" aria-pressed={shownMuscles[kind].includes(m)} onClick={() => toggleMuscle(kind, m)}>
                    {MUSCLE_INFO[m].label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {lib && muscles && (
            <button type="button" className="btn btn-sm" onClick={() => setMuscles(undefined)}>
              Muskeln wie Bibliothek
            </button>
          )}
        </details>
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
              <span>{mode === 'hold' ? 'Sek.' : 'Wdh.'}</span>
              <input className="input input-num" value={planReps} onChange={(e) => setPlanReps(e.target.value)} inputMode="numeric" aria-label="Vorgabe Wdh." />
            </label>
            {!noWeight && mode !== 'hold' && (
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
