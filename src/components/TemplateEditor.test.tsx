// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createSeedData } from '../domain/seed.ts'
import { appStore } from '../store/appStore.ts'
import { TrainingScreen } from '../screens/TrainingScreen.tsx'

beforeEach(() => appStore.setState({ data: createSeedData('2026-09-01T00:00:00.000Z'), hydrated: true, loadError: null }))
afterEach(cleanup)

describe('Vorlagen (F14, AK24)', () => {
  it('umbenennen, umsortieren, Satzanzahl ändern, Übung entfernen', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Oberkörper bearbeiten' }))
    const sheet = screen.getByRole('dialog', { name: 'Vorlage bearbeiten' })
    fireEvent.change(within(sheet).getByLabelText('Vorlagenname'), { target: { value: 'Schulter A' } })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Bein absenken (unterer Bauch) nach oben' }))
    fireEvent.change(within(sheet).getByLabelText('Sätze für Lat-Zug'), { target: { value: '5' } })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Adduktion entfernen' }))
    fireEvent.click(within(sheet).getByRole('button', { name: 'Speichern' }))
    const t = appStore.getState().data.templates[0]
    expect(t.name).toBe('Schulter A')
    expect(t.entries).toHaveLength(11)
    expect(t.entries[0].exerciseId).toBe('ex-bein-absenken')
    expect(t.entries[1].exerciseId).toBe('ex-aufdehnen-seitlich')
    expect(t.entries[10]).toEqual({ exerciseId: 'ex-lat-zug', sets: 5 })
    // Start aus geänderter Vorlage übernimmt Satzanzahl
    fireEvent.click(screen.getByRole('button', { name: 'Vorlage Schulter A starten' }))
    const active = appStore.getState().activeWorkout()!
    expect(active.entries[10].sets).toHaveLength(5)
  })

  it('löschen mit Bestätigung', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Oberkörper bearbeiten' }))
    fireEvent.click(screen.getByRole('button', { name: 'Vorlage löschen' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Löschen' }))
    expect(appStore.getState().data.templates).toHaveLength(0)
    expect(screen.queryByText('Vorlagen')).toBeNull()
  })

  it('nach Abschluss als Vorlage speichern', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Vorlage Oberkörper starten' }))
    const lat = screen.getByRole('region', { name: 'Lat-Zug' })
    fireEvent.click(within(lat).getByRole('button', { expanded: false })) // letzte Übung, eingeklappt
    fireEvent.click(within(lat).getByRole('button', { name: 'Satz 1 abhaken' }))
    fireEvent.click(screen.getByRole('button', { name: 'Abschließen' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Training abschließen' })).getByRole('button', { name: 'Abschließen' }))
    fireEvent.click(screen.getByRole('button', { name: 'Als Vorlage speichern' }))
    const sheet = screen.getByRole('dialog', { name: 'Als Vorlage speichern' })
    expect((within(sheet).getByLabelText('Vorlagenname') as HTMLInputElement).value).toBe('Oberkörper')
    fireEvent.change(within(sheet).getByLabelText('Vorlagenname'), { target: { value: 'Nur Lat' } })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Speichern' }))
    const t = appStore.getState().data.templates.find((x) => x.name === 'Nur Lat')!
    expect(t.entries).toEqual([{ exerciseId: 'ex-lat-zug', sets: 1 }])
  })
})

describe('Vorlagen selbst gestalten (Schritt 18)', () => {
  it('Übung hinzufügen, Wdh.-Bereich und Pause setzen, ungültige Angaben melden', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Oberkörper bearbeiten' }))
    const sheet = screen.getByRole('dialog', { name: 'Vorlage bearbeiten' })
    fireEvent.click(within(sheet).getByRole('button', { name: '+ Übung' }))
    const picker = screen.getByRole('dialog', { name: 'Übungen hinzufügen' })
    fireEvent.change(within(picker).getByLabelText('Übung suchen'), { target: { value: 'beinpresse' } })
    fireEvent.click(within(picker).getByRole('button', { name: 'Beinpresse' })) // aus der Bibliothek
    fireEvent.click(within(picker).getByRole('button', { name: '1 hinzufügen' }))
    fireEvent.change(within(sheet).getByLabelText('Wdh. von für Beinpresse'), { target: { value: '12' } })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Speichern' }))
    expect(within(sheet).getByRole('alert').textContent).toMatch(/von und bis/)
    fireEvent.change(within(sheet).getByLabelText('Wdh. bis für Beinpresse'), { target: { value: '8' } })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Speichern' }))
    expect(within(sheet).getByRole('alert').textContent).toMatch(/ungültig/)
    fireEvent.change(within(sheet).getByLabelText('Wdh. von für Beinpresse'), { target: { value: '8' } })
    fireEvent.change(within(sheet).getByLabelText('Wdh. bis für Beinpresse'), { target: { value: '12' } })
    fireEvent.change(within(sheet).getByLabelText('Pause für Beinpresse'), { target: { value: '120' } })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Speichern' }))
    const entries = appStore.getState().data.templates[0].entries
    expect(entries.at(-1)).toEqual({ exerciseId: 'ex-lib-beinpresse', sets: 3, repMin: 8, repMax: 12, restSec: 120 })
  })

  it('neue Vorlage: Abbrechen verwirft sie, Speichern legt sie an; duplizieren', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: '+ Neue Vorlage' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Neue Vorlage' })).getByRole('button', { name: 'Schließen' }))
    expect(appStore.getState().data.templates).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: '+ Neue Vorlage' }))
    const sheet = screen.getByRole('dialog', { name: 'Neue Vorlage' })
    fireEvent.change(within(sheet).getByLabelText('Vorlagenname'), { target: { value: 'Zuhause' } })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Speichern' }))
    expect(appStore.getState().data.templates.map((t) => t.name)).toEqual(['Oberkörper', 'Zuhause'])

    fireEvent.click(screen.getByRole('button', { name: 'Oberkörper bearbeiten' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Vorlage bearbeiten' })).getByRole('button', { name: 'Vorlage duplizieren' }))
    // Die Kopie ist gleich geöffnet
    expect((within(screen.getByRole('dialog', { name: 'Vorlage bearbeiten' })).getByLabelText('Vorlagenname') as HTMLInputElement).value).toBe('Oberkörper (Kopie)')
    expect(appStore.getState().data.templates).toHaveLength(3)
  })
})

describe('Programme auf der Startseite (Schritt 18)', () => {
  it('übernehmen, Nächstes starten, anderen Tag wählen; Programm-Tage nicht in den Vorlagen', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: /^Programme/ }))
    fireEvent.click(within(screen.getByRole('listitem', { name: 'Vorschlag Ganzkörper A/B' })).getByRole('button', { name: 'Übernehmen …' }))
    const sheet = screen.getByRole('dialog', { name: 'Ganzkörper A/B übernehmen' })
    expect(sheet.textContent).toContain('Lat-Zug') // deine Übung statt „Latzug breit“
    fireEvent.click(within(sheet).getByRole('radio', { name: 'Fitness & Abnehmen' }))
    fireEvent.click(within(sheet).getByRole('button', { name: 'Übernehmen und aktivieren' }))

    const hero = screen.getByRole('region', { name: 'Programm Ganzkörper A/B' })
    expect(within(hero).getByRole('button', { name: /Nächstes: Ganzkörper A/ })).toBeTruthy()
    expect(hero.textContent).toContain('0/3')
    // Tages-Vorlagen stehen nicht in der Vorlagen-Liste
    expect(screen.queryByRole('button', { name: 'Vorlage Ganzkörper A starten' })).toBeNull()

    fireEvent.click(within(hero).getByRole('button', { name: 'Anderen Tag wählen' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ganzkörper B starten' }))
    const w = appStore.getState().activeWorkout()!
    const p = appStore.getState().data.programs[0]
    expect(w.programDayId).toBe(p.days[1].id)
    expect(w.entries.find((e) => e.exerciseId === 'ex-facepulls')).toMatchObject({ repMin: 12, repMax: 15 })
    expect(within(screen.getByRole('region', { name: 'Goblet Squat' })).getByTestId('source-line').textContent).toBe('Ziel 3 × 12–15 · Keine früheren Werte')
  })

  it('eigenes Programm anlegen: Tag hinzufügen, Übungen wählen, aktivieren', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: /^Programme/ }))
    fireEvent.click(screen.getByRole('button', { name: '+ Eigenes Programm' }))
    const editor = screen.getByRole('dialog', { name: 'Programm bearbeiten' })
    fireEvent.change(within(editor).getByLabelText('Programmname'), { target: { value: 'Rücken schonend' } })
    fireEvent.click(within(editor).getByRole('button', { name: '+ Tag' }))
    fireEvent.click(within(editor).getByRole('button', { name: 'Übungen von Tag 1 bearbeiten' }))
    const day = screen.getByRole('dialog', { name: 'Tag bearbeiten' })
    fireEvent.click(within(day).getByRole('button', { name: '+ Übung' }))
    const picker = screen.getByRole('dialog', { name: 'Übungen hinzufügen' })
    fireEvent.click(within(picker).getByRole('button', { name: 'Lat-Zug' }))
    fireEvent.click(within(picker).getByRole('button', { name: '1 hinzufügen' }))
    fireEvent.click(within(day).getByRole('button', { name: 'Speichern' }))
    fireEvent.click(within(editor).getByRole('button', { name: 'Fertig' }))
    const p = appStore.getState().data.programs[0]
    expect(p.name).toBe('Rücken schonend')
    fireEvent.click(within(screen.getByRole('listitem', { name: 'Rücken schonend' })).getByRole('button', { name: 'Aktivieren' }))
    fireEvent.click(screen.getByRole('button', { name: '‹ Training' }))
    fireEvent.click(within(screen.getByRole('region', { name: 'Programm Rücken schonend' })).getByRole('button', { name: /Nächstes: Tag 1/ }))
    expect(appStore.getState().activeWorkout()!.entries.map((e) => e.exerciseId)).toEqual(['ex-lat-zug'])
  })
})
