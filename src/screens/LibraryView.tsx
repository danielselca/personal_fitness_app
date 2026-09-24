import { useMemo, useState } from 'react'
import { ExerciseMedia } from '../components/ExerciseMedia.tsx'
import { HowTo, MetaRows } from '../components/LibraryInfo.tsx'
import { mediaFor } from '../domain/media.ts'
import { libraryEntry, muscleText, searchLibrary, type LibraryFilter } from '../domain/library.ts'
import { EQUIPMENT_LABEL } from '../domain/taxonomy.ts'
import type { Exercise } from '../domain/types.ts'
import { useAppStore } from '../store/appStore.ts'

/** Eigene, nicht archivierte Übung zu einem Bibliothekseintrag (verknüpft oder mit fester ID). */
function ownFor(exercises: Exercise[], entryId: string): Exercise | undefined {
  return exercises.find((e) => !e.archived && (e.libraryId === entryId || e.id === `ex-lib-${entryId}`))
}

export function LibraryList({ query, filter, onSelect }: { query: string; filter: LibraryFilter; onSelect: (id: string) => void }) {
  const exercises = useAppStore((s) => s.data.exercises)
  const list = useMemo(() => searchLibrary(query, filter), [query, filter])

  if (list.length === 0) {
    return (
      <div className="card empty">
        <strong>Nichts gefunden</strong>
        Andere Schreibweise oder Filter probieren.
      </div>
    )
  }
  return (
    <ul className="list" aria-label="Bibliothek">
      {list.map((e) => {
        const own = ownFor(exercises, e.id)
        const m = mediaFor(e)
        return (
          <li key={e.id}>
            <button type="button" className="card card-tap row" aria-label={e.name} aria-describedby={own ? `lib-sub-${e.id} lib-own-${e.id}` : `lib-sub-${e.id}`} onClick={() => onSelect(e.id)}>
              {m && <ExerciseMedia media={m} name={e.name} size="thumb" />}
              <span className="row-main">
                <span className="row-title ellipsis" style={{ display: 'block' }}>{e.name}</span>
                <span className="row-sub" id={`lib-sub-${e.id}`}>
                  {[EQUIPMENT_LABEL[e.equipment], muscleText(e.muscles.primary)].filter(Boolean).join(' · ')}
                </span>
              </span>
              {own && <span className="badge" id={`lib-own-${e.id}`}>In Meine</span>}
              <span className="muted" aria-hidden="true">›</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function LibraryDetail({ id, onBack, onOpenOwn }: { id: string; onBack: () => void; onOpenOwn: (exerciseId: string) => void }) {
  const entry = libraryEntry(id)
  const exercises = useAppStore((s) => s.data.exercises)
  const adopt = useAppStore((s) => s.adoptFromLibrary)
  const [nameMatch, setNameMatch] = useState<Exercise | null>(null)
  const [added, setAdded] = useState(false)
  const own = ownFor(exercises, id)
  const media = mediaFor(entry)

  if (!entry) {
    return (
      <div className="card empty">
        <strong>Übung nicht gefunden</strong>
        <button type="button" className="btn" onClick={onBack}>Zurück</button>
      </div>
    )
  }

  const run = (opts?: { linkTo?: string; createNew?: boolean }) => {
    const r = adopt(id, opts)
    if (r.status === 'name-match') return setNameMatch(r.exercise)
    setNameMatch(null)
    if (r.status !== 'unknown') setAdded(true)
  }

  return (
    <>
      <button type="button" className="btn btn-sm" onClick={onBack} style={{ marginBottom: 12 }}>
        ‹ Bibliothek
      </button>
      <div className="card">
        {media && <ExerciseMedia media={media} name={entry.name} />}
        <h2 style={{ margin: media ? '12px 0 4px' : '0 0 4px', fontSize: 22 }}>{entry.name}</h2>
        {entry.en.toLowerCase() !== entry.name.toLowerCase() && <p className="muted en-name" lang="en">{entry.en}</p>}
        <dl className="kv">
          <MetaRows meta={{ ...entry, tags: entry.tags ?? [] }} />
          <dt>Art</dt>
          <dd>{entry.mode === 'hold' ? `Halten, ${entry.holdSec ?? 60} s je Satz` : entry.noWeight ? 'Wiederholungen, ohne Gewicht' : 'Wiederholungen mit Gewicht'}</dd>
        </dl>
        <div className="btn-row" style={{ marginTop: 12 }}>
          {own ? (
            <button type="button" className="btn" onClick={() => onOpenOwn(own.id)}>In Meine Übungen öffnen</button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => run()}>Zu meinen Übungen</button>
          )}
        </div>
        {added && own && (
          <p className="muted" role="status" style={{ margin: '8px 0 0' }}>
            In „Meine Übungen“ als „{own.name}“.
          </p>
        )}
      </div>

      <HowTo libraryId={id} />

      {nameMatch && (
        <div className="sheet-backdrop" onClick={() => setNameMatch(null)}>
          <div className="dialog" role="alertdialog" aria-modal="true" aria-label="Gleichnamige Übung" onClick={(e) => e.stopPropagation()}>
            <h2>„{nameMatch.name}“ gibt es schon</h2>
            <p>Mit deiner Übung verknüpfen? Dein Verlauf bleibt erhalten und du siehst dort die Ausführungstipps.</p>
            <div className="dialog-actions" style={{ flexDirection: 'column' }}>
              <button type="button" className="btn btn-primary" onClick={() => run({ linkTo: nameMatch.id })}>Mit „{nameMatch.name}“ verknüpfen</button>
              <button type="button" className="btn" onClick={() => run({ createNew: true })}>Als neue Übung anlegen</button>
              <button type="button" className="btn" onClick={() => setNameMatch(null)}>Abbrechen</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
