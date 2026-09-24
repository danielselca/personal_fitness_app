import { describe, expect, it } from 'vitest'
import { mediaFor, preloadMedia } from '../domain/media.ts'
import { mediaFileName, mediaFrameCount } from '../domain/media-sources.ts'
import { createSeedData } from '../domain/seed.ts'
import { LIBRARY_INDEX } from './index.generated.ts'

// Dateien aus public/ über Vite einlesen (Test läuft ohne Node-Typen)
const files = import.meta.glob('/public/media/v1/**/*.{svg,json,txt}', { query: '?raw', import: 'default', eager: true }) as Record<string, string>
const read = (rel: string) => files[`/public/media/v1/${rel}`]
const attribution = JSON.parse(read('ATTRIBUTION.json')) as Record<string, { file: string; license: string; source: string; creator: string }[]>

describe('Bewegungsgrafiken', () => {
  it('jede Übung mit Grafik hat alle Phasen, klein und mit Lizenzangabe (sonst: npm run media)', () => {
    for (const e of LIBRARY_INDEX.filter((x) => x.media)) {
      const n = mediaFrameCount(e.media!.source)
      expect(attribution[e.id], e.id).toHaveLength(n)
      for (let i = 1; i <= n; i++) {
        const svg = read(`ex/${mediaFileName(e.id, i)}`)
        expect(svg, `${e.id}-${i}`).toBeTruthy()
        expect(svg.length).toBeLessThan(40_000)
        expect(svg).toMatch(/^<svg[^>]*viewBox=/)
      }
      for (const a of attribution[e.id]) {
        expect(a.license).toBe('CC BY-SA 4.0')
        expect(a.source).toMatch(/^https:\/\/github\.com\//)
        expect(a.creator).toBeTruthy()
      }
    }
    expect(read('LICENSE-ASSETS.txt')).toContain('CC BY-SA 4.0')
  })

  it('URLs mit Basis-Pfad; Vorladen nur für verknüpfte, aktive Übungen', async () => {
    const m = mediaFor(LIBRARY_INDEX.find((e) => e.id === 'face-pull'))!
    expect(m.frames).toEqual([1, 2, 3].map((i) => `${import.meta.env.BASE_URL}media/v1/ex/face-pull-${i}.svg`))
    expect(m.credit).toContain('CC BY-SA 4.0')
    expect(mediaFor(undefined)).toBeNull()

    const data = createSeedData('2026-09-01T00:00:00.000Z')
    const seen: string[] = []
    const n = await preloadMedia(data.exercises, async (u) => void seen.push(u))
    expect(n).toBe(7 * 3) // 7 verknüpfte Seed-Übungen
    expect(seen.every((u) => u.includes('/media/v1/ex/'))).toBe(true)
    const archived = data.exercises.map((e) => (e.id === 'ex-lat-zug' ? { ...e, archived: true } : e))
    expect(await preloadMedia(archived, async () => undefined)).toBe(6 * 3)
  })
})
