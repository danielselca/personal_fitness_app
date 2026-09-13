import { useEffect, useMemo, useState } from 'react'
import { BackupReminder } from '../components/BackupReminder.tsx'
import { ExercisePicker } from '../components/ExercisePicker.tsx'
import { InstallHint } from '../components/InstallHint.tsx'
import { ConfirmDialog, Sheet } from '../components/Sheet.tsx'
import { SaveTemplateSheet, TemplateEditor } from '../components/TemplateEditor.tsx'
import { TimerBar } from '../components/TimerBar.tsx'
import { WorkoutExerciseCard } from '../components/WorkoutExerciseCard.tsx'
import { currentEntryId, entryState } from '../domain/progress.ts'
import { backupFileName, buildBackup } from '../domain/backup.ts'
import { doneSetCount, finishedWorkouts, workoutDurationMin, workoutVolume, workoutsPerWeek } from '../domain/stats.ts'
import type { Template, Workout, WorkoutSet } from '../domain/types.ts'
import { useNow } from '../hooks/useNow.ts'
import { useWakeLock } from '../hooks/useWakeLock.ts'
import { unlockAudio } from '../lib/audio.ts'
import { downloadJson } from '../lib/download.ts'
import { formatMmSs, formatRelativeDay, formatVolume } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'

export function TrainingScreen() {
  const active = useAppStore((s) => s.data.workouts.find((w) => w.status === 'active') ?? null)
  const [justFinished, setJustFinished] = useState<Workout | null>(null)
  if (active) return <ActiveWorkout workout={active} onFinished={setJustFinished} />
  return <StartScreen justFinished={justFinished} onDismissSummary={() => setJustFinished(null)} />
}

/* ---------- Start ---------- */

