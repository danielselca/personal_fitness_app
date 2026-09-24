import { useMemo, useState } from 'react'
import { EQUIPMENT_FILTER_OPTIONS, exerciseMeta, exerciseSearchTexts, matchesFilter, muscleText, searchLibrary, type EquipmentFilter } from '../domain/library.ts'
import { noWeightFirst, sortForPicker } from '../domain/progress.ts'
import { matchesQuery } from '../domain/search.ts'
import { normalizeName } from '../domain/suggestions.ts'
import { EQUIPMENT_LABEL } from '../domain/taxonomy.ts'
import { appStore, useAppStore } from '../store/appStore.ts'
import { FilterChips } from './FilterChips.tsx'
import { Sheet } from './Sheet.tsx'

const LIB = 'lib:'

/**
 * Übungsauswahl fürs Training: Suche, Ausrüstungsfilter, Mehrfachauswahl, neue Übung direkt aus dem
 * Suchtext (F1, AK4b). Bei Suche oder Filter zusätzlich Treffer aus der Bibliothek; sie werden beim
 * Hinzufügen in „Meine Übungen“ übernommen.
 */
export function ExercisePicker({ excludeIds, onAdd, onClose }: { excludeIds: string[]; onAdd: (ids: string[]) => void; onClose: () => void }) {
  const exercises = useAppStore((s) => s.data.exercises)
  const addExercise = useAppStore((s) => s.addExercise)
  const adoptFromLibrary = useAppStore((s) => s.adoptFromLibrary)
  const setArchived = useAppStore((s) => s.setExerciseArchived)
  const [query, setQuery] = useState('')
  const [equipment, setEquipment] = useState<EquipmentFilter | undefined>()
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const available = useMemo(() => sortForPicker(exercises.filter((e) => !e.archived && !excludeIds.includes(e.id))), [exercises, excludeIds])
  const list = useMemo(
    () => available.filter((e) => matchesQuery(e, query, exerciseSearchTexts(e)) && matchesFilter(exerciseMeta(e), { equipment })),
    [available, query, equipment],
  )
  const q = query.trim()
  const exactExists = q ? exercises.some((e) => normalizeName(e.name) === normalizeName(q)) : true
  const libList = useMemo(() => {
    if (!q && !equipment) return []
    // Einträge, die schon als aktive eigene Übung existieren (verknüpft oder gleichnamig), erscheinen oben
    const active = exercises.filter((e) => !e.archived)
    const linked = new Set(active.flatMap((e) => (e.libraryId ? [e.libraryId] : [])))
    const names = new Set(active.map((e) => normalizeName(e.name)))
    return searchLibrary(q, { equipment }).filter((l) => !linked.has(l.id) && !names.has(normalizeName(l.name)) && !active.some((e) => e.id === `ex-lib-${l.id}`))
  }, [exercises, q, equipment])

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  // Bibliothekstreffer übernehmen; gibt es schon eine gleichnamige eigene Übung, wird diese genommen
  const resolve = (sel: string): string | null => {
    if (!sel.startsWith(LIB)) return sel
    const r = adoptFromLibrary(sel.slice(LIB.length))
    if (r.status === 'unknown') return null
    if (r.exercise.archived) setArchived(r.exercise.id, false)
    return r.exercise.id
  }
  // Beim Hinzufügen: ohne Gewicht zuerst, sonst in Antipp-Reihenfolge
  const resolvedSelection = () => {
    const ids = [...new Set(selected.map(resolve).filter((id): id is string => id !== null))]
    const all = appStore.getState().data.exercises
    return noWeightFirst(ids, (id) => !!all.find((e) => e.id === id)?.noWeight)
  }

  const createAndAdd = () => {
    const r = addExercise({ name: q })
    if (!r.ok) return setError(r.error)
    onAdd([...resolvedSelection(), r.exercise.id])
  }

  return (
    <Sheet
      title="Übungen hinzufügen"
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-primary btn-block" disabled={selected.length === 0} onClick={() => onAdd(resolvedSelection())}>
          {selected.length === 0 ? 'Übungen auswählen' : `${selected.length} hinzufügen`}
        </button>
      }
    >
      <input
        className="input"
        type="search"
        placeholder="Suchen oder neu anlegen"
        aria-label="Übung suchen"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setError(null)
        }}
        autoFocus
        enterKeyHint="search"
        style={{ marginBottom: 8 }}
      />
      <FilterChips label="Ausrüstung" options={EQUIPMENT_FILTER_OPTIONS} value={equipment} onChange={setEquipment} />
      {error && <p className="error" role="alert">{error}</p>}
      {q && !exactExists && (
        <button type="button" className="btn" style={{ width: '100%', margin: '4px 0' }} onClick={createAndAdd}>
          „{q}“ als neue Übung anlegen
        </button>
      )}
      <ul className="list" style={{ marginTop: 8 }}>
        {list.map((e, i) => {
          const on = selected.includes(e.id)
          const groupStart = !q && (i === 0 || !!list[i - 1].noWeight !== !!e.noWeight)
          return (
            <li key={e.id} className={groupStart ? 'picker-group' : undefined} data-group={groupStart ? (e.noWeight ? 'Ohne Gewicht' : 'Mit Gewicht') : undefined}>
              <button
                type="button"
                aria-pressed={on}
                aria-label={e.name}
                aria-describedby={e.machineNo || (q && e.noWeight) || e.mode === 'hold' ? `pick-sub-${e.id}` : undefined}
                className={`card card-tap row picker-row ${on ? 'picker-on' : ''}`}
                onClick={() => toggle(e.id)}
              >
                <span className="row-main">
                  <span className="row-title ellipsis" style={{ display: 'block' }}>{e.name}</span>
                  {(e.machineNo || (q && e.noWeight) || e.mode === 'hold') && (
                    <span className="row-sub" id={`pick-sub-${e.id}`}>{[e.machineNo && `Gerät ${e.machineNo}`, e.mode === 'hold' ? `Halten ${e.holdSec ?? 60} s` : q && e.noWeight && 'ohne Gewicht'].filter(Boolean).join(' · ')}</span>
                  )}
                </span>
                <span className={`check-mark ${on ? 'check-on' : ''}`} aria-hidden="true">{on ? '✓' : ''}</span>
              </button>
            </li>
          )
        })}
      </ul>
      {libList.length > 0 && (
        <ul className="list" style={{ marginTop: 8 }} aria-label="Aus der Bibliothek">
          {libList.map((l, i) => {
            const key = LIB + l.id
            const on = selected.includes(key)
            return (
              <li key={key} className={i === 0 ? 'picker-group' : undefined} data-group={i === 0 ? 'Aus der Bibliothek' : undefined}>
                <button
                  type="button"
                  aria-pressed={on}
                  aria-label={l.name}
                  aria-describedby={`pick-lib-${l.id}`}
                  className={`card card-tap row picker-row ${on ? 'picker-on' : ''}`}
                  onClick={() => toggle(key)}
                >
                  <span className="row-main">
                    <span className="row-title ellipsis" style={{ display: 'block' }}>{l.name}</span>
                    <span className="row-sub" id={`pick-lib-${l.id}`}>{[EQUIPMENT_LABEL[l.equipment], muscleText(l.muscles.primary)].join(' · ')}</span>
                  </span>
                  <span className={`check-mark ${on ? 'check-on' : ''}`} aria-hidden="true">{on ? '✓' : ''}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {list.length === 0 && !q && !equipment && <p className="muted">Alle Übungen sind bereits im Training.</p>}
      {list.length === 0 && libList.length === 0 && !q && equipment && <p className="muted">Keine Übung mit dieser Ausrüstung.</p>}
      {list.length === 0 && libList.length === 0 && q && exactExists && <p className="muted">Bereits im Training oder archiviert.</p>}
    </Sheet>
  )
}
