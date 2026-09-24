import { describe, expect, it } from 'vitest'
import { activeRestrictions, dayKey, exerciseHits, isActive, restrictionLabel, templateHitCount } from './restrictions.ts'
import { createSeedData } from './seed.ts'
import { swapCandidates } from './swap.ts'
import type { Restriction } from './types.ts'

const AT = '2026-09-24T10:00:00.000Z'
const data = createSeedData('2026-09-01T00:00:00.000Z')
const ex = (id: string) => data.exercises.find((e) => e.id === id)!
const rs = (p: Partial<Restriction>): Restriction => ({ id: 'rs', bodyParts: [], muscles: [], createdAt: AT, updatedAt: AT, ...p })

describe('Körperbereiche schonen', () => {
  it('aktiv bis einschließlich Enddatum, ohne Datum unbefristet', () => {
    expect(dayKey(new Date(2026, 8, 5))).toBe('2026-09-05')
    expect(isActive(rs({}), '2026-09-24')).toBe(true)
    expect(isActive(rs({ until: '2026-09-24' }), '2026-09-24')).toBe(true)
    expect(isActive(rs({ until: '2026-09-23' }), '2026-09-24')).toBe(false)
    expect(activeRestrictions([rs({ id: 'a', until: '2026-01-01' }), rs({ id: 'b' })], '2026-09-24').map((r) => r.id)).toEqual(['b'])
  })

  it('Treffer über belastete Bereiche (Bibliothek) und Hauptmuskeln; eigene Angaben haben Vorrang', () => {
    const schulter = [rs({ bodyParts: ['schulter'] })]
    expect(exerciseHits(ex('ex-lat-zug'), schulter)).toEqual(['Schulter'])
    expect(exerciseHits(ex('ex-adduktion'), schulter)).toEqual([]) // unzugeordnet
    expect(exerciseHits({ ...ex('ex-adduktion'), loads: ['schulter'] }, schulter)).toEqual(['Schulter'])
    expect(exerciseHits({ ...ex('ex-lat-zug'), loads: ['ellbogen'] }, schulter)).toEqual([])
    expect(exerciseHits(ex('ex-lat-zug'), [rs({ muscles: ['lat'] })])).toEqual(['Latissimus'])
    expect(exerciseHits(ex('ex-lat-zug'), [])).toEqual([])
  })

  it('zählt betroffene Übungen einer Vorlage und beschriftet Einträge', () => {
    const n = templateHitCount(data.templates[0], data.exercises, [rs({ bodyParts: ['schulter'] })])
    expect(n).toBe(4) // Lat-Zug, Butterfly, Reverse Butterfly, Schrägbank
    expect(restrictionLabel(rs({ bodyParts: ['schulter'], muscles: ['brust'], until: '2026-10-15' }))).toBe('Schulter, Brust · bis 15.10.2026')
  })
})

describe('Übung tauschen: Vorschläge', () => {
  it('gleiches Muster: deine Übungen zuerst, dann Bibliothek ohne Doppelte', () => {
    const c = swapCandidates(data.exercises, 'ex-lat-zug', [])
    const lib = c.library.map((l) => l.id)
    expect(lib).toContain('klimmzug')
    expect(lib).toContain('latzug-eng')
    expect(lib).not.toContain('latzug-breit') // ist dein Lat-Zug
    expect(c.own.map((e) => e.id)).not.toContain('ex-lat-zug')
  })

  it('ohne Übungen, die geschonte Bereiche belasten; ohne ausgeschlossene', () => {
    const c = swapCandidates(data.exercises, 'ex-rudern', [rs({ bodyParts: ['unterer-ruecken'] })])
    for (const l of c.library) expect(l.loads).not.toContain('unterer-ruecken')
    const without = swapCandidates(data.exercises, 'ex-reverse-butterfly', [], ['ex-facepulls'])
    expect(without.own.map((e) => e.id)).not.toContain('ex-facepulls')
    const withF = swapCandidates(data.exercises, 'ex-reverse-butterfly', [])
    expect(withF.own.map((e) => e.id)).toContain('ex-facepulls')
  })

  it('geschonte Schulter: statt Reverse Butterfly Übungen für dieselben Hauptmuskeln ohne Schulterbelastung', () => {
    const c = swapCandidates(data.exercises, 'ex-reverse-butterfly', [rs({ bodyParts: ['schulter'] })])
    expect(c.own.map((e) => e.id)).toContain('ex-rudern')
    expect([...c.own, ...c.library].length).toBeGreaterThan(0)
    for (const l of c.library) expect(l.loads).not.toContain('schulter')
    // ohne Schonung steht das gleiche Muster vorn
    expect(swapCandidates(data.exercises, 'ex-reverse-butterfly', []).own[0].id).toBe('ex-facepulls')
  })

  it('unzugeordnete Übung: keine Vorschläge (Suche bleibt)', () => {
    expect(swapCandidates(data.exercises, 'ex-adduktion', [])).toEqual({ own: [], library: [] })
  })
})
