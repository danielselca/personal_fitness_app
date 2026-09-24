import type { Exercise } from './types.ts'

const DIACRITICS = /\p{M}/gu
const SEPARATORS = /[^\p{L}\p{N}]/gu

/** Klein, ß → ss, ohne Akzente und Trennzeichen; wahlweise Umlaute als ae/oe/ue. */
function fold(text: string, umlautAsDigraph: boolean): string {
  let t = text.toLowerCase().replace(/ß/g, 'ss')
  if (umlautAsDigraph) t = t.replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue')
  return t.normalize('NFD').replace(DIACRITICS, '').replace(SEPARATORS, '')
}

/** Suchschlüssel eines Textes in beiden Umlaut-Schreibweisen: „Überzüge“ → „uberzuge“, „ueberzuege“. */
export function searchKeys(text: string): string[] {
  const plain = fold(text, false)
  const digraph = fold(text, true)
  return plain === digraph ? [plain] : [plain, digraph]
}

/** Suchbegriff in Wörter zerlegt; jedes Wort muss irgendwo vorkommen. */
export function queryTokens(query: string): string[] {
  return query
    .split(/\s+/)
    .map((w) => fold(w, false))
    .filter(Boolean)
}

/** true, wenn jedes Wort des Suchbegriffs in einem der Texte steckt (ohne Groß-/Kleinschreibung, Akzente, Trennzeichen). */
export function matchesText(texts: string[], query: string): boolean {
  const tokens = queryTokens(query)
  if (tokens.length === 0) return true
  const keys = texts.flatMap(searchKeys)
  return tokens.every((t) => keys.some((k) => k.includes(t)))
}

/**
 * Suche über Name, Alias und Gerätenummer (F1, AK3). „latzug“ findet „Lat-Zug“,
 * „uberzuge“ und „ueberzuege“ finden „Überzüge“, „kurzhantel schräg“ findet „Schrägbank Kurzhantel“.
 */
export function matchesQuery(e: Exercise, query: string): boolean {
  const q = query.trim()
  if (!q) return true
  if (e.machineNo && (e.machineNo === q || `#${e.machineNo}` === q)) return true
  return matchesText([e.name, ...e.aliases, ...(e.machineNo ? [e.machineNo] : [])], q)
}
