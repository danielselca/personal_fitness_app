// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { PROGRAM_FORMAT } from '../domain/programJson.ts'
import { createSeedData } from '../domain/seed.ts'
import { appStore } from '../store/appStore.ts'
import ClaudeBriefSheet from './ClaudeBriefSheet.tsx'
import ProgramImportSheet from './ProgramImportSheet.tsx'

beforeEach(() => appStore.setState({ data: createSeedData('2026-09-01T00:00:00.000Z'), hydrated: true, loadError: null }))
afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

function stubClipboard(writeText: (t: string) => Promise<void>) {
  vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } })
}

describe('Mit Claude besprechen', () => {
  it('Frage fließt in die Vorschau; Kopieren meldet Erfolg', async () => {
    const written: string[] = []
    stubClipboard(async (t) => void written.push(t))
    render(<ClaudeBriefSheet onClose={() => {}} onImport={() => {}} />)
    fireEvent.change(screen.getByLabelText('Deine Frage'), { target: { value: 'Mehr Beine?' } })
    expect(screen.getByLabelText('Vorschau des Briefs').textContent).toContain('Meine Frage: Mehr Beine?')
    expect(screen.queryByRole('button', { name: 'Teilen …' })).toBeNull() // jsdom kann nicht teilen
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Kopieren' })))
    expect(screen.getByRole('status').textContent).toContain('Kopiert')
    expect(written[0]).toContain('# Mein Training')
  })

  it('Kopieren gescheitert → Text zum Markieren', async () => {
    stubClipboard(async () => {
      throw new Error('nope')
    })
    render(<ClaudeBriefSheet onClose={() => {}} onImport={() => {}} />)
    await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Kopieren' })))
    expect((screen.getByLabelText('Brief zum Kopieren') as HTMLTextAreaElement).value).toContain('# Mein Training')
  })
})

describe('Programm von Claude übernehmen', () => {
  const answer = `Klar! Hier ist dein Plan.\n\`\`\`json\n${JSON.stringify({
    format: PROGRAM_FORMAT,
    name: 'Herbst',
    sessionsPerWeek: 2,
    days: [{ name: 'A', exercises: [{ id: 'ex-lat-zug', name: 'Lat-Zug', sets: 3, reps: [8, 12] }, { library: 'beinpresse', name: 'Beinpresse', sets: 3, reps: [10, 12] }, { name: 'Balancieren auf dem Kissen', sets: 2, holdSec: 45 }] }],
  })}\n\`\`\``

  it('Fehler werden angezeigt', () => {
    render(<ProgramImportSheet onClose={() => {}} />)
    fireEvent.change(screen.getByLabelText('Antwort von Claude'), { target: { value: 'Mach mehr Beine.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Prüfen' }))
    expect(screen.getByRole('alert').textContent).toContain('Kein Programm gefunden')
  })

  it('Vorschau mit Zuordnung und Warnung bei Schonung, dann Übernehmen und aktivieren', () => {
    const d = appStore.getState().data
    appStore.setState({ data: { ...d, restrictions: [{ id: 'r', bodyParts: ['knie'], muscles: [], createdAt: '', updatedAt: '' }] } })
    const onDone = vi.fn()
    render(<ProgramImportSheet onClose={() => {}} onDone={onDone} />)
    fireEvent.change(screen.getByLabelText('Antwort von Claude'), { target: { value: answer } })
    fireEvent.click(screen.getByRole('button', { name: 'Prüfen' }))
    const day = screen.getByRole('region', { name: 'Tag A' })
    const items = within(day).getAllByRole('listitem')
    expect(items[0].textContent).toContain('deine Übung')
    expect(items[1].textContent).toContain('aus der Bibliothek')
    expect(items[1].textContent).toContain('⚠ belastet Knie')
    expect(items[2].textContent).toContain('neu')
    fireEvent.click(screen.getByRole('button', { name: 'Übernehmen' }))
    const data = appStore.getState().data
    const p = data.programs.find((x) => x.name === 'Herbst')!
    expect(data.settings.activeProgramId).toBe(p.id)
    expect(screen.getByRole('status').textContent).toContain('„Herbst“ ist jetzt eines deiner Programme und aktiv')
    fireEvent.click(screen.getByRole('button', { name: 'Zu den Programmen' }))
    expect(onDone).toHaveBeenCalledWith(p)
  })
})
