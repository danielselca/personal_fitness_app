import { describe, expect, it } from 'vitest'
import { BUILTIN_PROGRAMS } from '../programs/builtin.ts'
import { libraryEntry } from './library.ts'
import {
  builtinProgram,
  copyName,
  deleteProgram,
  duplicateProgram,
  duplicateTemplate,
  installProgram,
  nextProgramDay,
  physioEntries,
  recommendProgram,
} from './programs.ts'
import { createSeedData, SEED_TEMPLATE_ID } from './seed.ts'
import type { AppData, Program, Workout } from './types.ts'

const AT = '2026-09-24T10:00:00.000Z'
const seed = () => createSeedData('2026-09-01T00:00:00.000Z')
const gk = builtinProgram('builtin-ganzkoerper')!
const okuk = builtinProgram('builtin-ok-uk')!

function install(data: AppData, id = 'builtin-ganzkoerper', physioBlock = false) {
  return installProgram(data, builtinProgram(id)!, { goal: 'muskelaufbau', physioBlock }, AT)
}
const dayTemplate = (d: AppData, p: Program, i: number) => d.templates.find((t) => t.id === p.days[i].templateId)!
const ids = (d: AppData, p: Program, i: number) => dayTemplate(d, p, i).entries.map((e) => e.exerciseId)

function done(id: string, program: Program, dayIndex: number, finishedAt: string): Workout {
  return {
    id, startedAt: finishedAt, finishedAt, status: 'done', updatedAt: finishedAt,
    programId: program.id, programDayId: program.days[dayIndex].id, templateId: program.days[dayIndex].templateId, entries: [],
  }
}

describe('Mitgelieferte Programme', () => {
  it('verwenden nur vorhandene Bibliotheksübungen', () => {
    for (const p of BUILTIN_PROGRAMS) for (const day of p.days) for (const id of day.exercises) expect(libraryEntry(id), `${p.id}/${id}`).toBeTruthy()
  })

  it('Empfehlung nach Tagen pro Woche', () => {
    expect(recommendProgram(2).id).toBe('builtin-ganzkoerper')
    expect(recommendProgram(3).id).toBe('builtin-ganzkoerper')
    expect(recommendProgram(4).id).toBe('builtin-ok-uk')
    expect(recommendProgram(5).id).toBe('builtin-ppl')
    expect(recommendProgram(1).id).toBe('builtin-ganzkoerper')
  })
})

describe('Programm übernehmen', () => {
  it('Ganzkörper nutzt deine vorhandenen Übungen, übernimmt fehlende aus der Bibliothek', () => {
    const { data, program } = install(seed())
    expect(program).toMatchObject({ name: 'Ganzkörper A/B', goal: 'muskelaufbau', sessionsPerWeek: 3, copiedFrom: 'builtin-ganzkoerper' })
    expect(program.days.map((d) => d.name)).toEqual(['Ganzkörper A', 'Ganzkörper B'])
    const a = ids(data, program, 0)
    expect(a).toContain('ex-lat-zug')
    expect(a).toContain('ex-rudern')
    expect(a).toContain('ex-lib-beinpresse')
    const b = ids(data, program, 1)
    expect(b).toContain('ex-facepulls')
    expect(b).toContain('ex-seitheben-kurzhantel')
    expect(b).toContain('ex-schraegbank-kurzhantel')
    // Tages-Vorlagen gehören zum Programm; Original-Seed unverändert
    expect(dayTemplate(data, program, 0).programId).toBe(program.id)
    expect(data.templates.find((t) => t.id === SEED_TEMPLATE_ID)).toEqual(seed().templates[0])
    expect(data.exercises.filter((e) => e.id.startsWith('ex-lib-')).length).toBeGreaterThan(5)
  })

  it('3 Sätze mit Zielbereich je Ziel, Halteübungen ohne Bereich', () => {
    const { data, program } = install(seed())
    const lat = dayTemplate(data, program, 0).entries.find((e) => e.exerciseId === 'ex-lat-zug')!
    expect(lat).toEqual({ exerciseId: 'ex-lat-zug', sets: 3, repMin: 8, repMax: 12 })
    const plank = dayTemplate(data, program, 0).entries.find((e) => e.exerciseId === 'ex-lib-unterarmstuetz')!
    expect(plank).toEqual({ exerciseId: 'ex-lib-unterarmstuetz', sets: 3 })
    const fit = installProgram(seed(), gk, { goal: 'fitness', physioBlock: false }, AT)
    expect(dayTemplate(fit.data, fit.program, 0).entries[0]).toMatchObject({ repMin: 12, repMax: 15 })
  })

  it('gleichnamige eigene Übung wird verwendet statt doppelt angelegt', () => {
    const d = seed()
    d.exercises.push({ id: 'ex-meine-beinpresse', name: 'Beinpresse', aliases: [], archived: false, createdAt: AT, updatedAt: AT })
    const { data, program } = install(d)
    expect(ids(data, program, 0)).toContain('ex-meine-beinpresse')
    expect(data.exercises.some((e) => e.id === 'ex-lib-beinpresse')).toBe(false)
  })

  it('Oberkörper/Unterkörper: Tag 1 ist eine Kopie deiner Vorlage „Oberkörper“', () => {
    const d = seed()
    const { data, program } = install(d, 'builtin-ok-uk')
    expect(program.days).toHaveLength(4)
    const o1 = dayTemplate(data, program, 0)
    expect(o1.id).not.toBe(SEED_TEMPLATE_ID)
    expect(o1.entries).toEqual(d.templates[0].entries)
    // ohne „Oberkörper“ gelten die Ersatzübungen
    const without = install({ ...seed(), templates: [] }, 'builtin-ok-uk')
    expect(ids(without.data, without.program, 0)).toContain('ex-lat-zug')
    expect(okuk.days[0].exercises.length).toBeGreaterThan(0)
  })

  it('Physio-Block: deine Physio-Übungen vorne, ohne Doppelte', () => {
    const physio = physioEntries(seed()).map((e) => e.exerciseId)
    expect(physio).toEqual(['ex-aufdehnen-seitlich', 'ex-bein-absenken', 'ex-serratusstuetz', 'ex-stuetz-auf-step', 'ex-tiefes-v'])
    const { data, program } = install(seed(), 'builtin-ganzkoerper', true)
    expect(ids(data, program, 0).slice(0, 5)).toEqual(physio)
    const okUk = install(seed(), 'builtin-ok-uk', true)
    const o1 = ids(okUk.data, okUk.program, 0)
    expect(new Set(o1).size).toBe(o1.length)
  })
})

