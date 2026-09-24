import { useMemo, useState } from 'react'
import { EQUIPMENT_FILTER_OPTIONS, exerciseMeta, exerciseSearchTexts, matchesFilter, muscleText, searchLibrary, type EquipmentFilter } from '../domain/library.ts'
import { activeRestrictions, dayKey, exerciseHits, hitsFor } from '../domain/restrictions.ts'
import { matchesQuery } from '../domain/search.ts'
import { normalizeName } from '../domain/suggestions.ts'
import { swapCandidates } from '../domain/swap.ts'
import { EQUIPMENT_LABEL } from '../domain/taxonomy.ts'
import type { LibraryIndexEntry } from '../library/types.ts'
import type { Exercise } from '../domain/types.ts'
import { useAppStore } from '../store/appStore.ts'
import { FilterChips } from './FilterChips.tsx'
import { Sheet } from './Sheet.tsx'

/**
 * „Übung tauschen“: Vorschläge mit gleichem Bewegungsmuster bzw. gleichen Hauptmuskeln – deine
 * Übungen zuerst, dann die Bibliothek; ohne geschonte Bereiche. Ausrüstungs-Chips (Gerät besetzt)
 * und Suche für alles andere. Mit `templateName` gibt es die Wahl „Nur heute“ / „Auch in der Vorlage“.
 */
export function SwapSheet({
  exerciseId,
  excludeIds,
  templateName,
  onPick,
  onClose,
}: {
  exerciseId: string
  excludeIds: string[]
  templateName?: string
  onPick: (newId: string, alsoTemplate: boolean) => void
  onClose: () => void
}) {
  const exercises = useAppStore((s) => s.data.exercises)
  const restrictions = useAppStore((s) => s.data.restrictions)
  const adopt = useAppStore((s) => s.adoptFromLibrary)
  const [query, setQuery] = useState('')
  const [equipment, setEquipment] = useState<EquipmentFilter | undefined>()
  const [alsoTemplate, setAlsoTemplate] = useState(false)
  const active = useMemo(() => activeRestrictions(restrictions, dayKey()), [restrictions])
  const current = exercises.find((e) => e.id === exerciseId)
  const q = query.trim()

  const { own, library } = useMemo(() => {
    const byEquipment = (m: Parameters<typeof matchesFilter>[0]) => matchesFilter(m, { equipment })
    if (!q) {
      const c = swapCandidates(exercises, exerciseId, active, excludeIds)
      return {
        own: c.own.filter((o) => byEquipment(exerciseMeta(o))),
        library: c.library.filter((l) => byEquipment({ ...l, tags: l.tags ?? [] })),
      }
    }
    const mine = exercises.filter((e) => e.id !== exerciseId && !e.archived && !excludeIds.includes(e.id) && matchesQuery(e, q, exerciseSearchTexts(e)) && byEquipment(exerciseMeta(e)))
    const linked = new Set(exercises.map((e) => e.libraryId).filter(Boolean))
    const names = new Set(exercises.map((e) => normalizeName(e.name)))
    return {
      own: mine,
      library: searchLibrary(q, { equipment }).filter((l) => !linked.has(l.id) && !names.has(normalizeName(l.name)) && !exercises.some((e) => e.id === `ex-lib-${l.id}`)),
    }
  }, [q, equipment, exercises, exerciseId, active, excludeIds])

  const pickLibrary = (l: LibraryIndexEntry) => {
    const r = adopt(l.id)
    if (r.status !== 'unknown') onPick(r.exercise.id, alsoTemplate)
  }

  const warn = (hits: string[]) => (hits.length ? `⚠ ${hits.join(', ')}` : null)
  const ownRow = (e: Exercise) => {
    const m = exerciseMeta(e)
    const sub = [m.equipment && EQUIPMENT_LABEL[m.equipment], muscleText(m.muscles.primary), warn(exerciseHits(e, active))].filter(Boolean).join(' · ')
    return (
      <li key={e.id}>
        <button type="button" className="card card-tap row" aria-label={e.name} onClick={() => onPick(e.id, alsoTemplate)}>
          <span className="row-main">
            <span className="row-title ellipsis" style={{ display: 'block' }}>{e.name}</span>
            {sub && <span className="row-sub">{sub}</span>}
          </span>
        </button>
      </li>
    )
  }

  return (
    <Sheet title={`„${current?.name ?? 'Übung'}“ tauschen`} onClose={onClose}>
      {templateName && (
        <div className="segment" role="radiogroup" aria-label="Tauschen für">
          <button type="button" role="radio" aria-checked={!alsoTemplate} className={!alsoTemplate ? 'on' : ''} onClick={() => setAlsoTemplate(false)}>Nur heute</button>
          <button type="button" role="radio" aria-checked={alsoTemplate} className={alsoTemplate ? 'on' : ''} onClick={() => setAlsoTemplate(true)}>Auch in der Vorlage</button>
        </div>
      )}
      <input
        className="input"
        type="search"
        placeholder="Andere Übung suchen"
        aria-label="Übung zum Tauschen suchen"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        enterKeyHint="search"
        style={{ marginBottom: 8 }}
      />
      <FilterChips label="Ausrüstung" options={EQUIPMENT_FILTER_OPTIONS} value={equipment} onChange={setEquipment} />
      {!q && active.length > 0 && <p className="muted" style={{ fontSize: 13, margin: '0 0 8px' }}>Vorschläge ohne Übungen, die geschonte Bereiche belasten.</p>}
      {own.length > 0 && (
        <ul className="list" aria-label="Deine Übungen">
          <li className="picker-group-head" aria-hidden="true">Deine Übungen</li>
          {own.map(ownRow)}
        </ul>
      )}
      {library.length > 0 && (
        <ul className="list" aria-label="Aus der Bibliothek" style={{ marginTop: 8 }}>
          <li className="picker-group-head" aria-hidden="true">Aus der Bibliothek</li>
          {library.map((l) => (
            <li key={l.id}>
              <button type="button" className="card card-tap row" aria-label={l.name} onClick={() => pickLibrary(l)}>
                <span className="row-main">
                  <span className="row-title ellipsis" style={{ display: 'block' }}>{l.name}</span>
                  <span className="row-sub">{[EQUIPMENT_LABEL[l.equipment], muscleText(l.muscles.primary), warn(hitsFor(l, active))].filter(Boolean).join(' · ')}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {own.length === 0 && library.length === 0 && (
        <p className="muted">{q || equipment ? 'Nichts gefunden.' : 'Keine passenden Vorschläge – such oben nach einer anderen Übung.'}</p>
      )}
    </Sheet>
  )
}
