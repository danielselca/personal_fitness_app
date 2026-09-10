// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from './App.tsx'

afterEach(cleanup)

function tab(name: string) {
  const nav = screen.getByRole('navigation', { name: 'Hauptnavigation' })
  const button = Array.from(nav.querySelectorAll('button')).find((b) => b.textContent === name)
  if (!button) throw new Error(`Tab "${name}" nicht gefunden`)
  return button
}

describe('App-Gerüst', () => {
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
    expect(screen.getByText(/Übungskatalog/)).toBeTruthy()

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
