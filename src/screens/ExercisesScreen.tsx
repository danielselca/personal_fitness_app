import { useEffect, useMemo, useState } from 'react'
import { ExerciseForm } from '../components/ExerciseForm.tsx'
import { ExerciseMedia } from '../components/ExerciseMedia.tsx'
import { FilterChips } from '../components/FilterChips.tsx'
import { HowTo, MetaRows } from '../components/LibraryInfo.tsx'
import { LinkLibrarySheet } from '../components/LinkLibrarySheet.tsx'
import { ConfirmDialog } from '../components/Sheet.tsx'
import { WeightChart } from '../components/WeightChart.tsx'
import {
  EQUIPMENT_FILTER_OPTIONS,
  exerciseMeta,
  exerciseSearchTexts,
  matchesFilter,
  regionFilterOptions,
  type LibraryFilter,
} from '../domain/library.ts'
import { exerciseRecords } from '../domain/coach/records.ts'
import { mediaForExercise } from '../domain/media.ts'
import { weightProgression } from '../domain/stats.ts'
import { matchesQuery } from '../domain/search.ts'
import type { Exercise } from '../domain/types.ts'
import { formatDate, formatKg, formatMmSs, formatNumber, formatSetFor } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'
import { initialTarget, useNav } from '../store/navStore.ts'
import { LibraryDetail, LibraryList } from './LibraryView.tsx'

type View = 'meine' | 'bibliothek'

export function ExercisesScreen() {
  // Sprung aus dem Coach: Übung oder Bibliothekseintrag direkt öffnen
  const [selectedId, setSelectedId] = useState<string | null>(() => initialTarget('exercise'))
  const [libraryId, setLibraryId] = useState<string | null>(() => initialTarget('library'))
  const clearTarget = useNav((s) => s.clearTarget)
  useEffect(() => clearTarget(), [clearTarget])
  const [view, setView] = useState<View>('meine')
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<LibraryFilter>({})
  const [creating, setCreating] = useState(false)

  if (selectedId) {
    return <ExerciseDetail id={selectedId} onBack={() => setSelectedId(null)} />
  }
  if (libraryId) {
    return (
      <LibraryDetail
        id={libraryId}
        onBack={() => setLibraryId(null)}
        onOpenOwn={(id) => {
          setLibraryId(null)
          setSelectedId(id)
        }}
      />
    )
  }

  // „Ohne Zuordnung“ gibt es nur bei eigenen Übungen
  const libFilter = filter.region === 'ohne' ? { ...filter, region: undefined } : filter
  return (
    <>
      <div className="segment" role="radiogroup" aria-label="Übungen anzeigen">
        <button type="button" role="radio" aria-checked={view === 'meine'} className={view === 'meine' ? 'on' : ''} onClick={() => setView('meine')}>Meine</button>
        <button type="button" role="radio" aria-checked={view === 'bibliothek'} className={view === 'bibliothek' ? 'on' : ''} onClick={() => setView('bibliothek')}>Bibliothek</button>
      </div>
      <SearchRow view={view} query={query} setQuery={setQuery} onCreate={() => setCreating(true)} />
      <FilterChips label="Ausrüstung" options={EQUIPMENT_FILTER_OPTIONS} value={filter.equipment} onChange={(equipment) => setFilter({ ...filter, equipment })} />
      <FilterChips
        label="Muskelgruppe"
        options={regionFilterOptions(view === 'meine')}
        value={view === 'meine' ? filter.region : libFilter.region}
        onChange={(region) => setFilter({ ...filter, region })}
      />
      {view === 'meine' ? (
        <ExerciseList query={query} setQuery={setQuery} filter={filter} creating={creating} setCreating={setCreating} onSelect={setSelectedId} onShowLibrary={() => setView('bibliothek')} />
      ) : (
        <LibraryList query={query} filter={libFilter} onSelect={setLibraryId} />
      )}
    </>
  )
}

function SearchRow({ view, query, setQuery, onCreate }: { view: View; query: string; setQuery: (q: string) => void; onCreate: () => void }) {
  const mine = view === 'meine'
  return (
    <div className="input-inline" style={{ marginBottom: 8 }}>
      <input
        className="input"
        type="search"
        placeholder={mine ? 'Suchen (Name, Gerät-Nr.)' : 'Name, auch englisch'}
        aria-label={mine ? 'Übungen suchen' : 'Bibliothek durchsuchen'}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        enterKeyHint="search"
      />
      {mine && (
        <button type="button" className="btn btn-primary" onClick={onCreate} aria-label="Neue Übung">
          +
        </button>
      )}
    </div>
  )
}

