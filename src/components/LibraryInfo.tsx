import { useEffect, useState } from 'react'
import { loadLibraryDetails, muscleText, type ExerciseMeta } from '../domain/library.ts'
import type { LibraryDetails } from '../library/types.ts'
import { BODY_PART_LABEL, CATEGORY_LABEL, EQUIPMENT_LABEL, LEVEL_LABEL, PATTERN_LABEL } from '../domain/taxonomy.ts'

/** Zuordnung als Zeilen einer `dl.kv`: Ausrüstung, Muskeln, Bewegung, Level, belastete Bereiche. */
export function MetaRows({ meta, withLoads = true }: { meta: Omit<ExerciseMeta, 'library'>; withLoads?: boolean }) {
  return (
    <>
      {meta.equipment && (<><dt>Ausrüstung</dt><dd>{EQUIPMENT_LABEL[meta.equipment]}{meta.tags.includes('calisthenics') ? ' · Calisthenics' : ''}</dd></>)}
      {meta.category && meta.category !== 'kraft' && (<><dt>Kategorie</dt><dd>{CATEGORY_LABEL[meta.category]}</dd></>)}
      {meta.muscles.primary.length > 0 && (<><dt>Hauptmuskeln</dt><dd>{muscleText(meta.muscles.primary)}</dd></>)}
      {meta.muscles.secondary.length > 0 && (<><dt>Mitbeteiligt</dt><dd>{muscleText(meta.muscles.secondary)}</dd></>)}
      {meta.pattern && (<><dt>Bewegung</dt><dd>{PATTERN_LABEL[meta.pattern]}</dd></>)}
      {meta.level && (<><dt>Level</dt><dd>{LEVEL_LABEL[meta.level]}</dd></>)}
      {withLoads && meta.loads.length > 0 && (<><dt>Belastet</dt><dd>{meta.loads.map((b) => BODY_PART_LABEL[b]).join(', ')}</dd></>)}
    </>
  )
}

/** Ausführungstipps und typische Fehler eines Bibliothekseintrags (nachgeladen). */
export function HowTo({ libraryId }: { libraryId: string }) {
  const [loaded, setLoaded] = useState<{ id: string; details: LibraryDetails | undefined } | null>(null)
  useEffect(() => {
    let alive = true
    void loadLibraryDetails(libraryId).then((details) => {
      if (alive) setLoaded({ id: libraryId, details })
    })
    return () => {
      alive = false
    }
  }, [libraryId])

  const details = loaded?.id === libraryId ? loaded.details : undefined
  if (!loaded || loaded.id !== libraryId) return <p className="muted" role="status">Lade Ausführung …</p>
  if (!details) return null
  return (
    <>
      <h2 className="section-title">Ausführung</h2>
      <div className="card">
        <ol className="howto" aria-label="Ausführung">
          {details.cues.map((c) => <li key={c}>{c}</li>)}
        </ol>
      </div>
      <h2 className="section-title">Typische Fehler</h2>
      <div className="card">
        <ul className="howto howto-mistakes" aria-label="Typische Fehler">
          {details.mistakes.map((m) => <li key={m}>{m}</li>)}
        </ul>
      </div>
    </>
  )
}
