import { describe, expect, it } from 'vitest'
import { EQUIPMENT, EQUIPMENT_GROUPS, MUSCLES, equipmentGroupOf, regionsOf } from './taxonomy.ts'

describe('Taxonomie', () => {
  it('jede Ausrüstung gehört genau einer Filtergruppe an; Freihantel umfasst Lang-/Kurzhantel und SZ', () => {
    for (const e of EQUIPMENT) {
      expect(EQUIPMENT_GROUPS.filter((g) => (g.equipment as readonly string[]).includes(e))).toHaveLength(1)
    }
    expect(equipmentGroupOf('sz-stange')).toBe('freihantel')
    expect(equipmentGroupOf('klimmzugstange')).toBe('koerpergewicht')
  })

  it('22 Muskeln mit Regionen', () => {
    expect(MUSCLES).toHaveLength(22)
    expect(regionsOf(['lat', 'bizeps', 'oberer-ruecken'])).toEqual(['ruecken', 'arme'])
  })
})
