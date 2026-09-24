// Lädt die Bewegungsgrafiken der Bibliothek vom festen Quell-Stand, verkleinert sie mit SVGO und
// schreibt sie nach public/media/v1/ex/<bibliotheks-id>-<n>.svg, dazu ATTRIBUTION.json und die
// Lizenzdatei. Aufruf: npm run media (braucht Netz; das Ergebnis wird eingecheckt).
import { mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { optimize } from 'svgo'
import { CURATED } from '../../src/library/curation/index.ts'
import { MEDIA_SOURCES, mediaFrameCount, mediaFileName } from '../../src/domain/media-sources.ts'

const OUT = join(import.meta.dirname, '../../public/media/v1')
const EX = join(OUT, 'ex')
const WG = `https://raw.githubusercontent.com/bryllim/workout-guide/${MEDIA_SOURCES['workout-guide'].commit}/packages/workout-guide`
const EK = `https://raw.githubusercontent.com/everkinetic/data/${MEDIA_SOURCES.everkinetic.commit}/dist`

interface FrameAttribution {
  file: string
  creator: string
  license: 'CC BY-SA 4.0'
  source: string
  basedOn?: string
  changes: string
}

async function get(url: string): Promise<string> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(url)
    if (res.ok) return res.text()
    if (attempt >= 3) throw new Error(`${res.status} ${url}`)
    await new Promise((r) => setTimeout(r, 1000 * attempt))
  }
}

/** Koordinaten auf ganze Pixel (512er-Raster, angezeigt ≤ 320 px), sonst unverändert (weiße Figur auf transparent). */
function shrink(svg: string): string {
  return optimize(svg, {
    multipass: true,
    floatPrecision: 0,
    plugins: ['preset-default'],
  }).data
}

/** Everkinetic: weißen Hintergrund und Füllflächen entfernen, dunkle Linien werden weiß. */
function everkineticToMono(svg: string): string {
  return svg.replace(/<g fill="#FFF">[\s\S]*?<\/g>/, '').replace(/fill="#333"/g, 'fill="#fff"')
}

const wgManifest = JSON.parse(await get(`${WG}/manifest.json`)) as {
  slug: string
  frames: { index: number; path: string; attribution: { creator: string; source?: { name: string; url: string; changes?: string } } }[]
}[]
const ekExercises = JSON.parse(await get(`${EK}/exercises.json`)) as { name: string; svg: string[] }[]

rmSync(EX, { recursive: true, force: true })
mkdirSync(EX, { recursive: true })
const attribution: Record<string, FrameAttribution[]> = {}
let bytesIn = 0
let bytesOut = 0

for (const entry of CURATED) {
  if (!entry.media) continue
  const { source, ref } = entry.media
  const frames: FrameAttribution[] = []
  if (source === 'workout-guide') {
    const item = wgManifest.find((m) => m.slug === ref)
    if (!item) throw new Error(`workout-guide: „${ref}“ fehlt (${entry.id})`)
    for (const f of item.frames) {
      const raw = await get(`${WG}/${f.path}`)
      const out = shrink(raw)
      const file = mediaFileName(entry.id, f.index)
      writeFileSync(join(EX, file), out)
      bytesIn += raw.length
      bytesOut += out.length
      frames.push({
        file: `ex/${file}`,
        creator: f.attribution.creator,
        license: 'CC BY-SA 4.0',
        source: `https://github.com/bryllim/workout-guide/blob/${MEDIA_SOURCES['workout-guide'].commit}/packages/workout-guide/${f.path}`,
        ...(f.attribution.source ? { basedOn: `${f.attribution.source.name}: ${f.attribution.source.url}` } : {}),
        changes: 'Koordinaten auf ganze Pixel gerundet, Datei verkleinert (SVGO).',
      })
    }
  } else {
    const item = ekExercises.find((e) => e.name === ref)
    if (!item) throw new Error(`Everkinetic: „${ref}“ fehlt (${entry.id})`)
    for (const [i, path] of item.svg.entries()) {
      const raw = await get(`${EK}/${path}`)
      const out = shrink(everkineticToMono(raw))
      const file = mediaFileName(entry.id, i + 1)
      writeFileSync(join(EX, file), out)
      bytesIn += raw.length
      bytesOut += out.length
      frames.push({
        file: `ex/${file}`,
        creator: 'Everkinetic',
        license: 'CC BY-SA 4.0',
        source: `https://github.com/everkinetic/data/blob/${MEDIA_SOURCES.everkinetic.commit}/dist/${path}`,
        changes: 'Hintergrund und Füllflächen entfernt, Linien einfarbig, Koordinaten gerundet (SVGO).',
      })
    }
  }
  if (frames.length !== mediaFrameCount(source)) throw new Error(`${entry.id}: ${frames.length} statt ${mediaFrameCount(source)} Phasen`)
  attribution[entry.id] = frames
}

writeFileSync(join(OUT, 'ATTRIBUTION.json'), JSON.stringify(attribution, null, 2) + '\n')
writeFileSync(
  join(OUT, 'LICENSE-ASSETS.txt'),
  `Bewegungsgrafiken in diesem Ordner

Lizenz: Creative Commons Namensnennung – Weitergabe unter gleichen Bedingungen 4.0 International
(CC BY-SA 4.0), https://creativecommons.org/licenses/by-sa/4.0/deed.de

Quellen:
- Workout Guide von Bryl Lim, https://github.com/bryllim/workout-guide
  (Stand ${MEDIA_SOURCES['workout-guide'].commit}), CC BY-SA 4.0; teils nach Everkinetic.
- Everkinetic, https://github.com/everkinetic/data (Stand ${MEDIA_SOURCES.everkinetic.commit}), CC BY-SA 4.0.

Änderungen: Koordinaten gerundet und Dateien verkleinert; bei Everkinetic Hintergrund und
Füllflächen entfernt und Linien einfarbig. Die veränderten Grafiken stehen ebenfalls unter
CC BY-SA 4.0. Urheber, Quelle und Änderungen je Datei: ATTRIBUTION.json.
`,
)
const files = readdirSync(EX).length
console.log(`Grafiken: ${Object.keys(attribution).length} Übungen, ${files} Dateien, ${Math.round(bytesIn / 1024)} KB → ${Math.round(bytesOut / 1024)} KB`)
