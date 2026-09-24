import { describe, expect, it } from 'vitest'
import { matchesQuery, matchesText, searchKeys } from './search.ts'
import { createSeedData } from './seed.ts'

const data = createSeedData('2026-09-01T00:00:00.000Z')
const find = (q: string) => data.exercises.filter((e) => matchesQuery(e, q)).map((e) => e.name).sort()

describe('Suche ohne Umlaut-, Akzent- und Trennzeichen-Unterschiede', () => {
  it('Umlaute in beiden Schreibweisen', () => {
    expect(find('uberzuge')).toEqual(['Überzüge'])
    expect(find('ueberzuege')).toEqual(['Überzüge'])
    expect(find('ÜBERZÜGE')).toEqual(['Überzüge'])
    expect(searchKeys('Stütz auf Step')).toEqual(['stutzaufstep', 'stuetzaufstep'])
  })

  it('Trennzeichen und Leerzeichen sind egal', () => {
    expect(find('latzug')).toEqual(['Lat-Zug'])
    expect(find('lat zug')).toEqual(['Lat-Zug'])
    expect(find('Lat-Zug')).toEqual(['Lat-Zug'])
  })

  it('mehrere Wörter müssen alle vorkommen, Reihenfolge egal', () => {
    expect(find('kurzhantel schräg')).toEqual(['Schrägbank Kurzhantel'])
    expect(find('kurzhantel schrag')).toEqual(['Schrägbank Kurzhantel'])
    expect(find('kurzhantel rudern')).toEqual([])
  })

  it('ß und Akzente', () => {
    expect(matchesText(['Fußheben'], 'fussheben')).toBe(true)
    expect(matchesText(['Crêpe-Curl'], 'crepecurl')).toBe(true)
  })

  it('Gerätenummer wie bisher: „28“ und „#28“', () => {
    expect(find('28')).toEqual(['Lat-Zug'])
    expect(find('#28')).toEqual(['Lat-Zug'])
  })

  it('leerer Suchbegriff findet alles', () => {
    expect(find('  ')).toHaveLength(data.exercises.length)
  })
})
