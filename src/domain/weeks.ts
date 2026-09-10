/** ISO-Wochen (Montag–Sonntag, lokale Zeit), SPEC A-6. */

/** Montag 00:00 lokale Zeit der Woche, in der `d` liegt. */
export function startOfIsoWeek(d: Date): Date {
  const x = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = (x.getDay() + 6) % 7 // Mo=0 … So=6
  x.setDate(x.getDate() - day)
  return x
}

/** Schlüssel "2026-W37" für die ISO-Woche von `d`. */
export function isoWeekKey(d: Date): string {
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const dayNr = (target.getDay() + 6) % 7
  target.setDate(target.getDate() - dayNr + 3) // Donnerstag der Woche
  const isoYear = target.getFullYear()
  const firstThursday = new Date(isoYear, 0, 4)
  const firstDayNr = (firstThursday.getDay() + 6) % 7
  firstThursday.setDate(firstThursday.getDate() - firstDayNr + 3)
  const week = 1 + Math.round((target.getTime() - firstThursday.getTime()) / (7 * 24 * 3600 * 1000))
  return `${isoYear}-W${String(week).padStart(2, '0')}`
}

/** Die letzten `count` Wochen inkl. der Woche von `now`, älteste zuerst. */
export function lastWeeks(now: Date, count: number): { key: string; start: Date }[] {
  const start = startOfIsoWeek(now)
  const out: { key: string; start: Date }[] = []
  for (let i = count - 1; i >= 0; i--) {
    const s = new Date(start)
    s.setDate(s.getDate() - 7 * i)
    out.push({ key: isoWeekKey(s), start: s })
  }
  return out
}
