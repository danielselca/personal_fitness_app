// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildBackup } from '../domain/backup.ts'
import { createSeedData } from '../domain/seed.ts'
import type { Workout } from '../domain/types.ts'
import * as download from '../lib/download.ts'
import { appStore } from '../store/appStore.ts'
import { MoreScreen } from './MoreScreen.tsx'

function doneWorkout(id: string, at: string): Workout {
  return {
    id, startedAt: at, finishedAt: at, status: 'done', updatedAt: at,
    entries: [{ exerciseId: 'ex-lat-zug', sets: [{ id: `${id}-s`, weightKg: 45, reps: 10, done: true }] }],
  }
}

beforeEach(() => {
  appStore.setState({ data: createSeedData('2026-09-01T00:00:00.000Z'), hydrated: true, loadError: null })
  vi.spyOn(download, 'downloadJson').mockImplementation(() => {})
})
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

async function importFile(content: string) {
  const input = screen.getByLabelText('Sicherungsdatei wählen') as HTMLInputElement
  const file = new File([content], 'backup.json', { type: 'application/json' })
  fireEvent.change(input, { target: { files: [file] } })
}

describe('Sicherung (AK21–AK23, AK27)', () => {
  it('Export lädt Datei mit Datum herunter und setzt den Zähler zurück', () => {
    appStore.setState((s) => ({ data: { ...s.data, meta: { ...s.data.meta, workoutsSinceBackup: 5 } } }))
    render(<MoreScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Exportieren' }))
    expect(download.downloadJson).toHaveBeenCalledTimes(1)
    const [name, payload] = vi.mocked(download.downloadJson).mock.calls[0]
    expect(name).toMatch(/^fitness-backup-\d{4}-\d{2}-\d{2}\.json$/)
    expect((payload as { schemaVersion: number; exercises: unknown[] }).exercises).toHaveLength(21)
    expect(appStore.getState().data.meta.workoutsSinceBackup).toBe(0)
    expect(screen.getByRole('status').textContent).toMatch(/Exportiert/)
  })

  it('Erinnerung erscheint ab 3 Trainings seit letzter Sicherung und verschwindet nach Export', () => {
    appStore.setState((s) => ({ data: { ...s.data, meta: { ...s.data.meta, workoutsSinceBackup: 2 } } }))
    const { rerender } = render(<MoreScreen />)
    expect(screen.queryByTestId('backup-reminder')).toBeNull()
    appStore.setState((s) => ({ data: { ...s.data, meta: { ...s.data.meta, workoutsSinceBackup: 3 } } }))
    rerender(<MoreScreen />)
    expect(screen.getByTestId('backup-reminder').textContent).toMatch(/3 Trainings/)
    fireEvent.click(screen.getByRole('button', { name: 'Sichern' }))
    expect(screen.queryByTestId('backup-reminder')).toBeNull()
  })

  it('ungültige Datei: Fehlermeldung, Daten unverändert', async () => {
    render(<MoreScreen />)
    const before = appStore.getState().data
    await importFile('{ kein json')
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/kein gültiges JSON/))
    expect(appStore.getState().data).toBe(before)

    await importFile(JSON.stringify({ irgendwas: 1 }))
    await waitFor(() => expect(screen.getByRole('alert').textContent).toMatch(/nicht aus dieser App/))
    expect(appStore.getState().data).toBe(before)
  })

  it('gültige Datei: Vorschau mit Anzahlen, Zusammenführen ergänzt nur Neues', async () => {
    appStore.setState((s) => ({ data: { ...s.data, workouts: [doneWorkout('w-local', '2026-09-03T10:00:00Z')] } }))
    render(<MoreScreen />)
    const other = createSeedData('2026-09-01T00:00:00.000Z')
    other.workouts = [doneWorkout('w-local', '2026-09-03T10:00:00Z'), doneWorkout('w-new', '2026-09-05T10:00:00Z')]
    await importFile(JSON.stringify(buildBackup(other, '0.1.0', new Date('2026-09-06T08:00:00Z'))))
    await waitFor(() => expect(screen.getByTestId('import-preview')).toBeTruthy())
    expect(screen.getByTestId('import-preview').textContent).toMatch(/21 Übungen · 1 Vorlagen · 2 Trainings/)
    fireEvent.click(screen.getByRole('button', { name: 'Zusammenführen' }))
    expect(appStore.getState().data.workouts.map((w) => w.id).sort()).toEqual(['w-local', 'w-new'])
    expect(screen.getByRole('status').textContent).toMatch(/1 Trainings neu/)
    expect(download.downloadJson).not.toHaveBeenCalled()
  })

  it('Alles ersetzen verlangt Bestätigung und sichert vorher automatisch', async () => {
    appStore.setState((s) => ({ data: { ...s.data, workouts: [doneWorkout('w-local', '2026-09-03T10:00:00Z')] } }))
    render(<MoreScreen />)
    const other = createSeedData('2026-09-01T00:00:00.000Z')
    other.workouts = [doneWorkout('w-a', '2026-09-05T10:00:00Z')]
    await importFile(JSON.stringify(buildBackup(other, '0.1.0')))
    await waitFor(() => expect(screen.getByTestId('import-preview')).toBeTruthy())
    fireEvent.click(screen.getByRole('button', { name: 'Alles ersetzen' }))
    expect(screen.getByRole('alertdialog')).toBeTruthy()
    expect(appStore.getState().data.workouts.map((w) => w.id)).toEqual(['w-local']) // noch nichts passiert
    fireEvent.click(screen.getByRole('button', { name: 'Ersetzen' }))
    expect(download.downloadJson).toHaveBeenCalledTimes(1)
    expect(vi.mocked(download.downloadJson).mock.calls[0][0]).toMatch(/-vor-import\.json$/)
    expect(appStore.getState().data.workouts.map((w) => w.id)).toEqual(['w-a'])
  })
})
