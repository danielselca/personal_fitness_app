import { describe, expect, it } from 'vitest'
import { fullAppData } from '../test/fixtures.ts'
import { applyImport, buildBackup, validateBackup } from './backup.ts'
import { migrateAppData } from './migrate.ts'
import { createSeedData } from './seed.ts'

/** JSON-Rundreise wie beim echten Speichern/Exportieren (undefined-Felder fallen weg). */
const viaJson = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T

describe('Rundreise: nichts geht verloren', () => {
  it('Laden (Migration + Normalisierung) gibt vollständige Daten unverändert zurück', () => {
    const full = fullAppData()
    expect(migrateAppData(viaJson(full))).toEqual(full)
  })

  it('Export → Prüfung → „Alles ersetzen“ ergibt dieselben Übungen, Vorlagen, Trainings, Programme, Schonungen und Einstellungen', () => {
    const full = fullAppData()
    const file = viaJson(buildBackup(full, '0.1.0'))
    const checked = validateBackup(file)
    expect(checked.ok).toBe(true)
    if (!checked.ok) return
    expect(checked.backup.exercises).toEqual(full.exercises)
    expect(checked.backup.templates).toEqual(full.templates)
    expect(checked.backup.workouts).toEqual(full.workouts)
    expect(checked.backup.programs).toEqual(full.programs)
    expect(checked.backup.restrictions).toEqual(full.restrictions)
    expect(checked.backup.settings).toEqual(full.settings)

    const local = createSeedData('2026-09-01T00:00:00.000Z')
    const { data } = applyImport(local, checked.backup, 'replace')
    expect(data.exercises).toEqual(full.exercises)
    expect(data.templates).toEqual(full.templates)
    expect(data.workouts).toEqual(full.workouts)
    expect(data.programs).toEqual(full.programs)
    expect(data.restrictions).toEqual(full.restrictions)
    expect(data.settings).toEqual(full.settings)
  })

  it('behält ausdrücklich gesetzte Kennzeichen (noWeight: false, mode: reps) beim Import', () => {
    const full = fullAppData()
    const checked = validateBackup(viaJson(buildBackup(full, '0.1.0')))
    if (!checked.ok) throw new Error('ungültig')
    const ex = checked.backup.exercises.find((e) => e.id === 'ex-voll')!
    expect(ex.noWeight).toBe(false)
    expect(ex.mode).toBe('reps')
  })

  it('ungültige Einstellungen werden durch Standardwerte ersetzt, gültige bleiben', () => {
    const full = fullAppData()
    const raw = viaJson(full) as unknown as Record<string, unknown>
    raw.settings = { ...full.settings, defaultRestSec: -5, theme: 'bunt', weightStep: 'viel' }
    const loaded = migrateAppData(raw)
    expect(loaded.settings.defaultRestSec).toBe(90)
    expect(loaded.settings.theme).toBe('system')
    expect(loaded.settings.weightStep).toBe(2.5)
    expect(loaded.settings.vibration).toBe(true)
  })

  it('unbekannte Einstellungs- und Metafelder überleben das Laden', () => {
    const raw = viaJson(fullAppData()) as unknown as Record<string, Record<string, unknown>>
    raw.settings.zukunft = 'bleibt'
    raw.meta.zukunft = 7
    const loaded = migrateAppData(raw) as unknown as Record<string, Record<string, unknown>>
    expect(loaded.settings.zukunft).toBe('bleibt')
    expect(loaded.meta.zukunft).toBe(7)
  })
})
