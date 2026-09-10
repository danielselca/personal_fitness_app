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
    fireEvent.click(screen.getByRole('button', { name: 'Oberkörper Fokus Schulter bearbeiten' }))
    const sheet = screen.getByRole('dialog', { name: 'Vorlage bearbeiten' })
    fireEvent.change(within(sheet).getByLabelText('Vorlagenname'), { target: { value: 'Schulter A' } })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Butterfly Maschine nach oben' }))
    fireEvent.change(within(sheet).getByLabelText('Sätze für Lat-Zug'), { target: { value: '5' } })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Adduktion entfernen' }))
    fireEvent.click(within(sheet).getByRole('button', { name: 'Speichern' }))
    const t = appStore.getState().data.templates[0]
    expect(t.name).toBe('Schulter A')
    expect(t.entries).toHaveLength(7)
    expect(t.entries[0].exerciseId).toBe('ex-butterfly-maschine')
    expect(t.entries[1]).toEqual({ exerciseId: 'ex-lat-zug', sets: 5 })
    // Start aus geänderter Vorlage übernimmt Satzanzahl
    fireEvent.click(screen.getByRole('button', { name: 'Vorlage Schulter A starten' }))
    const active = appStore.getState().activeWorkout()!
    expect(active.entries[1].sets).toHaveLength(5)
  })

  it('löschen mit Bestätigung', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Oberkörper Fokus Schulter bearbeiten' }))
    fireEvent.click(screen.getByRole('button', { name: 'Vorlage löschen' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Löschen' }))
    expect(appStore.getState().data.templates).toHaveLength(0)
    expect(screen.queryByText('Vorlagen')).toBeNull()
  })

  it('nach Abschluss als Vorlage speichern', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Vorlage Oberkörper Fokus Schulter starten' }))
    const lat = screen.getByRole('region', { name: 'Lat-Zug' })
    fireEvent.click(within(lat).getByRole('button', { name: 'Satz 1 abhaken' }))
    fireEvent.click(screen.getByRole('button', { name: 'Abschließen' }))
    fireEvent.click(within(screen.getByRole('dialog', { name: 'Training abschließen' })).getByRole('button', { name: 'Abschließen' }))
    fireEvent.click(screen.getByRole('button', { name: 'Als Vorlage speichern' }))
    const sheet = screen.getByRole('dialog', { name: 'Als Vorlage speichern' })
    expect((within(sheet).getByLabelText('Vorlagenname') as HTMLInputElement).value).toBe('Oberkörper Fokus Schulter')
    fireEvent.change(within(sheet).getByLabelText('Vorlagenname'), { target: { value: 'Nur Lat' } })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Speichern' }))
    const t = appStore.getState().data.templates.find((x) => x.name === 'Nur Lat')!
    expect(t.entries).toEqual([{ exerciseId: 'ex-lat-zug', sets: 1 }])
  })
})