describe('Nächstes Training', () => {
  it('A → B → A, abgeleitet aus dem letzten Training dieses Programms', () => {
    const { program } = install(seed())
    expect(nextProgramDay(program, [])?.name).toBe('Ganzkörper A')
    const w1 = done('w1', program, 0, '2026-09-20T10:00:00Z')
    expect(nextProgramDay(program, [w1])?.name).toBe('Ganzkörper B')
    const w2 = done('w2', program, 1, '2026-09-22T10:00:00Z')
    expect(nextProgramDay(program, [w2, w1])?.name).toBe('Ganzkörper A')
    // Training eines anderen Programms oder laufendes Training zählt nicht
    expect(nextProgramDay(program, [w1, { ...w2, programId: 'anderes' }])?.name).toBe('Ganzkörper B')
    expect(nextProgramDay(program, [w1, { ...w2, status: 'active', finishedAt: undefined }])?.name).toBe('Ganzkörper B')
  })

  it('gelöschter Tag oder leeres Programm', () => {
    const { program } = install(seed())
    const w = { ...done('w1', program, 0, '2026-09-20T10:00:00Z'), programDayId: 'weg' }
    expect(nextProgramDay(program, [w])?.name).toBe('Ganzkörper A')
    expect(nextProgramDay({ ...program, days: [] }, [])).toBeNull()
  })
})

describe('Duplizieren und Löschen', () => {
  it('Programm duplizieren: neue Programm- und Vorlagen-IDs, gleiche Übungen, Original unverändert', () => {
    const first = install(seed())
    const before = structuredClone(first.data)
    const r = duplicateProgram(first.data, first.program.id, AT)!
    expect(r.program.id).not.toBe(first.program.id)
    expect(r.program.name).toBe('Ganzkörper A/B (Kopie)')
    expect(r.program.copiedFrom).toBe(first.program.id)
    r.program.days.forEach((day, i) => {
      expect(day.templateId).not.toBe(first.program.days[i].templateId)
      expect(dayTemplate(r.data, r.program, i).programId).toBe(r.program.id)
      expect(ids(r.data, r.program, i)).toEqual(ids(first.data, first.program, i))
    })
    expect(r.data.programs.find((p) => p.id === first.program.id)).toEqual(before.programs[0])
    expect(r.data.exercises).toBe(first.data.exercises)
  })

  it('Vorlage duplizieren ergibt eine eigenständige Kopie', () => {
    const d = seed()
    const r = duplicateTemplate(d, SEED_TEMPLATE_ID, AT)!
    expect(r.template).toMatchObject({ name: 'Oberkörper (Kopie)', entries: d.templates[0].entries })
    expect(r.template.programId).toBeUndefined()
    const again = duplicateTemplate(r.data, SEED_TEMPLATE_ID, AT)!
    expect(again.template.name).toBe('Oberkörper (Kopie 2)')
    expect(copyName('X', [])).toBe('X (Kopie)')
  })

  it('Programm löschen entfernt seine Tages-Vorlagen und die Aktivierung, Trainings bleiben', () => {
    const { data, program } = install(seed())
    const w = done('w1', program, 0, '2026-09-20T10:00:00Z')
    const d = deleteProgram({ ...data, workouts: [w], settings: { ...data.settings, activeProgramId: program.id } }, program.id)
    expect(d.programs).toEqual([])
    expect(d.templates.map((t) => t.id)).toEqual([SEED_TEMPLATE_ID])
    expect(d.settings.activeProgramId).toBeUndefined()
    expect(d.workouts).toEqual([w])
  })
})
