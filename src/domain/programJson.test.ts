import { describe, expect, it } from 'vitest'
import { importProgram, matchExercise, parseProgramText, PROGRAM_FORMAT, uniqueProgramName, type ImportProgram } from './programJson.ts'
import { createSeedData } from './seed.ts'

const AT = '2026-09-24T12:00:00.000Z'
const data = createSeedData('2026-09-01T00:00:00.000Z')

const program = {
  format: PROGRAM_FORMAT,
  name: 'Ganzkörper Herbst',
  sessionsPerWeek: 3,
  goal: 'muskelaufbau',
  days: [
    {
      name: 'A',
      exercises: [
        { id: 'ex-lat-zug', name: 'Lat-Zug', sets: 3, reps: [8, 12], restSec: 90, note: 'Schultern tief' },
        { library: 'beinpresse', name: 'Beinpresse', sets: 3, reps: [8, 12] },
        { name: 'Plank', sets: 3, holdSec: 45 },
      ],
    },
    { name: 'B', exercises: [{ name: 'Facepulls', sets: 2, reps: '12–15' }, { name: 'Wandsitzen mit Ball', sets: 2, reps: 20 }] },
  ],
}

describe('JSON-Block finden', () => {
  it('in der ganzen Antwort von Claude, mit ```json-Block; der letzte gewinnt', () => {
    const text = `Hier mein Vorschlag … {nicht json}\n\`\`\`json\n${JSON.stringify({ ...program, name: 'Alt' })}\n\`\`\`\nUnd überarbeitet:\n\`\`\`json\n${JSON.stringify(program, null, 2)}\n\`\`\`\nViel Erfolg!`
    const r = parseProgramText(text)
    expect(r.ok && r.program.name).toBe('Ganzkörper Herbst')
  })

  it('auch ohne Code-Block und mit typografischen Anführungszeichen', () => {
    const typo = JSON.stringify(program).replace(/"/g, '“').replace(/“(?=[,:}\]])/g, '”')
    expect(parseProgramText(`Vorschlag: ${typo} Ende`).ok).toBe(true)
  })

  it('verständliche Meldung ohne Programm oder bei kaputtem JSON', () => {
    expect(parseProgramText('Mach mehr Beine.')).toEqual({ ok: false, errors: [expect.stringContaining('Kein Programm gefunden')] })
    const cut = JSON.stringify(program).slice(0, 120)
    expect(parseProgramText(cut)).toEqual({ ok: false, errors: [expect.stringContaining('kein gültiges JSON')] })
  })
})

describe('Prüfen', () => {
  it('übersetzt Wdh. als Bereich, Zahl oder Text, Halten, Pause, Notiz', () => {
    const r = parseProgramText(JSON.stringify(program))
    if (!r.ok) throw new Error(r.errors.join())
    const [a, b] = r.program.days
    expect(a.exercises[0]).toEqual({ id: 'ex-lat-zug', name: 'Lat-Zug', sets: 3, repMin: 8, repMax: 12, restSec: 90, note: 'Schultern tief' })
    expect(a.exercises[2]).toMatchObject({ name: 'Plank', holdSec: 45 })
    expect(b.exercises[0]).toMatchObject({ repMin: 12, repMax: 15 })
    expect(b.exercises[1]).toMatchObject({ repMin: 20, repMax: 20 })
  })

  it('Fehler mit Tag und Übung; Grenzen', () => {
    const bad = {
      format: PROGRAM_FORMAT,
      name: '',
      days: [{ name: 'A', exercises: [{ sets: 3 }, { name: 'Kniebeuge', sets: 12, reps: [12, 8] }, { name: 'Pause', restSec: 900 }] }],
    }
    const r = parseProgramText(JSON.stringify(bad))
    expect(r.ok).toBe(false)
    expect(!r.ok && r.errors).toEqual([
      'Programmname fehlt oder ist zu lang (höchstens 60 Zeichen).',
      'Tag 1 („A“), Übung 1: Name fehlt.',
      'Tag 1 („A“), Übung 2 (Kniebeuge): Sätze müssen 1–10 sein.',
      'Tag 1 („A“), Übung 2 (Kniebeuge): Wdh. als Zahl oder [von, bis] zwischen 1 und 50 angeben.',
      'Tag 1 („A“), Übung 3 (Pause): Pause 0–600 s.',
    ])
    expect(parseProgramText(JSON.stringify({ format: PROGRAM_FORMAT, name: 'X', days: [] }))).toMatchObject({ ok: false, errors: ['Ein Programm braucht 1 bis 7 Tage.'] })
  })
})

describe('Übungen zuordnen', () => {
  const ex = data.exercises
  it('ID → Bibliothek (verknüpft = deine) → Name/Alias → Bibliothek per Name/Englisch → neu', () => {
    expect(matchExercise(ex, { id: 'ex-rudern', name: 'egal', sets: 3 })).toMatchObject({ kind: 'eigene', exerciseId: 'ex-rudern' })
    expect(matchExercise(ex, { library: 'latzug-breit', name: 'Latzug', sets: 3 })).toMatchObject({ kind: 'eigene', exerciseId: 'ex-lat-zug' })
    expect(matchExercise(ex, { library: 'beinpresse', name: 'x', sets: 3 })).toEqual({ kind: 'bibliothek', libraryId: 'beinpresse', name: 'Beinpresse' })
    expect(matchExercise(ex, { name: 'latzug', sets: 3 })).toMatchObject({ kind: 'eigene', exerciseId: 'ex-lat-zug' })
    expect(matchExercise(ex, { name: 'Ruderzug am Kabel', sets: 3 })).toMatchObject({ kind: 'eigene', exerciseId: 'ex-rudern' }) // Alias
    expect(matchExercise(ex, { name: 'Leg Press', sets: 3 })).toMatchObject({ kind: 'bibliothek', libraryId: 'beinpresse' })
    expect(matchExercise(ex, { name: 'Unterarmstuetz', sets: 3 })).toMatchObject({ kind: 'bibliothek', libraryId: 'unterarmstuetz' })
    expect(matchExercise(ex, { name: 'Wandsitzen mit Ball', sets: 3 })).toEqual({ kind: 'neu', name: 'Wandsitzen mit Ball' })
  })
})

describe('Übernehmen', () => {
  const parsed = parseProgramText(JSON.stringify(program))
  const def = (parsed as { program: ImportProgram }).program

  it('legt Programm, Tages-Vorlagen und fehlende Übungen an; vorhandene Übungen bleiben (Verlauf läuft weiter)', () => {
    const r = importProgram(data, def, AT)
    expect(r.program).toMatchObject({ name: 'Ganzkörper Herbst', goal: 'muskelaufbau', sessionsPerWeek: 3, copiedFrom: 'claude' })
    expect(r.program.days.map((d) => d.name)).toEqual(['A', 'B'])
    const tplA = r.data.templates.find((t) => t.id === r.program.days[0].templateId)!
    expect(tplA.programId).toBe(r.program.id)
    expect(tplA.entries[0]).toEqual({ exerciseId: 'ex-lat-zug', sets: 3, repMin: 8, repMax: 12, restSec: 90, note: 'Schultern tief' })
    expect(tplA.entries[1].exerciseId).toBe('ex-lib-beinpresse')
    const plank = r.data.exercises.find((e) => e.id === tplA.entries[2].exerciseId)!
    expect(plank).toMatchObject({ libraryId: 'unterarmstuetz', mode: 'hold', holdSec: 45 })
    expect(tplA.entries[2].repMin).toBeUndefined() // Halteübung ohne Wdh.-Bereich
    const tplB = r.data.templates.find((t) => t.id === r.program.days[1].templateId)!
    expect(tplB.entries[0].exerciseId).toBe('ex-facepulls')
    const created = r.data.exercises.find((e) => e.id === tplB.entries[1].exerciseId)!
    expect(created).toMatchObject({ name: 'Wandsitzen mit Ball', archived: false })
    expect(created.libraryId).toBeUndefined()
    expect(r.data.exercises).toHaveLength(data.exercises.length + 3)
  })

  it('Name bleibt eindeutig; Ziel aus dem Profil, wenn das JSON keins nennt', () => {
    const first = importProgram(data, def, AT)
    const second = importProgram(first.data, { ...def, goal: undefined }, AT)
    expect(second.program.name).toBe('Ganzkörper Herbst (2)')
    expect(second.program.goal).toBe('muskelaufbau')
    expect(uniqueProgramName('P', ['P', 'P (2)'])).toBe('P (3)')
    const fit = importProgram({ ...data, settings: { ...data.settings, profile: { goal: 'fitness', experience: 'einsteiger' } } }, { ...def, goal: undefined }, AT)
    expect(fit.program.goal).toBe('fitness')
  })
})
