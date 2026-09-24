import type { ChipOption } from '../domain/library.ts'

/** Wischbare Chip-Reihe mit „Alle“; ein zweiter Tipp auf den aktiven Chip hebt den Filter auf. */
export function FilterChips<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: ChipOption<T>[]
  value: T | undefined
  onChange: (v: T | undefined) => void
}) {
  return (
    <div className="chips" role="group" aria-label={label}>
      <button type="button" className="chip" aria-pressed={value === undefined} onClick={() => onChange(undefined)}>
        Alle
      </button>
      {options.map((o) => (
        <button key={o.id} type="button" className="chip" aria-pressed={value === o.id} onClick={() => onChange(value === o.id ? undefined : o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}
