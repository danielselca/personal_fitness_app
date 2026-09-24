import { describe, expect, it } from 'vitest'
import { isBodyPart, isCategory, isEquipment, isMuscle, isPattern, LEVELS, TAGS } from '../domain/taxonomy.ts'
import { searchKeys } from '../domain/search.ts'
import { CURATED } from './curation/index.ts'
import { LIBRARY_DETAILS } from './details.generated.ts'
import FROZEN_IDS from './ids.frozen.json'
import { LIBRARY_INDEX } from './index.generated.ts'
import { splitLibrary } from './split.ts'

/** Übungen der drei Programme aus ROADMAP.md (Ganzkörper A/B, Oberkörper/Unterkörper, Push/Pull/Beine). */
const PROGRAM_IDS = [
  'beinpresse', 'brustpresse-maschine', 'latzug-breit', 'rumaenisches-kreuzheben', 'schulterpresse-maschine',
  'rudern-kabel-sitzend', 'unterarmstuetz', 'goblet-squat', 'schraegbank-kurzhantel', 'latzug-eng', 'hip-thrust',
  'seitheben-kurzhantel', 'beinbeuger-sitzend', 'face-pull', 'crunch-kabel', 'kniebeuge-langhantel',
  'hackenschmidt-kniebeuge', 'beinstrecker', 'beinbeuger-liegend', 'wadenheben-stehend', 'adduktoren-maschine',
  'abduktoren-maschine', 'dead-bug', 'schulterdruecken-kurzhantel', 'rudern-kurzhantel-einarmig',
  'bizepscurl-kurzhantel', 'trizepsdruecken-kabel', 'ausfallschritte-kurzhantel', 'wadenheben-sitzend',
  'pallof-press', 'bankdruecken-langhantel', 'butterfly-maschine', 'reverse-butterfly-maschine', 'hammercurl',
]

describe('Übungsbibliothek', () => {
  it('erzeugte Dateien sind aktuell (sonst: npm run library)', () => {
    const { index, details } = splitLibrary(CURATED)
    expect(LIBRARY_INDEX).toEqual(index)
    expect(LIBRARY_DETAILS).toEqual(details)
  })

  it('IDs sind eindeutige Slugs, eingefroren und werden nie entfernt', () => {
    const ids = LIBRARY_INDEX.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    for (const id of FROZEN_IDS as string[]) expect(ids).toContain(id)
    for (const id of ids) expect(FROZEN_IDS).toContain(id)
  })

  it('Namen sind eindeutig, auch ohne Umlaut-/Trennzeichen-Unterschiede', () => {
    const keys = LIBRARY_INDEX.map((e) => searchKeys(e.name)[0])
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('jeder Eintrag ist vollständig und nutzt gültige Werte', () => {
    for (const e of CURATED) {
      const where = `${e.id}:`
      expect(e.name.trim(), where).not.toBe('')
      expect(e.en.trim(), where).not.toBe('')
      expect(isEquipment(e.equipment), `${where} Ausrüstung`).toBe(true)
      expect(isCategory(e.category), `${where} Kategorie`).toBe(true)
      expect(isPattern(e.pattern), `${where} Muster`).toBe(true)
      expect(LEVELS).toContain(e.level)
      for (const t of e.tags ?? []) expect(TAGS).toContain(t)
      expect(e.muscles.primary.length, `${where} Hauptmuskel`).toBeGreaterThan(0)
      for (const m of [...e.muscles.primary, ...e.muscles.secondary]) expect(isMuscle(m), `${where} ${m}`).toBe(true)
      expect(e.muscles.secondary.filter((m) => e.muscles.primary.includes(m)), `${where} doppelt`).toEqual([])
      for (const b of e.loads) expect(isBodyPart(b), `${where} ${b}`).toBe(true)
      expect(e.restSec, where).toBeGreaterThanOrEqual(30)
      expect(e.restSec, where).toBeLessThanOrEqual(300)
      if (e.mode === 'hold') expect(e.holdSec, `${where} Haltedauer`).toBeGreaterThan(0)
      expect(e.cues.length, `${where} Tipps`).toBeGreaterThanOrEqual(3)
      expect(e.cues.length, `${where} Tipps`).toBeLessThanOrEqual(5)
      expect(e.mistakes.length, `${where} Fehler`).toBeGreaterThanOrEqual(2)
      for (const t of [...e.cues, ...e.mistakes]) expect(t, where).toMatch(/[.!?]$/)
    }
  })

  it('enthält alle Übungen der Programme aus der Roadmap', () => {
    const ids = new Set(LIBRARY_INDEX.map((e) => e.id))
    expect(PROGRAM_IDS.filter((id) => !ids.has(id))).toEqual([])
  })
})
