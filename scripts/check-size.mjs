// Größenbudget für den Produktionsbuild (läuft in CI nach `npm run build`).
// Prüft: Einstiegs-JS (roh und gzip), Summe des Service-Worker-Precaches und dass keine
// Übungsgrafiken (`media/`) vorgeladen werden – die kommen über den Laufzeit-Cache.
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'

const DIST = 'dist'
const BUDGET = {
  entryJsKb: 450,
  entryJsGzipKb: 140,
  precacheKb: 1500,
}

const kb = (bytes) => Math.round((bytes / 1024) * 10) / 10
const failures = []

const html = readFileSync(join(DIST, 'index.html'), 'utf8')
const entryMatch = html.match(/<script[^>]+type="module"[^>]+src="[^"]*?(assets\/[^"]+\.js)"/)
if (!entryMatch) {
  console.error('Einstiegs-Skript in dist/index.html nicht gefunden.')
  process.exit(1)
}
const entry = readFileSync(join(DIST, entryMatch[1]))
const entryKb = kb(entry.length)
const entryGzipKb = kb(gzipSync(entry).length)
if (entryKb > BUDGET.entryJsKb) failures.push(`Einstiegs-JS ${entryKb} KB > ${BUDGET.entryJsKb} KB`)
if (entryGzipKb > BUDGET.entryJsGzipKb) failures.push(`Einstiegs-JS gzip ${entryGzipKb} KB > ${BUDGET.entryJsGzipKb} KB`)

const sw = readFileSync(join(DIST, 'sw.js'), 'utf8')
const urls = [...new Set([...sw.matchAll(/url:"([^"]+)"/g)].map((m) => m[1]))]
const precacheBytes = urls.reduce((sum, u) => sum + statSync(join(DIST, u)).size, 0)
if (kb(precacheBytes) > BUDGET.precacheKb) failures.push(`Precache ${kb(precacheBytes)} KB > ${BUDGET.precacheKb} KB`)
const media = urls.filter((u) => u.includes('media/'))
if (media.length) failures.push(`Grafiken im Precache: ${media.slice(0, 3).join(', ')}${media.length > 3 ? ' …' : ''}`)

console.log(`Einstiegs-JS: ${entryKb} KB (gzip ${entryGzipKb} KB) · Precache: ${urls.length} Dateien, ${kb(precacheBytes)} KB`)
if (failures.length) {
  console.error('Größenbudget überschritten:\n- ' + failures.join('\n- '))
  process.exit(1)
}
console.log('Größenbudget eingehalten.')
