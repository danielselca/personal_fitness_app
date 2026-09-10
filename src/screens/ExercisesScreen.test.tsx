// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createSeedData } from '../domain/seed.ts'
import type { Workout } from '../domain/types.ts'
import { appStore } from '../store/appStore.ts'
import { ExercisesScreen } from './ExercisesScreen.tsx'

beforeEach(() => appStore.setState({ data: createSeedData('2026-09-01T00:00:00.000Z'), hydrated: true, loadError: null }))
afterEach(cleanup)

const listNames = () => screen.getAllByRole('listitem').map((el) => within(el).getByText(/./, { selector: '.row-title' }).textContent)

describe('Übungskatalog (AK3, AK4)', () => {
  it('zeigt 21 Übungen alphabetisch und findet über Gerätenummer und Alias', () => {
    render(<ExercisesScreen />)
    expect(screen.getAllByRole('listitem')).toHaveLength(21)
    const search = screen.getByLabelText('Übungen suchen')
    fireEvent.change(search, { target: { value: '28' } })
    expect(listNames()).toEqual(['Lat-Zug'])
    fireEvent.change(search, { target: { value: 'butterfly' } })
    expect(listNames()).toEqual(['Butterfly Maschine', 'Reverse Butterfly'])
    fireEvent.change(search, { target: { value: 'Ruderzug' } })
    expect(listNames()).toEqual(['Rudern'])
  })

  it('legt eine Übung an, lehnt Doppelte ab, benennt um und archiviert', () => {
    render(<ExercisesScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Neue Übung' }))
    const dialog = screen.getByRole('dialog', { name: 'Neue Übung' })
    const nameInput = within(dialog).getByLabelText('Name *')
    fireEvent.change(nameInput, { target: { value: 'Lat-Zug' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Anlegen' }))
    expect(within(dialog).getByRole('alert').textContent).toMatch(/gibt es schon/)

    fireEvent.change(nameInput, { target: { value: 'Test' } })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Anlegen' }))
    // Detailansicht der neuen Übung
    expect(screen.getByRole('heading', { level: 2, name: 'Test' })).toBeTruthy()
    expect(appStore.getState().data.exercises.some((e) => e.name === 'Test')).toBe(true)

    // Umbenennen
    fireEvent.click(screen.getByRole('button', { name: 'Bearbeiten' }))
    const edit = screen.getByRole('dialog', { name: 'Übung bearbeiten' })
    fireEvent.change(within(edit).getByLabelText('Name *'), { target: { value: 'Test 2' } })
    fireEvent.click(within(edit).getByRole('button', { name: 'Speichern' }))
    expect(screen.getByRole('heading', { level: 2, name: 'Test 2' })).toBeTruthy()

    // Archivieren mit Bestätigung → verschwindet aus der Liste
    fireEvent.click(screen.getByRole('button', { name: 'Archivieren' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Archivieren' }))
    expect(screen.getByText('Archiviert')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '‹ Alle Übungen' }))
    expect(screen.getAllByRole('listitem')).toHaveLength(21)
    expect(listNames()).not.toContain('Test 2')
    fireEvent.click(screen.getByRole('button', { name: /Archivierte anzeigen/ }))
    expect(listNames()).toEqual(['Test 2'])
  })

  it('Suche ohne Treffer bietet das Anlegen mit dem Suchtext an', () => {
    render(<ExercisesScreen />)
    fireEvent.change(screen.getByLabelText('Übungen suchen'), { target: { value: 'Beinpresse' } })
    fireEvent.click(screen.getByRole('button', { name: '„Beinpresse“ als neue Übung anlegen' }))
    const dialog = screen.getByRole('dialog', { name: 'Neue Übung' })
    expect((within(dialog).getByLabelText('Name *') as HTMLInputElement).value).toBe('Beinpresse')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Anlegen' }))
    expect(appStore.getState().data.exercises.some((e) => e.name === 'Beinpresse')).toBe(true)
  })

  it('Plan-Vorgabe ist editierbar (Sätze, Wdh., Gewicht)', () => {
    render(<ExercisesScreen />)
    fireEvent.change(screen.getByLabelText('Übungen suchen'), { target: { value: '28' } })
    fireEvent.click(screen.getByRole('listitem'))
    fireEvent.click(screen.getByRole('button', { name: 'Bearbeiten' }))
    const edit = screen.getByRole('dialog', { name: 'Übung bearbeiten' })
    fireEvent.change(within(edit).getByLabelText('Vorgabe Sätze'), { target: { value: '3' } })
    fireEvent.change(within(edit).getByLabelText('Vorgabe Wdh.'), { target: { value: '12' } })
    fireEvent.change(within(edit).getByLabelText('Vorgabe Gewicht'), { target: { value: '47,5' } })
    fireEvent.click(within(edit).getByRole('button', { name: 'Speichern' }))
    const lat = appStore.getState().data.exercises.find((e) => e.name === 'Lat-Zug')!
    expect(lat.planTarget).toMatchObject({ sets: 3, reps: 12, weightKg: 47.5, source: 'Fit7.11-Plan' })
  })

  it('Detail zeigt Verlauf aus abgeschlossenen Trainings, sonst Leerzustand', () => {
    const at = '2026-09-05T10:00:00Z'
    const w: Workout = {
      id: 'w1', startedAt: at, finishedAt: at, status: 'done', updatedAt: at,
      entries: [{ exerciseId: 'ex-lat-zug', sets: [{ id: 's1', weightKg: 45, reps: 10, done: true }, { id: 's2', weightKg: 47.5, reps: 8, done: true }] }],
    }
    appStore.setState((s) => ({ data: { ...s.data, workouts: [w] } }))
    render(<ExercisesScreen />)
    fireEvent.change(screen.getByLabelText('Übungen suchen'), { target: { value: 'Bear' } })
    fireEvent.click(screen.getByRole('listitem'))
    expect(screen.getByText('Noch keine Trainingswerte')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '‹ Alle Übungen' }))
    fireEvent.change(screen.getByLabelText('Übungen suchen'), { target: { value: '28' } })
    fireEvent.click(screen.getByRole('listitem'))
    expect(screen.getByRole('img', { name: /Gewichtsverlauf/ })).toBeTruthy()
    expect(screen.getByText('8 × 47,5 kg')).toBeTruthy()
  })
})