function ExerciseList({
  query,
  setQuery,
  filter,
  creating,
  setCreating,
  onSelect,
  onShowLibrary,
}: {
  query: string
  setQuery: (q: string) => void
  filter: LibraryFilter
  creating: boolean
  setCreating: (v: boolean) => void
  onSelect: (id: string) => void
  onShowLibrary: () => void
}) {
  const exercises = useAppStore((s) => s.data.exercises)
  const addExercise = useAppStore((s) => s.addExercise)
  const [showArchived, setShowArchived] = useState(false)

  const list = useMemo(() => {
    const q = query.trim()
    return exercises
      .filter((e) => (showArchived ? e.archived : !e.archived))
      .filter((e) => matchesQuery(e, q, exerciseSearchTexts(e)) && matchesFilter(exerciseMeta(e), filter))
      .sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }, [exercises, query, showArchived, filter])
  const filtered = !!(filter.equipment || filter.region)
  const archivedCount = exercises.filter((e) => e.archived).length

  return (
    <>
      {list.length === 0 && (
        <div className="card empty">
          <strong>{showArchived ? 'Keine archivierten Übungen' : 'Nichts gefunden'}</strong>
          {!showArchived && (query.trim() || filtered) && (
            <button type="button" className="btn" style={{ marginTop: 8 }} onClick={onShowLibrary}>
              In der Bibliothek suchen
            </button>
          )}
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
            <button
              type="button"
              className="card card-tap row"
              aria-label={e.name}
              aria-describedby={e.machineNo || e.noWeight || e.planTarget ? `sub-${e.id}` : undefined}
              onClick={() => onSelect(e.id)}
            >
              <span className="row-main">
                <span className="row-title ellipsis" style={{ display: 'block' }}>{e.name}</span>
                {(e.machineNo || e.noWeight || e.planTarget) && (
                  <span className="row-sub" id={`sub-${e.id}`}>
                    {[
                      e.machineNo && `Gerät ${e.machineNo}`,
                      e.mode === 'hold' ? `Halten ${e.holdSec ?? 60} s` : e.noWeight && 'ohne Gewicht',
                      e.planTarget && (e.mode === 'hold' ? `${e.planTarget.sets} Sätze` : `${e.planTarget.sets} × ${e.planTarget.reps}${e.noWeight ? '' : ` × ${formatKg(e.planTarget.weightKg)}`}`),
                    ].filter(Boolean).join(' · ')}
                  </span>
                )}
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
  const linkExercise = useAppStore((s) => s.linkExercise)
  const [editing, setEditing] = useState(false)
  const [linking, setLinking] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const history = useMemo(() => weightProgression(workouts, id), [workouts, id])
  const records = useMemo(() => exerciseRecords(workouts, id), [workouts, id])

  if (!exercise) {
    return (
      <div className="card empty">
        <strong>Übung nicht gefunden</strong>
        <button type="button" className="btn" onClick={onBack}>Zurück</button>
      </div>
    )
  }

  const meta = exerciseMeta(exercise)
  const media = mediaForExercise(exercise)
  return (
    <>
      <button type="button" className="btn btn-sm" onClick={onBack} style={{ marginBottom: 12 }}>
        ‹ Alle Übungen
      </button>
      <div className="card">
        {media && (
          <>
            <ExerciseMedia media={media} name={exercise.name} />
            <button type="button" className="btn btn-sm btn-link" style={{ display: 'block', margin: '2px auto 0' }} onClick={() => setLinking(true)}>
              Grafik passt nicht? Andere Bibliotheksübung verknüpfen
            </button>
          </>
        )}
        <h2 style={{ margin: media ? '10px 0 4px' : '0 0 4px', fontSize: 22 }}>{exercise.name}</h2>
        {exercise.archived && <p className="muted" style={{ margin: 0 }}>Archiviert</p>}
        <dl className="kv">
          {exercise.machineNo && (<><dt>Gerät</dt><dd>{exercise.machineNo}</dd></>)}
          {exercise.aliases.length > 0 && (<><dt>Auch</dt><dd>{exercise.aliases.join(', ')}</dd></>)}
          <dt>Pause</dt><dd>{formatMmSs(exercise.defaultRestSec ?? settings.defaultRestSec)} min{exercise.defaultRestSec ? '' : ' (Standard)'}</dd>
          <dt>Art</dt><dd>{exercise.mode === 'hold' ? `Halten, ${exercise.holdSec ?? 60} s je Satz` : 'Wiederholungen'}</dd>
          {exercise.mode !== 'hold' && (<><dt>Gewicht</dt><dd>{exercise.noWeight ? 'ohne (nur Wiederholungen)' : 'in kg'}</dd></>)}
          {!exercise.noWeight && exercise.mode !== 'hold' && (<><dt>Schritt</dt><dd>{formatNumber(exercise.weightStep ?? settings.weightStep)} kg{exercise.weightStep ? '' : ' (Standard)'}</dd></>)}
          {exercise.planTarget && (
            <>
              <dt>Vorgabe</dt>
              <dd>
                {exercise.mode === 'hold' ? `${exercise.planTarget.sets} × ${exercise.planTarget.reps} s` : <>{exercise.planTarget.sets} × {exercise.planTarget.reps}{!exercise.noWeight && <> × {formatKg(exercise.planTarget.weightKg)}</>}</>}
                <span className="muted"> ({exercise.planTarget.source})</span>
              </dd>
            </>
          )}
          {exercise.hint && (<><dt>Hinweis</dt><dd>{exercise.hint}</dd></>)}
        </dl>
        <h3 className="detail-sub">Zuordnung</h3>
        <dl className="kv">
          <MetaRows meta={meta} />
          <dt>Bibliothek</dt>
          <dd>{meta.library ? meta.library.name : 'nicht verknüpft'}</dd>
        </dl>
        <div className="btn-row" style={{ marginTop: 12 }}>
          <button type="button" className="btn" onClick={() => setEditing(true)}>Bearbeiten</button>
          {exercise.archived ? (
            <button type="button" className="btn" onClick={() => setArchived(id, false)}>Wiederherstellen</button>
          ) : (
            <button type="button" className="btn" onClick={() => setConfirmArchive(true)}>Archivieren</button>
          )}
        </div>
        <div className="btn-row" style={{ marginTop: 8 }}>
          {exercise.libraryId ? (
            <button type="button" className="btn" onClick={() => linkExercise(id, null)}>Verknüpfung lösen</button>
          ) : (
            <button type="button" className="btn" onClick={() => setLinking(true)}>Mit Bibliothek verknüpfen</button>
          )}
        </div>
      </div>


      {history.length > 0 && (records.maxWeight || records.maxReps) && (
        <>
          <h2 className="section-title">Bestwerte</h2>
          <div className="card">
            <dl className="kv" style={{ margin: 0 }} aria-label="Bestwerte">
              {records.maxWeight && (<><dt>Höchstgewicht</dt><dd>{formatKg(records.maxWeight.value)} <span className="muted">· {formatDate(records.maxWeight.date)}</span></dd></>)}
              {records.best1RM && (<><dt>1RM geschätzt</dt><dd>~{formatKg(Math.round(records.best1RM.value * 2) / 2)} <span className="muted">· Epley, aus Sätzen ≤ 10 Wdh.</span></dd></>)}
              {records.maxReps && (<><dt>{exercise.mode === 'hold' ? 'Längste Haltezeit' : 'Meiste Wdh.'}</dt><dd>{records.maxReps.value}{exercise.mode === 'hold' ? ' s' : ''} <span className="muted">· {formatDate(records.maxReps.date)}</span></dd></>)}
              {records.bestVolume && (<><dt>Bestes Volumen</dt><dd>{formatKg(records.bestVolume.value)} <span className="muted">· {formatDate(records.bestVolume.date)}</span></dd></>)}
            </dl>
          </div>
        </>
      )}

      <h2 className="section-title">Verlauf</h2>
      {history.length === 0 ? (
        <div className="card empty">
          <strong>Noch keine Trainingswerte</strong>
          Sobald du diese Übung in einem Training abhakst, siehst du hier Gewicht und Wiederholungen.
        </div>
      ) : (
        <>
          <div className="card">
            <WeightChart points={history} mode={exercise.mode === 'hold' ? 'seconds' : exercise.noWeight ? 'reps' : 'weight'} />
          </div>
          <div className="card" style={{ marginTop: 12 }}>
            <table className="table">
              <thead>
                <tr><th>Datum</th><th>{exercise.mode === 'hold' ? 'Länger' : exercise.noWeight ? 'Max. Wdh.' : 'Max.'}</th><th>Sätze</th></tr>
              </thead>
              <tbody>
                {[...history].reverse().map((p) => (
                  <tr key={p.workoutId}>
                    <td>{formatDate(p.date)}</td>
                    <td className="num">{p.maxWeightKg === null ? (p.reps === null ? '–' : exercise.mode === 'hold' ? `${p.reps} s` : `${p.reps} Wdh.`) : `${p.reps} × ${formatKg(p.maxWeightKg)}`}</td>
                    <td className="num muted">{p.sets.map((s) => formatSetFor(exercise.mode, s.reps, exercise.noWeight ? null : s.weightKg)).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {meta.library && <HowTo libraryId={meta.library.id} />}

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
      {linking && (
        <LinkLibrarySheet
          exerciseName={exercise.name}
          onPick={(entryId) => {
            linkExercise(id, entryId)
            setLinking(false)
          }}
          onClose={() => setLinking(false)}
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
