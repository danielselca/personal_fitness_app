/**
 * Element sanft in den sichtbaren Bereich holen. Ohne Animation, wenn das System
 * „Bewegung reduzieren“ meldet. Fehlt scrollIntoView (jsdom), passiert nichts.
 */
export function scrollIntoViewSoft(el: Element | null | undefined, block: ScrollLogicalPosition) {
  if (!el || typeof el.scrollIntoView !== 'function') return
  const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block })
}
