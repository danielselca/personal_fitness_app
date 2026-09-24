// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { libraryEntry } from '../domain/library.ts'
import { mediaFor } from '../domain/media.ts'
import { createSeedData } from '../domain/seed.ts'
import { appStore } from '../store/appStore.ts'
import { MoreScreen } from '../screens/MoreScreen.tsx'
import { TrainingScreen } from '../screens/TrainingScreen.tsx'
import { ExerciseMedia } from './ExerciseMedia.tsx'

beforeEach(() => appStore.setState({ data: createSeedData('2026-09-01T00:00:00.000Z'), hydrated: true, loadError: null }))
afterEach(cleanup)

describe('Bewegungsgrafiken (Schritt 19)', () => {
  const media = mediaFor(libraryEntry('face-pull'))!

  it('zeigt alle Phasen mit versetzter Animation und Quellenangabe', () => {
    const { container } = render(<ExerciseMedia media={media} name="Face Pull" />)
    expect(screen.getByRole('img', { name: 'Bewegungsablauf Face Pull (3 Phasen)' })).toBeTruthy()
    const imgs = container.querySelectorAll('img.media-frame')
    expect(imgs).toHaveLength(3)
    expect((imgs[2] as HTMLElement).style.animationDelay).toBe('1.8s')
    expect(screen.getByText(/CC BY-SA 4.0/)).toBeTruthy()
  })

  it('Platzhalter, wenn eine Grafik nicht lädt (offline ohne Cache)', () => {
    const { container } = render(<ExerciseMedia media={media} name="Face Pull" />)
    fireEvent.error(container.querySelector('img')!)
    expect(screen.getByRole('img', { name: 'Grafik zu Face Pull offline nicht verfügbar' })).toBeTruthy()
  })

  it('Trainingskarte: „Ausführung“ öffnet Grafik, Tipps und Muskeln; unverknüpfte Übung ohne Knopf', async () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
    const dialog = screen.getByRole('dialog', { name: 'Übungen hinzufügen' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Lat-Zug' }))
    fireEvent.click(within(dialog).getByRole('button', { name: 'Adduktion' }))
    fireEvent.click(within(dialog).getByRole('button', { name: '2 hinzufügen' }))
    const lat = screen.getByRole('region', { name: 'Lat-Zug' })
    if (within(lat).queryByRole('button', { expanded: false })) fireEvent.click(within(lat).getByRole('button', { expanded: false }))
    fireEvent.click(within(lat).getByRole('button', { name: 'Ausführung Lat-Zug' }))
    const sheet = screen.getByRole('dialog', { name: 'Lat-Zug' })
    expect(within(sheet).getByRole('img', { name: /Bewegungsablauf Lat-Zug/ })).toBeTruthy()
    expect(within(sheet).getByText('Latissimus', { selector: 'dd' })).toBeTruthy()
    expect(await within(sheet).findByRole('list', { name: 'Ausführung' })).toBeTruthy()
    fireEvent.click(within(sheet).getByRole('button', { name: 'Schließen' }))
    const add = screen.getByRole('region', { name: 'Adduktion' })
    if (within(add).queryByRole('button', { expanded: false })) fireEvent.click(within(add).getByRole('button', { expanded: false }))
    expect(within(add).queryByRole('button', { name: /Ausführung/ })).toBeNull()
  })

  it('Mehr → Quellen & Lizenzen', () => {
    render(<MoreScreen />)
    expect(screen.getByRole('heading', { name: 'Quellen & Lizenzen' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Urheber je Grafik' }).getAttribute('href')).toMatch(/media\/v1\/ATTRIBUTION\.json$/)
  })
})
