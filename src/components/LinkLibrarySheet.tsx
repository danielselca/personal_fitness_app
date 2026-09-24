import { useMemo, useState } from 'react'
import { EQUIPMENT_FILTER_OPTIONS, muscleText, searchLibrary, type EquipmentFilter } from '../domain/library.ts'
import { EQUIPMENT_LABEL } from '../domain/taxonomy.ts'
import { FilterChips } from './FilterChips.tsx'
import { Sheet } from './Sheet.tsx'

/** Bibliothekseintrag für eine eigene Übung auswählen (Verknüpfen). */
export function LinkLibrarySheet({ exerciseName, onPick, onClose }: { exerciseName: string; onPick: (entryId: string) => void; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [equipment, setEquipment] = useState<EquipmentFilter | undefined>()
  const list = useMemo(() => searchLibrary(query, { equipment }), [query, equipment])

  return (
    <Sheet title={`„${exerciseName}“ verknüpfen`} onClose={onClose}>
      <p className="muted" style={{ marginTop: 0, fontSize: 14 }}>
        Wähle die passende Übung aus der Bibliothek. Name und Verlauf deiner Übung bleiben, dazu kommen Muskeln und Ausführungstipps.
      </p>
      <input
        className="input"
        type="search"
        placeholder="Bibliothek durchsuchen"
        aria-label="Bibliothek durchsuchen"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        enterKeyHint="search"
        style={{ marginBottom: 8 }}
      />
      <FilterChips label="Ausrüstung" options={EQUIPMENT_FILTER_OPTIONS} value={equipment} onChange={setEquipment} />
      <ul className="list">
        {list.map((e) => (
          <li key={e.id}>
            <button type="button" className="card card-tap row" aria-label={e.name} onClick={() => onPick(e.id)}>
              <span className="row-main">
                <span className="row-title ellipsis" style={{ display: 'block' }}>{e.name}</span>
                <span className="row-sub">{[EQUIPMENT_LABEL[e.equipment], muscleText(e.muscles.primary)].join(' · ')}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="muted">Nichts gefunden.</p>}
    </Sheet>
  )
}
