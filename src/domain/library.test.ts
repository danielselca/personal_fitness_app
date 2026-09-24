import { describe, expect, it } from 'vitest'
import { alternativesFor, exerciseMeta, loadLibraryDetails, matchesFilter, searchLibrary } from './library.ts'
import { createSeedData } from './seed.ts'

const data = createSeedData('2026-09-01T00:00:00.000Z')
const ex = (id: string) => data.exercises.find((e) => e.id === id)!
const ids = (list: { id: string }[]) => list.map((e) => e.id)

describe('Bibliothek im Datenmodell', () => {
  it('exerciseMeta: Werte des Bibliothekseintrags, eigene Felder haben Vorrang', () => {
    const lat = exerciseMeta(ex('ex-lat-zug'))
    expect(lat.equipment).toBe('seilzug')
    expect(lat.muscles.primary).toEqual(['lat'])
    expect(lat.library?.name).toBe('Latzug breit')
    const own = exerciseMeta({ ...ex('ex-lat-zug'), equipment: 'maschine' })
    expect(own.equipment).toBe('maschine')
    expect(exerciseMeta(ex('ex-serratusstuetz'))).toMatchObject({ category: 'physio', equipment: 'koerpergewicht' })
    expect(exerciseMeta(ex('ex-adduktion'))).toMatchObject({ equipment: undefined, muscles: { primary: [], secondary: [] } })
  })

  it('Filter: Ausrüstungsgruppe, Calisthenics, Region, Physio, ohne Zuordnung', () => {
    expect(matchesFilter(exerciseMeta(ex('ex-schraegbank-kurzhantel')), { equipment: 'freihantel' })).toBe(true)
    expect(matchesFilter(exerciseMeta(ex('ex-lat-zug')), { equipment: 'freihantel' })).toBe(false)
    expect(matchesFilter(exerciseMeta(ex('ex-lat-zug')), { region: 'ruecken' })).toBe(true)
    expect(matchesFilter(exerciseMeta(ex('ex-kopfheben')), { region: 'physio' })).toBe(true)
    expect(matchesFilter(exerciseMeta(ex('ex-adduktion')), { region: 'ohne' })).toBe(true)
    expect(matchesFilter(exerciseMeta(ex('ex-lat-zug')), { region: 'ohne' })).toBe(false)
    expect(ids(searchLibrary('', { equipment: 'calisthenics' }))).toContain('klimmzug')
  })

  it('Suche findet deutsche, englische und alternative Namen', () => {
    expect(ids(searchLibrary('leg press'))).toEqual(['beinpresse', 'wadenheben-beinpresse'])
    expect(ids(searchLibrary('pec deck'))).toContain('butterfly-maschine')
    expect(ids(searchLibrary('kniebeuge', { equipment: 'maschine' }))).toEqual(['hackenschmidt-kniebeuge', 'kniebeuge-multipresse'])
  })

  it('Alternativen: gleiches Muster, ohne geschonte Bereiche', () => {
    const alt = ids(alternativesFor('latzug-breit'))
    expect(alt[0]).toBe('klimmzug') // gleicher Hauptmuskel Lat, alphabetisch nach Muskel-Übereinstimmung
    expect(alt).not.toContain('latzug-breit')
    expect(ids(alternativesFor('beinpresse', ['knie']))).toEqual([])
  })

  it('Details werden nachgeladen', async () => {
    const d = await loadLibraryDetails('face-pull')
    expect(d?.cues.length).toBeGreaterThanOrEqual(3)
  })
})