function StartScreen({ justFinished, onDismissSummary }: { justFinished: Workout | null; onDismissSummary: () => void }) {
  const data = useAppStore((s) => s.data)
  const startWorkout = useAppStore((s) => s.startWorkout)
  const markBackupDone = useAppStore((s) => s.markBackupDone)
  const [reminderDismissed, setReminderDismissed] = useState(false)
  const [editTemplate, setEditTemplate] = useState<Template | null>(null)
  const [saveTemplate, setSaveTemplate] = useState(false)
  const [savedName, setSavedName] = useState<string | null>(null)
  const finished = useMemo(() => finishedWorkouts(data.workouts), [data.workouts])
  const thisWeek = workoutsPerWeek(data.workouts, new Date(), 1)[0].count
  const lastWorkout = finished[0] ?? null
  const exerciseName = (id: string) => data.exercises.find((e) => e.id === id)?.name ?? 'Unbekannt'

  const start = (opts?: Parameters<typeof startWorkout>[0]) => {
    unlockAudio()
    startWorkout(opts)
  }

  return (
    <>
      <InstallHint />
      {justFinished && (
        <div className="card" role="status" data-testid="finished-summary">
          <div className="row">
            <strong>Training abgeschlossen</strong>
            <button type="button" className="btn btn-sm" onClick={onDismissSummary}>OK</button>
          </div>
          <WorkoutSummary workout={justFinished} exerciseName={exerciseName} />
          {savedName ? (
            <p className="ok" style={{ margin: '8px 0 0' }}>Vorlage „{savedName}“ gespeichert.</p>
          ) : (
            <button type="button" className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => setSaveTemplate(true)}>Als Vorlage speichern</button>
          )}
        </div>
      )}
      {saveTemplate && justFinished && (
        <SaveTemplateSheet
          suggestedName={justFinished.templateId ? (data.templates.find((t) => t.id === justFinished.templateId)?.name ?? 'Mein Training') : 'Mein Training'}
          entries={justFinished.entries.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets.length }))}
          onClose={(n) => {
            setSaveTemplate(false)
            if (n) setSavedName(n)
          }}
        />
      )}
      {editTemplate && <TemplateEditor template={editTemplate} onClose={() => setEditTemplate(null)} />}
      {!reminderDismissed && (
        <BackupReminder
          onExport={() => {
            downloadJson(backupFileName(), buildBackup(data, __APP_VERSION__))
            markBackupDone()
          }}
          onDismiss={() => setReminderDismissed(true)}
        />
      )}

      <button type="button" className="btn btn-primary btn-block" onClick={() => start()}>
        Training starten
      </button>
      {lastWorkout && (
        <button type="button" className="btn btn-block" style={{ marginTop: 10 }} onClick={() => start({ repeatLast: true })}>
          Letztes Training wiederholen
        </button>
      )}

      {data.templates.length > 0 && (
        <>
          <h2 className="section-title">Vorlagen</h2>
          <ul className="list">
            {data.templates.map((t) => (
              <li key={t.id} className="template-row">
                <button type="button" className="card card-tap row" style={{ flex: 1 }} aria-label={`Vorlage ${t.name} starten`} onClick={() => start({ templateId: t.id })}>
                  <span className="row-main">
                    <span className="row-title ellipsis" style={{ display: 'block' }}>{t.name}</span>
                    <span className="row-sub">{t.entries.length} Übungen · {t.entries.map((e) => exerciseName(e.exerciseId)).slice(0, 3).join(', ')}{t.entries.length > 3 ? ' …' : ''}</span>
                  </span>
                  <span className="muted" aria-hidden="true">›</span>
                </button>
                <button type="button" className="btn btn-icon" aria-label={`${t.name} bearbeiten`} onClick={() => setEditTemplate(t)}>✎</button>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2 className="section-title">Diese Woche</h2>
      <div className="card">
        <div className="workout-stats">
          <span><strong>{thisWeek}</strong> Training{thisWeek === 1 ? '' : 's'}</span>
          {lastWorkout && <span>Zuletzt <strong>{formatRelativeDay(lastWorkout.finishedAt!)}</strong></span>}
        </div>
        {!lastWorkout && (
          <p className="muted" style={{ margin: '8px 0 0' }}>Noch kein Training abgeschlossen. Starte oben dein erstes.</p>
        )}
      </div>
    </>
  )
}

function WorkoutSummary({ workout, exerciseName }: { workout: Workout; exerciseName: (id: string) => string }) {
  const dur = workoutDurationMin(workout)
  return (
    <>
      <div className="summary-grid">
        <div><strong>{doneSetCount(workout)}</strong><span>Sätze</span></div>
        <div><strong>{formatVolume(workoutVolume(workout))}</strong><span>Volumen</span></div>
        <div><strong>{workout.entries.length}</strong><span>Übungen</span></div>
        <div><strong>{dur === null ? '–' : `${dur} min`}</strong><span>Dauer</span></div>
      </div>
      <p className="muted" style={{ margin: 0, fontSize: 14 }}>{workout.entries.map((e) => exerciseName(e.exerciseId)).join(', ')}</p>
    </>
  )
}

/* ---------- Aktives Training ---------- */

function ActiveWorkout({ workout, onFinished }: { workout: Workout; onFinished: (w: Workout) => void }) {
  const exercises = useAppStore((s) => s.data.exercises)
  const settings = useAppStore((s) => s.data.settings)
  const timer = useAppStore((s) => s.data.timer)
  const addExerciseToWorkout = useAppStore((s) => s.addExerciseToWorkout)
  const moveEntry = useAppStore((s) => s.moveWorkoutEntry)
  const moveEntryToEnd = useAppStore((s) => s.moveWorkoutEntryToEnd)
  const removeEntry = useAppStore((s) => s.removeExerciseFromWorkout)
  const sortNoWeightFirst = useAppStore((s) => s.sortWorkoutNoWeightFirst)
  const startTimer = useAppStore((s) => s.startTimer)
  const restoreSet = useAppStore((s) => s.restoreSet)
  const finishWorkout = useAppStore((s) => s.finishWorkout)
  const discardWorkout = useAppStore((s) => s.discardWorkout)
  // 'auto': Auswahl öffnet sich von selbst, solange das Training leer ist
  const [pickerState, setPickerState] = useState<'auto' | 'open' | 'closed'>('auto')
  const picker = pickerState === 'open' || (pickerState === 'auto' && workout.entries.length === 0)
  const [finishing, setFinishing] = useState(false)
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [sorting, setSorting] = useState(false)
  const [undo, setUndo] = useState<{ exerciseId: string; set: WorkoutSet; index: number } | null>(null)
  const now = useNow(30_000)
  useWakeLock(settings.keepScreenOn)

  // Aktuelle Übung = erste mit offenem Satz. Nur sie ist standardmäßig ausgeklappt;
  // manuelles Auf-/Zuklappen gilt, bis die aktuelle Übung wechselt.
  const currentId = currentEntryId(workout.entries)
  const [manual, setManual] = useState<{ forId: string | null; open: Record<string, boolean> }>({ forId: currentId, open: {} })
  const open = manual.forId === currentId ? manual.open : {}
  const isExpanded = (id: string) => open[id] ?? id === currentId
  const toggle = (id: string) => setManual({ forId: currentId, open: { ...open, [id]: !isExpanded(id) } })

  useEffect(() => {
    if (!undo) return
    const id = setTimeout(() => setUndo(null), 5000)
    return () => clearTimeout(id)
  }, [undo])

  const elapsedMin = Math.max(0, Math.floor((now - new Date(workout.startedAt).getTime()) / 60000))
  const done = doneSetCount(workout)
  const total = workout.entries.reduce((n, e) => n + e.sets.length, 0)
  const exById = new Map(exercises.map((e) => [e.id, e]))
  const currentPos = currentId ? workout.entries.findIndex((e) => e.exerciseId === currentId) + 1 : workout.entries.length
  const progress = total === 0 ? 0 : Math.round((done / total) * 100)

  const onSetDone = (exerciseId: string) => {
    unlockAudio()
    if (!settings.autoStartTimer) return
    const ex = exById.get(exerciseId)
    startTimer(ex?.defaultRestSec ?? settings.defaultRestSec, exerciseId)
  }

  const finish = () => {
    const w = finishWorkout()
    if (w) onFinished(w)
  }

  return (
    <div className="content-with-timer">
      <div className="workout-head card">
        <div className="stat-tiles">
          <div className="stat-tile" data-testid="exercise-pos">
            <span className="label">Übung</span>
            <span className="stat-value">{workout.entries.length > 0 ? currentPos : 0}<small>/{workout.entries.length}</small></span>
          </div>
          <div className="stat-tile">
            <span className="label">Sätze</span>
            <span className="stat-value"><span data-testid="done-count">{done}</span><small>/{total}</small></span>
          </div>
          <div className="stat-tile">
            <span className="label">Minuten</span>
            <span className="stat-value">{elapsedMin}</span>
          </div>
        </div>
        <div className="workout-head-row">
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Fortschritt">
            <div className="progress-bar" style={{ width: `${progress}%` }} />
          </div>
          <span className="label num">{progress} %</span>
          {workout.entries.length > 1 && (
            <button type="button" className={`btn btn-sm ${sorting ? 'btn-primary' : ''}`} aria-pressed={sorting} onClick={() => setSorting(!sorting)}>
              {sorting ? 'Fertig' : 'Sortieren'}
            </button>
          )}
        </div>
      </div>

      {sorting && (
        <button type="button" className="btn btn-block" style={{ minHeight: 44, fontSize: 16, marginBottom: 10 }} onClick={sortNoWeightFirst}>
          Ohne Gewicht zuerst
        </button>
      )}
      {sorting ? (
        <ul className="list sort-list" aria-label="Reihenfolge der Übungen">
          {workout.entries.map((entry, i) => {
            const ex = exById.get(entry.exerciseId)
            if (!ex) return null
            const st = entryState(entry, entry.exerciseId === currentId)
            return (
              <li key={entry.exerciseId} className="card sort-row">
                <span className={`sort-no sort-no-${st} num`} aria-hidden="true">{st === 'done' ? '✓' : i + 1}</span>
                <span className="row-main">
                  <span className="row-title ellipsis" style={{ display: 'block' }}>{ex.name}</span>
                </span>
                <span className="sort-actions">
                <button type="button" className="btn btn-icon btn-sm" aria-label={`${ex.name} ganz nach oben`} disabled={i === 0} onClick={() => moveEntryToEnd(ex.id, 'top')}><ArrowIcon dir="up" bar /></button>
                <button type="button" className="btn btn-icon btn-sm" aria-label={`${ex.name} nach oben`} disabled={i === 0} onClick={() => moveEntry(ex.id, -1)}><ArrowIcon dir="up" /></button>
                <button type="button" className="btn btn-icon btn-sm" aria-label={`${ex.name} nach unten`} disabled={i === workout.entries.length - 1} onClick={() => moveEntry(ex.id, 1)}><ArrowIcon dir="down" /></button>
                <button type="button" className="btn btn-icon btn-sm" aria-label={`${ex.name} ganz nach unten`} disabled={i === workout.entries.length - 1} onClick={() => moveEntryToEnd(ex.id, 'bottom')}><ArrowIcon dir="down" bar /></button>
                <button type="button" className="btn btn-icon btn-sm btn-danger-text" aria-label={`${ex.name} entfernen`} onClick={() => removeEntry(ex.id)}>✕</button>
                </span>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="list">
          {workout.entries.map((entry, i) => {
            const ex = exById.get(entry.exerciseId)
            if (!ex) return null
            return (
              <WorkoutExerciseCard
                key={entry.exerciseId}
                exercise={ex}
                entry={entry}
                workoutId={workout.id}
                position={i + 1}
                isCurrent={entry.exerciseId === currentId}
                expanded={isExpanded(entry.exerciseId)}
                onToggle={() => toggle(entry.exerciseId)}
                onSetDone={() => onSetDone(entry.exerciseId)}
                onDeleteSet={(set, index) => setUndo({ exerciseId: entry.exerciseId, set, index })}
              />
            )
          })}
        </div>
      )}

      <div className="btn-row" style={{ marginTop: 12 }}>
        <button type="button" className="btn" onClick={() => setPickerState('open')}>+ Übung</button>
        <button type="button" className="btn btn-primary" onClick={() => (done === 0 ? setConfirmDiscard(true) : setFinishing(true))}>
          Abschließen
        </button>
      </div>

      <TimerBar defaultSec={settings.defaultRestSec} />
      {timer && <div style={{ height: 8 }} />}

      {undo && (
        <div className="toast-undo" role="status">
          <span>Satz gelöscht</span>
          <button
            type="button"
            className="btn"
            onClick={() => {
              restoreSet(undo.exerciseId, undo.set, undo.index)
              setUndo(null)
            }}
          >
            Rückgängig
          </button>
        </div>
      )}

      {picker && (
        <ExercisePicker
          excludeIds={workout.entries.map((e) => e.exerciseId)}
          onAdd={(ids) => {
            ids.forEach((id) => addExerciseToWorkout(id))
            setPickerState('closed')
          }}
          onClose={() => setPickerState('closed')}
        />
      )}

      {finishing && (
        <Sheet
          title="Training abschließen"
          onClose={() => setFinishing(false)}
          footer={
            <button type="button" className="btn btn-primary btn-block" onClick={finish}>
              Abschließen
            </button>
          }
        >
          <WorkoutSummary
            workout={{ ...workout, finishedAt: new Date().toISOString(), entries: workout.entries.map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) })).filter((e) => e.sets.length > 0) }}
            exerciseName={(id) => exById.get(id)?.name ?? 'Unbekannt'}
          />
          {workout.entries.some((e) => e.sets.some((s) => !s.done)) && (
            <p className="muted" style={{ fontSize: 14 }}>Nicht abgehakte Sätze werden verworfen.</p>
          )}
          <p className="muted" style={{ fontSize: 14 }}>Pause aktuell: {formatMmSs(settings.defaultRestSec)} min Standard.</p>
        </Sheet>
      )}

      {confirmDiscard && (
        <ConfirmDialog
          title="Training verwerfen?"
          text="Es wurde kein Satz abgehakt. Das Training wird nicht gespeichert."
          confirmLabel="Verwerfen"
          danger
          onConfirm={() => {
            discardWorkout()
            setConfirmDiscard(false)
          }}
          onCancel={() => setConfirmDiscard(false)}
        />
      )}
    </div>
  )
}

/** Pfeil nach oben/unten, optional mit Balken („ganz nach …“). */
function ArrowIcon({ dir, bar }: { dir: 'up' | 'down'; bar?: boolean }) {
  return (
    <svg className="arrow-icon" viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={dir === 'down' ? { transform: 'scaleY(-1)' } : undefined}>
      {bar && <path d="M5 3h10" />}
      <path d="M10 17V6M5.5 10.5L10 6l4.5 4.5" />
    </svg>
  )
}
