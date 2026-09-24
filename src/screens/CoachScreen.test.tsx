// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createSeedData } from '../domain/seed.ts'
import type { Workout } from '../domain/types.ts'
import { appStore } from '../store/appStore.ts'
import { useNav } from '../store/navStore.ts'
import CoachScreen from './CoachScreen.tsx'
import { MoreScreen } from './MoreScreen.tsx'
import { ExercisesScreen } from './ExercisesScreen.tsx'

let n = 0
function w(daysAgo: number, exerciseId: string, sets: [number | null, number][]): Workout {
  const at = new Date(Date.now() - daysAgo * 86_400_000).toISOString()
  n++
  return { id: `w${n}`, startedAt: at, finishedAt: at, status: 'done', updatedAt: at, entries: [{ exerciseId, sets: sets.map(([kg, r], i) => ({ id: `${n}-${i}`, weightKg: kg, reps: r, done: true })) }] }
}

beforeEach(() => appStore.setState({ data: createSeedData('2026-09-01T00:00:00.000Z'), hydrated: true, loadError: null }))
afterEach(cleanup)

describe('Coach-Tab (Schritt 20b)', () => {
  it('ohne Trainings: Wochenring 0/3 und Hinweis auf zu wenig Daten', () => {
    render(<CoachScreen />)
    expect(screen.getByRole('img', { name: '0 von 3 Trainings diese Woche' })).toBeTruthy()
    expect(screen.getByText('Noch zu wenig Daten')).toBeTruthy()
  })

  it('Fortschritt, Bestwerte und geschonte Bereiche mit Weg zu „Mehr“', () => {
    const d = appStore.getState().data
    appStore.setState({
      data: {
        ...d,
        workouts: [w(10, 'ex-lat-zug', [[45, 10]]), w(3, 'ex-lat-zug', [[50, 8]])],
        restrictions: [{ id: 'rs', bodyParts: ['schulter'], muscles: [], createdAt: '2026-09-01T00:00:00.000Z', updatedAt: '2026-09-01T00:00:00.000Z' }],
      },
    })
    render(<CoachScreen />)
    const trends = screen.getByRole('list', { name: 'Fortschritt je Übung' })
    expect(within(trends).getByText('Lat-Zug')).toBeTruthy()
    expect(within(trends).getByLabelText('gesteigert')).toBeTruthy()
    expect(screen.getByRole('list', { name: 'Letzte Bestwerte' }).textContent).toContain('50 kg (bisher 45 kg)')
    fireEvent.click(screen.getByRole('button', { name: /Schulter/ }))
    expect(useNav.getState().tab).toBe('more')
  })

  it('Übungsdetail zeigt Bestwerte mit geschätztem 1RM', () => {
    const d = appStore.getState().data
    appStore.setState({ data: { ...d, workouts: [w(3, 'ex-lat-zug', [[50, 8], [45, 10]])] } })
    render(<ExercisesScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Lat-Zug' }))
    const dl = screen.getByLabelText('Bestwerte')
    expect(dl.textContent).toContain('Höchstgewicht50 kg')
    expect(dl.textContent).toContain('~63,5 kg') // 50 × (1 + 8/30) = 63,3 → auf 0,5 gerundet
  })

  it('Profil: Ziel, Erfahrung, Körpergewicht eintragen und löschen', () => {
    render(<MoreScreen />)
    fireEvent.click(screen.getByRole('radio', { name: 'Fitness & Abnehmen' }))
    fireEvent.click(screen.getByRole('radio', { name: 'Fortgeschritten' }))
    expect(appStore.getState().data.settings.profile).toEqual({ goal: 'fitness', experience: 'fortgeschritten' })
    fireEvent.change(screen.getByLabelText('Körpergewicht heute'), { target: { value: '5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Eintragen' }))
    expect(screen.getByRole('alert').textContent).toMatch(/20 und 400/)
    fireEvent.change(screen.getByLabelText('Körpergewicht heute'), { target: { value: '82,4' } })
    fireEvent.click(screen.getByRole('button', { name: 'Eintragen' }))
    expect(appStore.getState().data.bodyLog).toHaveLength(1)
    expect(appStore.getState().data.bodyLog[0].weightKg).toBe(82.4)
    const list = screen.getByRole('list', { name: 'Körpergewicht-Einträge' })
    fireEvent.click(within(list).getByRole('button', { name: /löschen/ }))
    expect(appStore.getState().data.bodyLog).toEqual([])
  })
})
