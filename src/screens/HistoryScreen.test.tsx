// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createSeedData } from '../domain/seed.ts'
import type { Workout } from '../domain/types.ts'
import { appStore } from '../store/appStore.ts'
import { HistoryScreen } from './HistoryScreen.tsx'

function wo(id: string, finishedAt: string, sets: { w: number | null; r: number }[], exerciseId = 'ex-lat-zug'): Workout {
  const startedAt = new Date(new Date(finishedAt).getTime() - 45 * 60000).toISOString()
  return {
    id, startedAt, finishedAt, status: 'done', updatedAt: finishedAt,
    entries: [{ exerciseId, note: 'Griff eng', sets: sets.map((s, i) => ({ id: `${id}-${i}`, weightKg: s.w, reps: s.r, done: true })) }],
  }
}

beforeEach(() => appStore.setState({ data: createSeedData('2026-09-01T00:00:00.000Z'), hydrated: true, loadError: null }))
afterEach(cleanup)

describe('Verlauf (F8, AK16, AK17)', () => {
  it('Leerzustände ohne Trainings, in Liste und Statistik', () => {
    render(<HistoryScreen />)
    expect(screen.getByText('Noch kein Training abgeschlossen')).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: 'Statistik' }))
    expect(screen.getByTestId('stats-empty')).toBeTruthy()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('listet Trainings neueste zuerst mit Volumen und Dauer', () => {
    appStore.setState((s) => ({ data: { ...s.data, workouts: [wo('a', '2026-09-01T10:00:00Z', [{ w: 45, r: 10 }]), wo('b', '2026-09-08T10:00:00Z', [{ w: 45, r: 10 }, { w: 45, r: 10 }, { w: 47.5, r: 8 }])] } }))
    render(<HistoryScreen />)
    const items = screen.getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(items[0].textContent).toMatch(/08\.09\.2026/)
    expect(items[0].textContent).toMatch(/3 Sätze · 1\.280 kg · 45 min/)
    expect(items[0].textContent).toMatch(/Lat-Zug/)
  })

  it('Korrektur im Detail wirkt auf Volumen; Satz und Übung löschen; Training löschen mit Bestätigung', () => {
    appStore.setState((s) => ({ data: { ...s.data, workouts: [wo('b', '2026-09-08T10:00:00Z', [{ w: 45, r: 10 }, { w: 45, r: 10 }, { w: 47.5, r: 8 }]), wo('c', '2026-09-09T10:00:00Z', [{ w: 30, r: 10 }], 'ex-rudern')] } }))
    render(<HistoryScreen />)
    fireEvent.click(within(screen.getAllByRole('listitem')[1]).getByRole('button'))
    expect(screen.getByTestId('detail-volume').textContent).toBe('1.280 kg')
    expect(screen.getByText('„Griff eng“')).toBeTruthy()
    fireEvent.change(screen.getByLabelText('Lat-Zug Satz 3 Gewicht'), { target: { value: '50' } })
    expect(screen.getByTestId('detail-volume').textContent).toBe('1.300 kg')
    expect(appStore.getState().data.workouts.find((w) => w.id === 'b')!.entries[0].sets[2].weightKg).toBe(50)
    fireEvent.change(screen.getByLabelText('Lat-Zug Satz 3 Wiederholungen'), { target: { value: '10' } })
    expect(screen.getByTestId('detail-volume').textContent).toBe('1.400 kg')

    fireEvent.click(screen.getByRole('button', { name: 'Lat-Zug Satz 3 löschen' }))
    expect(screen.getByTestId('detail-volume').textContent).toBe('900 kg')

    fireEvent.click(screen.getByRole('button', { name: 'Lat-Zug aus Training löschen' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Löschen' }))
    expect(appStore.getState().data.workouts.find((w) => w.id === 'b')!.entries).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: 'Training löschen' }))
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Löschen' }))
    expect(appStore.getState().data.workouts.map((w) => w.id)).toEqual(['c'])
    expect(screen.getAllByRole('listitem')).toHaveLength(1)
  })

  it('Datum ändern verschiebt Start und Ende gemeinsam', () => {
    appStore.setState((s) => ({ data: { ...s.data, workouts: [wo('b', '2026-09-08T10:00:00Z', [{ w: 45, r: 10 }])] } }))
    render(<HistoryScreen />)
    fireEvent.click(within(screen.getByRole('listitem')).getByRole('button'))
    const input = screen.getByLabelText('Datum') as HTMLInputElement
    const before = appStore.getState().data.workouts[0]
    const local = new Date(before.finishedAt!)
    local.setDate(local.getDate() - 1)
    const p = (n: number) => String(n).padStart(2, '0')
    fireEvent.change(input, { target: { value: `${local.getFullYear()}-${p(local.getMonth() + 1)}-${p(local.getDate())}T${p(local.getHours())}:${p(local.getMinutes())}` } })
    const after = appStore.getState().data.workouts[0]
    expect(new Date(before.finishedAt!).getTime() - new Date(after.finishedAt!).getTime()).toBe(86400000)
    expect(new Date(before.startedAt).getTime() - new Date(after.startedAt).getTime()).toBe(86400000)
  })

  it('Als Vorlage speichern aus dem Verlauf', () => {
    appStore.setState((s) => ({ data: { ...s.data, workouts: [wo('b', '2026-09-08T10:00:00Z', [{ w: 45, r: 10 }, { w: 45, r: 10 }])] } }))
    render(<HistoryScreen />)
    fireEvent.click(within(screen.getByRole('listitem')).getByRole('button'))
    fireEvent.click(screen.getByRole('button', { name: 'Als Vorlage speichern' }))
    const sheet = screen.getByRole('dialog', { name: 'Als Vorlage speichern' })
    fireEvent.change(within(sheet).getByLabelText('Vorlagenname'), { target: { value: 'Rücken kurz' } })
    fireEvent.click(within(sheet).getByRole('button', { name: 'Speichern' }))
    const t = appStore.getState().data.templates.find((x) => x.name === 'Rücken kurz')!
    expect(t.entries).toEqual([{ exerciseId: 'ex-lat-zug', sets: 2 }])
    expect(screen.getByRole('status').textContent).toMatch(/Rücken kurz/)
  })
})

