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

/**
 * Satz kompakt: "10 × 45" (kg ohne Einheit) bzw. "12 Wdh." ohne Gewicht.
 * `withUnit` hängt " kg" an, wenn ein Gewicht vorhanden ist.
 */
export function formatSet(reps: number, weightKg: number | null, withUnit = false): string {
  if (weightKg === null) return `${reps} Wdh.`
  return `${reps} × ${formatNumber(weightKg)}${withUnit ? ' kg' : ''}`
}

/** Wiederholungen: ganze Zahl ≥ 1, sonst NaN. Leer → null. */
export function parseReps(input: string): number | null {
  const cleaned = input.trim()
  if (cleaned === '') return null
  if (!/^\d+$/.test(cleaned)) return Number.NaN
  const n = Number(cleaned)
  return n >= 1 ? n : Number.NaN
}

const dateFormatter = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })
const dateTimeFormatter = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
const timeFormatter = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit' })

/** "Do., 10.09.2026" */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso))
}

/** "10.09.2026, 18:32" */
export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso))
}

/** "18:32" */
export function formatTime(iso: string): string {
  return timeFormatter.format(new Date(iso))
}

/** 95 → "1:35" (Minuten:Sekunden) */
export function formatMmSs(totalSec: number): string {
  const s = Math.max(0, Math.round(totalSec))
  const m = Math.floor(s / 60)
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

/** "heute", "gestern", "vor 3 Tagen" oder Datum */
export function formatRelativeDay(iso: string, now = new Date()): string {
  const d = new Date(iso)
  const day = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diff = Math.round((day(now) - day(d)) / 86400000)
  if (diff === 0) return 'heute'
  if (diff === 1) return 'gestern'
  if (diff > 1 && diff < 7) return `vor ${diff} Tagen`
  return formatDate(iso)
}

/** "1.280 kg" als Volumen */
export function formatVolume(kg: number): string {
  return `${new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(kg)} kg`
}
