import { useMemo, useState } from 'react'
import { NumberField } from '../components/NumberField.tsx'
import { ConfirmDialog } from '../components/Sheet.tsx'
import { SaveTemplateSheet } from '../components/TemplateEditor.tsx'
import { doneSetCount, finishedWorkouts, workoutDurationMin, workoutVolume } from '../domain/stats.ts'
import type { Workout } from '../domain/types.ts'
import { formatDate, formatNumber, formatTime, formatVolume } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'
import { StatsView } from './StatsView.tsx'

export function HistoryScreen() {
  const [segment, setSegment] = useState<'list' | 'stats'>('list')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  if (selectedId) return <WorkoutDetail id={selectedId} onBack={() => setSelectedId(null)} />
  return (
    <>
      <div className="segment" role="tablist" aria-label="Verlauf oder Statistik">
        <button type="button" role="tab" aria-selected={segment === 'list'} className={segment === 'list' ? 'on' : ''} onClick={() => setSegment('list')}>Trainings</button>
        <button type="button" role="tab" aria-selected={segment === 'stats'} className={segment === 'stats' ? 'on' : ''} onClick={() => setSegment('stats')}>Statistik</button>
      </div>
      {segment === 'list' ? <WorkoutList onSelect={setSelectedId} /> : <StatsView />}
    </>
  )
}

function WorkoutList({ onSelect }: { onSelect: (id: string) => void }) {
  const workouts = useAppStore((s) => s.data.workouts)
  const exercises = useAppStore((s) => s.data.exercises)
  const finished = useMemo(() => finishedWorkouts(workouts), [workouts])
  const nameOf = (id: string) => exercises.find((e) => e.id === id)?.name ?? 'Unbekannt'
  if (finished.length === 0) {
    return (
      <div className="card empty">
        <strong>Noch kein Training abgeschlossen</strong>
        Abgeschlossene Trainings erscheinen hier und lassen sich nachträglich korrigieren.
      </div>
    )
  }
  return (
    <ul className="list">
      {finished.map((w) => (
        <li key={w.id}>
          <button type="button" className="card card-tap row" onClick={() => onSelect(w.id)}>
            <span className="row-main">
              <span className="row-title" style={{ display: 'block' }}>{formatDate(w.finishedAt!)} · {formatTime(w.startedAt)}</span>
              <span className="row-sub ellipsis" style={{ display: 'block' }}>{w.entries.map((e) => nameOf(e.exerciseId)).join(', ')}</span>
              <span className="row-sub num">{w.entries.length} Übungen · {doneSetCount(w)} Sätze · {formatVolume(workoutVolume(w))} · {workoutDurationMin(w)} min</span>
            </span>
            <span className="muted" aria-hidden="true">›</span>
          </button>
        </li>
      ))}
    </ul>
  )
}

