import { describe, expect, it } from 'vitest'
import { advanceHold, holdSegments, pauseHold, resumeHold, startHold } from './hold.ts'
import type { WorkoutEntry } from './types.ts'

const t0 = Date.parse('2026-09-13T10:00:00Z')
const iso = (ms: number) => new Date(ms).toISOString()
const entry = (): WorkoutEntry => ({
  exerciseId: 'ex-serratusstuetz',
  sets: [1, 2, 3].map((i) => ({ id: `s${i}`, weightKg: null, reps: 60, done: false })),
})

describe('Halteablauf', () => {
  it('startet beim ersten offenen Satz mit Endzeitpunkt', () => {
    const e = startHold(entry(), 60, t0)
    expect(e.hold).toEqual({ setIndex: 0, phase: 'work', durationSec: 60, endsAt: iso(t0 + 60_000) })
  })

  it('Arbeit → Satz abgehakt (Sekunden als reps) → Pause; Pause → nächster Satz; letzter Satz ohne Pause', () => {
    let e = startHold(entry(), 60, t0)
    let r = advanceHold(e, 60, 45, t0 + 60_000, iso(t0 + 60_000))
    expect(r.events).toBe(1)
    expect(r.entry.sets[0]).toMatchObject({ done: true, reps: 60 })
    expect(r.entry.hold).toMatchObject({ setIndex: 0, phase: 'rest', durationSec: 45, endsAt: iso(t0 + 105_000) })
    r = advanceHold(r.entry, 60, 45, t0 + 105_000, iso(t0))
    expect(r.entry.hold).toMatchObject({ setIndex: 1, phase: 'work', endsAt: iso(t0 + 165_000) })
    // Nach langer Abwesenheit: alles Übrige läuft durch, Ende ohne Pause
    r = advanceHold(r.entry, 60, 45, t0 + 60 * 60_000, iso(t0))
    expect(r.finished).toBe(true)
    expect(r.entry.hold).toBeUndefined()
    expect(r.entry.sets.every((s) => s.done)).toBe(true)
    expect(r.events).toBe(3) // Arbeit 2, Pause 2, Arbeit 3
  })

  it('force schließt genau eine Phase ab, nicht mehr', () => {
    const e = startHold(entry(), 60, t0)
    const r = advanceHold(e, 60, 60, t0 + 1000, iso(t0), true)
    expect(r.events).toBe(1)
    expect(r.entry.hold?.phase).toBe('rest')
    expect(r.entry.hold?.endsAt).toBe(iso(t0 + 1000 + 60_000))
  })
  it('pausieren friert die Restzeit ein, weiter setzt neuen Endzeitpunkt; pausiert läuft nichts ab', () => {
    let x = startHold(entry(), 60, t0)
    x = pauseHold(x, t0 + 20_000)
    expect(x.hold).toMatchObject({ pausedRemainingSec: 40, endsAt: undefined })
    expect(advanceHold(x, 60, 60, t0 + 999_000, iso(t0)).events).toBe(0)
    x = resumeHold(x, t0 + 100_000)
    expect(x.hold?.endsAt).toBe(iso(t0 + 140_000))
  })

  it('Segmente: Arbeit/Pause im Wechsel, Zustände und Fortschritt', () => {
    let x = startHold(entry(), 60, t0)
    let segs = holdSegments(x, 60, 30, t0 + 15_000)
    expect(segs.map((s) => s.kind)).toEqual(['work', 'rest', 'work', 'rest', 'work'])
    expect(segs[0]).toMatchObject({ state: 'current' })
    expect(segs[0].progress).toBeCloseTo(0.25, 2)
    x = advanceHold(x, 60, 30, t0 + 60_000, iso(t0)).entry
    segs = holdSegments(x, 60, 30, t0 + 75_000)
    expect(segs[0].state).toBe('done')
    expect(segs[1]).toMatchObject({ kind: 'rest', state: 'current' })
    expect(segs[1].progress).toBeCloseTo(0.5, 2)
    expect(segs[2].state).toBe('pending')
  })
})
