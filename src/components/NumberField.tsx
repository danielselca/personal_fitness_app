import { useEffect, useState } from 'react'
import { formatNumber, parseReps, parseWeight } from '../lib/format.ts'

/**
 * Zahlenfeld mit Textzustand: Komma/Punkt erlaubt, ungültige Eingaben werden rot markiert
 * und nicht übernommen. Schriftgröße ≥ 16 px verhindert Auto-Zoom auf iOS (N2).
 */
export function NumberField({
  kind,
  value,
  onChange,
  label,
  placeholder,
  className,
}: {
  kind: 'weight' | 'reps'
  value: number | null
  onChange: (v: number | null) => void
  label: string
  placeholder?: string
  className?: string
}) {
  const toText = (v: number | null) => (v === null ? '' : kind === 'weight' ? formatNumber(v) : String(v))
  const [text, setText] = useState(() => toText(value))
  const [invalid, setInvalid] = useState(false)

  useEffect(() => {
    const parsed = kind === 'weight' ? parseWeight(text) : parseReps(text)
    const same = parsed === value || (Number.isNaN(parsed) && false)
    if (!same) {
      setText(toText(value))
      setInvalid(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <input
      className={`input input-num ${invalid ? 'input-invalid' : ''} ${className ?? ''}`}
      inputMode={kind === 'weight' ? 'decimal' : 'numeric'}
      aria-label={label}
      aria-invalid={invalid || undefined}
      placeholder={placeholder}
      value={text}
      enterKeyHint="done"
      onFocus={(e) => e.target.select()}
      onChange={(e) => {
        const t = e.target.value
        setText(t)
        const parsed = kind === 'weight' ? parseWeight(t) : parseReps(t)
        if (parsed !== null && Number.isNaN(parsed)) {
          setInvalid(true)
          return
        }
        setInvalid(false)
        onChange(parsed)
      }}
      onBlur={() => {
        if (invalid) {
          setText(toText(value))
          setInvalid(false)
        }
      }}
    />
  )
}