function toLocalInput(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

/** Abgeschlossenes Training ansehen und korrigieren (F8, AK16). */
function WorkoutDetail({ id, onBack }: { id: string; onBack: () => void }) {
  const workout = useAppStore((s) => s.data.workouts.find((w) => w.id === id))
  const exercises = useAppStore((s) => s.data.exercises)
  const updateWorkout = useAppStore((s) => s.updateWorkout)
  const deleteWorkout = useAppStore((s) => s.deleteWorkout)
  const [confirm, setConfirm] = useState<null | { kind: 'workout' } | { kind: 'entry'; exerciseId: string }>(null)
  const [saveTemplate, setSaveTemplate] = useState(false)
  const [savedName, setSavedName] = useState<string | null>(null)
  const nameOf = (eid: string) => exercises.find((e) => e.id === eid)?.name ?? 'Unbekannt'

  if (!workout) {
    return (
      <div className="card empty">
        <strong>Training nicht gefunden</strong>
        <button type="button" className="btn" onClick={onBack}>Zurück</button>
      </div>
    )
  }

  const edit = (fn: (w: Workout) => Workout) => updateWorkout(id, fn)
  const setDate = (value: string) => {
    const newFinished = new Date(value)
    if (Number.isNaN(newFinished.getTime())) return
    const delta = newFinished.getTime() - new Date(workout.finishedAt!).getTime()
    edit((w) => ({
      ...w,
      finishedAt: newFinished.toISOString(),
      startedAt: new Date(new Date(w.startedAt).getTime() + delta).toISOString(),
    }))
  }

  return (
    <>
      <button type="button" className="btn btn-sm" onClick={onBack} style={{ marginBottom: 12 }}>‹ Verlauf</button>
      <div className="card">
        <label className="field" style={{ marginBottom: 8 }}>
          <span>Datum und Uhrzeit (Ende)</span>
          <input className="input" type="datetime-local" aria-label="Datum" value={toLocalInput(workout.finishedAt!)} onChange={(e) => setDate(e.target.value)} />
        </label>
        <div className="workout-stats">
          <span><strong>{doneSetCount(workout)}</strong> Sätze</span>
          <span><strong data-testid="detail-volume">{formatVolume(workoutVolume(workout))}</strong></span>
          <span><strong>{workoutDurationMin(workout)}</strong> min</span>
        </div>
      </div>

      {workout.entries.map((entry) => (
        <section className="card" key={entry.exerciseId} aria-label={nameOf(entry.exerciseId)} style={{ marginTop: 12 }}>
          <div className="row" style={{ minHeight: 0 }}>
            <h3 style={{ margin: 0, fontSize: 17 }}>{nameOf(entry.exerciseId)}</h3>
            <button type="button" className="btn btn-icon btn-sm" aria-label={`${nameOf(entry.exerciseId)} aus Training löschen`} onClick={() => setConfirm({ kind: 'entry', exerciseId: entry.exerciseId })}>✕</button>
          </div>
          {entry.note && <p className="muted" style={{ margin: '2px 0 6px', fontSize: 14 }}>„{entry.note}“</p>}
          <div className="setrows" style={{ marginTop: 6 }}>
            {entry.sets.map((s, i) => (
              <div className="setrow-line" key={s.id} style={{ gridTemplateColumns: '22px 1fr 40px' }}>
                <span className="set-no num">{i + 1}</span>
                <span className="set-inputs">
                  <NumberField kind="weight" value={s.weightKg} label={`${nameOf(entry.exerciseId)} Satz ${i + 1} Gewicht`} placeholder="kg"
                    onChange={(v) => edit((w) => ({ ...w, entries: w.entries.map((e) => (e.exerciseId === entry.exerciseId ? { ...e, sets: e.sets.map((x) => (x.id === s.id ? { ...x, weightKg: v } : x)) } : e)) }))} />
                  <span className="muted" aria-hidden="true">×</span>
                  <NumberField kind="reps" value={s.reps} label={`${nameOf(entry.exerciseId)} Satz ${i + 1} Wiederholungen`} placeholder="Wdh."
                    onChange={(v) => { if (v !== null) edit((w) => ({ ...w, entries: w.entries.map((e) => (e.exerciseId === entry.exerciseId ? { ...e, sets: e.sets.map((x) => (x.id === s.id ? { ...x, reps: v } : x)) } : e)) })) }} />
                </span>
                <button type="button" className="btn btn-icon btn-sm" aria-label={`${nameOf(entry.exerciseId)} Satz ${i + 1} löschen`}
                  onClick={() => edit((w) => ({ ...w, entries: w.entries.map((e) => (e.exerciseId === entry.exerciseId ? { ...e, sets: e.sets.filter((x) => x.id !== s.id) } : e)).filter((e) => e.sets.length > 0) }))}>✕</button>
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="btn-row" style={{ marginTop: 16 }}>
        <button type="button" className="btn" onClick={() => setSaveTemplate(true)}>Als Vorlage speichern</button>
        <button type="button" className="btn" style={{ color: 'var(--danger)' }} onClick={() => setConfirm({ kind: 'workout' })}>Training löschen</button>
      </div>
      {savedName && <p className="ok" role="status">Vorlage „{savedName}“ gespeichert.</p>}
      <p className="muted" style={{ fontSize: 13 }}>Änderungen werden sofort gespeichert. Sätze ohne Gewicht: {formatNumber(0)} kg im Volumen.</p>

      {confirm?.kind === 'workout' && (
        <ConfirmDialog title="Training löschen?" text="Das Training wird dauerhaft entfernt." confirmLabel="Löschen" danger
          onConfirm={() => { deleteWorkout(id); setConfirm(null); onBack() }} onCancel={() => setConfirm(null)} />
      )}
      {confirm?.kind === 'entry' && (
        <ConfirmDialog title={`${nameOf(confirm.exerciseId)} löschen?`} text="Alle Sätze dieser Übung in diesem Training werden entfernt." confirmLabel="Löschen" danger
          onConfirm={() => { edit((w) => ({ ...w, entries: w.entries.filter((e) => e.exerciseId !== confirm.exerciseId) })); setConfirm(null) }} onCancel={() => setConfirm(null)} />
      )}
      {saveTemplate && (
        <SaveTemplateSheet
          suggestedName={`Training ${formatDate(workout.finishedAt!)}`}
          entries={workout.entries.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets.length }))}
          onClose={(n) => { setSaveTemplate(false); if (n) setSavedName(n) }}
        />
      )}
    </>
  )
}