describe('Statistik (AK18, AK19, AK20)', () => {
  it('zeigt Wochen-, Volumen- und Übungsdiagramm mit Tabelle', () => {
    const now = new Date()
    const iso = (daysAgo: number) => new Date(now.getTime() - daysAgo * 86400000).toISOString()
    appStore.setState((s) => ({ data: { ...s.data, workouts: [wo('a', iso(1), [{ w: 45, r: 10 }, { w: 47.5, r: 8 }]), wo('b', iso(0), [{ w: 50, r: 6 }]), wo('c', iso(2), [{ w: null, r: 12 }], 'ex-bear-hug')] } }))
    render(<HistoryScreen />)
    fireEvent.click(screen.getByRole('tab', { name: 'Statistik' }))
    expect(screen.getByRole('img', { name: /Trainings pro Woche/ })).toBeTruthy()
    expect(screen.getByTestId('stats-weekly').textContent).toMatch(/3 Trainings in 12 Wochen/)
    expect(screen.getByRole('img', { name: 'Volumen je Training' })).toBeTruthy()
    expect(screen.getByTestId('stats-volume').textContent).toMatch(/Zuletzt: 300 kg/)
    const select = screen.getByLabelText('Übung wählen') as HTMLSelectElement
    expect(Array.from(select.options).map((o) => o.textContent)).toEqual(['Bear hug', 'Lat-Zug'])
    fireEvent.change(select, { target: { value: 'ex-lat-zug' } })
    expect(screen.getByRole('img', { name: 'Gewichtsverlauf' })).toBeTruthy()
    const rows = screen.getAllByRole('row').slice(1)
    expect(rows[0].textContent).toMatch(/6 × 50 kg/)
    expect(rows[1].textContent).toMatch(/8 × 47,5 kg/)
  })
})
