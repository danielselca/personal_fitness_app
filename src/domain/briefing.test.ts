import { describe, expect, it } from 'vitest'
import { BRIEF_MAX_CHARS, buildBrief } from './briefing.ts'
import { parseProgramText } from './programJson.ts'
import { installProgram, builtinProgram } from './programs.ts'
import { createSeedData } from './seed.ts'
import type { AppData, Workout } from './types.ts'

const NOW = new Date(2026, 8, 24, 12) // Do, 24.09.2026
const seed = createSeedData('2026-09-01T00:00:00.000Z')

let n = 0
function workout(daysAgo: number, entries: [string, [number | null, number][]][], note?: string): Workout {
  n++
  const start = new Date(NOW.getTime() - daysAgo * 86_400_000 - 3_600_000)
  const fin = new Date(start.getTime() + 50 * 60_000).toISOString()
  return {
    id: `w${n}`, startedAt: start.toISOString(), finishedAt: fin, status: 'done', updatedAt: fin, note,
    entries: entries.map(([exerciseId, sets]) => ({ exerciseId, note: 'geheime Notiz', sets: sets.map(([kg, r], i) => ({ id: `${n}-${exerciseId}-${i}`, weightKg: kg, reps: r, done: true })) })),
  }
}

function withData(): AppData {
  const installed = installProgram(seed, builtinProgram('builtin-ganzkoerper')!, { goal: 'muskelaufbau', physioBlock: false }, '2026-09-01T00:00:00.000Z')
  return {
    ...installed.data,
    settings: { ...installed.data.settings, activeProgramId: installed.program.id, profile: { goal: 'muskelaufbau', experience: 'einsteiger' } },
    restrictions: [{ id: 'r', bodyParts: ['schulter'], muscles: [], note: 'Impingement links', until: '2026-10-15', createdAt: '', updatedAt: '' }],
    bodyLog: [{ id: 'b', date: '2026-09-20', weightKg: 82.4, createdAt: '', updatedAt: '' }],
    workouts: [
      workout(9, [['ex-lat-zug', [[45, 10], [45, 10], [45, 9]]], ['ex-rudern', [[40, 12]]]], 'Knie zwickt, Chef nervt'),
      workout(7, [['ex-lat-zug', [[47.5, 8], [47.5, 8], [47.5, 8]]]]),
      workout(2, [['ex-lat-zug', [[47.5, 10], [47.5, 9], [47.5, 9]]], ['ex-serratusstuetz', [[null, 60]]]]),
    ],
  }
}

describe('Brief an Claude', () => {
  it('enthält Frage, Profil, Programm mit IDs, Schonung, Kennzahlen, Übungen, Coach und Antwortformat', () => {
    const text = buildBrief(withData(), { now: NOW, question: 'Soll ich mehr Beine trainieren?' })
    expect(text).toContain('Meine Frage: Soll ich mehr Beine trainieren?')
    expect(text).toContain('- Ziel: Muskelaufbau')
    expect(text).toContain('- Erfahrung: Einsteiger')
    expect(text).toContain('## Aktives Programm: Ganzkörper A/B')
    expect(text).toContain('Ganzkörper A:')
    expect(text).toMatch(/- Lat-Zug \[ex-lat-zug\] – 3 × 8–12 Wdh\., Pause \d+ s/)
    expect(text).toContain('- Schulter · bis 15.10.2026 – Impingement links')
    expect(text).toMatch(/Trainings je Woche \(älteste zuerst\): (\d, ){7}\d; laufende Woche bisher 1/)
    expect(text).toContain('Ø harte Sätze je Muskelgruppe pro Trainingswoche: Brust 0, Rücken')
    expect(text).toMatch(/- Lat-Zug \[ex-lat-zug\]: 3× in 8 Wochen; zuletzt .*: 10, 9, 9 × 47,5 kg; bestes Gewicht 47,5 kg, 1RM ~\d/)
    expect(text).toContain('Serratusstütz (Physio) [ex-serratusstuetz]')
    expect(text).toMatch(/## Befunde des App-Coachs \(Wochencheck KW 38/)
    expect(text).toContain('"format": "fitness-app-programm/v1"')
    expect(text.length).toBeLessThanOrEqual(BRIEF_MAX_CHARS)
  })

  it('keine Trainingsnotizen; Körpergewicht nur auf Wunsch', () => {
    const d = withData()
    const without = buildBrief(d, { now: NOW })
    expect(without).not.toContain('geheime Notiz')
    expect(without).not.toContain('Chef nervt')
    expect(without).not.toContain('Körpergewicht')
    expect(without).toContain('Meine Frage: Wie kann ich mein Training verbessern?')
    expect(buildBrief(d, { now: NOW, includeBodyWeight: true })).toMatch(/- Körpergewicht: 82,4 kg \(.*20\.09\.2026\)/)
  })

  it('ohne Programm und ohne Trainings sinnvoll', () => {
    const text = buildBrief(seed, { now: NOW })
    expect(text).toContain('Kein Programm aktiv, bisher freies Training.')
    expect(text).toContain('Noch keine abgeschlossenen Trainings.')
    expect(text).toContain('- Ziel: nicht angegeben')
    expect(text).not.toContain('Befunde des App-Coachs')
  })

  it('bleibt auch bei vielen Daten unter der Grenze', () => {
    const d = withData()
    const ids = d.exercises.map((e) => e.id)
    const many = Array.from({ length: 60 }, (_, i) => workout(i, ids.slice(0, 25).map((id) => [id, [[40, 10], [40, 10], [40, 10]]] as [string, [number, number][]])))
    const text = buildBrief({ ...d, workouts: many }, { now: NOW, question: 'x'.repeat(2000) })
    expect(text.length).toBeLessThanOrEqual(BRIEF_MAX_CHARS)
    expect(text).toContain('"format": "fitness-app-programm/v1"')
  })

  it('das Beispiel im Antwortformat ist selbst importierbar', () => {
    const text = buildBrief(seed, { now: NOW })
    expect(parseProgramText(text)).toMatchObject({ ok: true, program: { name: 'Ganzkörper Herbst' } })
  })
})
