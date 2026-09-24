import type { EntryRating } from '../domain/types.ts'

const OPTIONS: { id: EntryRating; label: string }[] = [
  { id: 'leicht', label: 'leicht' },
  { id: 'passend', label: 'passend' },
  { id: 'schwer', label: 'schwer' },
]

/** „Wie war's?“ je Übung: leicht / passend / schwer; ein zweiter Tipp hebt die Auswahl auf. */
export function RatingChips({ name, value, onChange }: { name: string; value: EntryRating | undefined; onChange: (v: EntryRating | undefined) => void }) {
  return (
    <div className="rating-chips" role="group" aria-label={`Wie war ${name}?`}>
      {OPTIONS.map((o) => (
        <button key={o.id} type="button" className="chip" aria-pressed={value === o.id} onClick={() => onChange(value === o.id ? undefined : o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
