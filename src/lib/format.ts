/** Zahlformatierung und -parsing für die deutsche Oberfläche (N1, AK8). */

const kgFormatter = new Intl.NumberFormat('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 2 })

/** 12.5 → "12,5 kg"; undefined/null → "– kg" */
export function formatKg(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '– kg'
  return `${kgFormatter.format(value)} kg`
}

/** 12.5 → "12,5" (ohne Einheit, für Eingabefelder) */
export function formatNumber(value: number): string {
  return kgFormatter.format(value)
}

/**
 * Wandelt eine Gewichtseingabe in eine Zahl um. Akzeptiert Komma und Punkt,
 * Leerzeichen und ein optionales "kg". Rundet auf 2 Nachkommastellen.
 * Leere Eingabe → null (kein Gewicht, z. B. Theraband). Ungültig → NaN.
 */
export function parseWeight(input: string): number | null {
  const cleaned = input.trim().toLowerCase().replace(/kg$/, '').trim().replace(',', '.')
  if (cleaned === '') return null
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return Number.NaN
  return Math.round(Number(cleaned) * 100) / 100
}

/** Wiederholungen: ganze Zahl ≥ 1, sonst NaN. Leer → null. */
export function parseReps(input: string): number | null {
  const cleaned = input.trim()
  if (cleaned === '') return null
  if (!/^\d+$/.test(cleaned)) return Number.NaN
  const n = Number(cleaned)
  return n >= 1 ? n : Number.NaN
}
