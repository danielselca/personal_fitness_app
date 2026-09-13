// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { App } from './App.tsx'
import { createSeedData } from './domain/seed.ts'
import { appStore } from './store/appStore.ts'

beforeEach(() => appStore.setState({ data: createSeedData(), hydrated: true, loadError: null }))
afterEach(cleanup)

function tab(name: string) {
  const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' })
  const button = Array.from(nav.querySelectorAll('button')).find((b) => b.textContent === name)
  if (!button) throw new Error(`Tab "${name}" nicht gefunden`)
  return button
}

describe('App-Gerüst', () => {
  it('zeigt Ladezustand vor der Hydration', () => {
    appStore.setState({ hydrated: false })
    render(<App />)
    expect(screen.getByRole('status').textContent).toMatch(/Lade/)
  })

  it('startet auf dem Tab Training', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Training')
    expect(screen.getByRole('button', { name: 'Training starten' })).toBeTruthy()
  })

  it('zeigt die vier Tabs in fester Reihenfolge', () => {
    render(<App />)
    const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' })
    const labels = Array.from(nav.querySelectorAll('button')).map((b) => b.textContent)
    expect(labels).toEqual(['Training', 'Übungen', 'Verlauf', 'Mehr'])
  })

  it('wechselt den Tab, tauscht Titel und Inhalt', () => {
    render(<App />)

    fireEvent.click(tab('Übungen'))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Übungen')
    expect(screen.getByLabelText('Übungen suchen')).toBeTruthy()

    fireEvent.click(tab('Verlauf'))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Verlauf')

    fireEvent.click(tab('Mehr'))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Mehr')

    fireEvent.click(tab('Training'))
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Training')
  })

  it('markiert den aktiven Tab für Screenreader', () => {
    render(<App />)
    expect(tab('Training').getAttribute('aria-current')).toBe('page')
    expect(tab('Mehr').getAttribute('aria-current')).toBeNull()

    fireEvent.click(tab('Mehr'))
    expect(tab('Mehr').getAttribute('aria-current')).toBe('page')
    expect(tab('Training').getAttribute('aria-current')).toBeNull()
  })
})

describe('Erscheinungsbild (Hell/Dunkel)', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme
  })

  it('Schalter im Kopf setzt Dunkel/Hell ausdrücklich; Einstellung „System“ entfernt das Attribut', () => {
    render(<App />)
    expect(document.documentElement.dataset.theme).toBeUndefined() // Standard: System
    fireEvent.click(screen.getByRole('button', { name: 'Dunklen Modus einschalten' }))
    expect(appStore.getState().data.settings.theme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.querySelector('meta[name="theme-color"]')?.getAttribute('content') ?? '#101010').toBe('#101010')
    fireEvent.click(screen.getByRole('button', { name: 'Hellen Modus einschalten' }))
    expect(appStore.getState().data.settings.theme).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')

    fireEvent.click(tab('Mehr'))
    const group = screen.getByRole('radiogroup', { name: 'Erscheinungsbild' })
    expect(group.querySelector('[aria-checked="true"]')?.textContent).toBe('Hell')
    fireEvent.click(screen.getByRole('radio', { name: 'System' }))
    expect(appStore.getState().data.settings.theme).toBe('system')
    expect(document.documentElement.dataset.theme).toBeUndefined()
  })
})
