import { MUSCLE_INFO, type Pattern } from '../taxonomy.ts'
import type { HardSet } from './week.ts'

/**
 * Gleichgewicht der Woche (Faustregeln): Drücken : Ziehen nach Bewegungsmuster und Ober- :
 * Unterkörper nach der Region der Hauptmuskeln. Mehr Ziehen als Drücken ist in Ordnung
 * (entlastet die Schultern); gewarnt wird erst ab 1,2 : 1 zugunsten Drücken.
 */

export const PUSH_PATTERNS: readonly Pattern[] = ['druecken-horizontal', 'druecken-vertikal', 'fliegende']
export const PULL_PATTERNS: readonly Pattern[] = ['ziehen-horizontal', 'ziehen-vertikal', 'reverse-fliegende']
export const MAX_PUSH_PULL = 1.2
/** Mindestanteil jeder Körperhälfte an den Sätzen. */
export const MIN_HALF_SHARE = 1 / 3

export interface Balance {
  push: number
  pull: number
  /** Drücken je Ziehen; null ohne Ziehen-Sätze. */
  ratio: number | null
  pushHeavy: boolean
  upper: number
  lower: number
  /** Körperhälfte mit zu wenig Anteil, sonst null. */
  lacking: 'oberkoerper' | 'unterkoerper' | null
}

type Half = 'upper' | 'lower' | null

function halfOf(s: HardSet): Half {
  const regions = s.meta.muscles.primary.map((m) => MUSCLE_INFO[m].region)
  if (regions.includes('beine')) return 'lower'
  if (regions.some((r) => r !== 'rumpf')) return 'upper'
  return null // Rumpf zählt zu keiner Hälfte
}

export function weekBalance(sets: HardSet[]): Balance {
  let push = 0
  let pull = 0
  let upper = 0
  let lower = 0
  for (const s of sets) {
    const p = s.meta.pattern
    if (p && PUSH_PATTERNS.includes(p)) push++
    if (p && PULL_PATTERNS.includes(p)) pull++
    const h = halfOf(s)
    if (h === 'upper') upper++
    if (h === 'lower') lower++
  }
  const ratio = pull > 0 ? push / pull : null
  const pushHeavy = push > 0 && (ratio === null || ratio > MAX_PUSH_PULL)
  const total = upper + lower
  const lacking = total === 0 ? null : upper / total < MIN_HALF_SHARE ? 'oberkoerper' : lower / total < MIN_HALF_SHARE ? 'unterkoerper' : null
  return { push, pull, ratio, pushHeavy, upper, lower, lacking }
}

/** „1,4 : 1“ */
export function ratioText(ratio: number): string {
  return `${(Math.round(ratio * 10) / 10).toFixed(1).replace('.', ',')} : 1`
}
