/** Eindeutige IDs; crypto.randomUUID fehlt in manchen älteren WebViews. */
export function newId(prefix = ''): string {
  const c = globalThis.crypto
  if (c && typeof c.randomUUID === 'function') return prefix + c.randomUUID()
  const rnd = () => Math.random().toString(16).slice(2, 10)
  return `${prefix}${Date.now().toString(16)}-${rnd()}-${rnd()}`
}

export function nowIso(): string {
  return new Date().toISOString()
}
