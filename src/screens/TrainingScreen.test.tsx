// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSeedData } from '../domain/seed.ts'
import type { Workout } from '../domain/types.ts'
import { appStore } from '../store/appStore.ts'
import { TrainingScreen } from './TrainingScreen.tsx'

beforeEach(() => {
  appStore.setState({ data: createSeedData('2026-09-01T00:00:00.000Z'), hydrated: true, loadError: null })
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

const card = (name: string) => screen.getByRole('region', { name })
const data = () => appStore.getState().data
const active = () => appStore.getState().activeWorkout()!

function addFromPicker(names: string[]) {
  const dialog = screen.getByRole('dialog', { name: 'Übungen hinzufügen' })
  for (const n of names) fireEvent.click(within(dialog).getByRole('button', { name: new RegExp(`^${n}`) }))
  fireEvent.click(within(dialog).getByRole('button', { name: `${names.length} hinzufügen` }))
}

describe('Kernablauf (AK5, AK7, AK9, AK10, AK13)', () => {
  it('Start ohne Historie: Lat-Zug mit 4 Plan-Sätzen, Abhaken startet Timer mit Übungspause 90 s', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Training starten' }))
    // Leeres Training → Auswahl offen
    addFromPicker(['Lat-Zug'])
    const c = card('Lat-Zug')
    expect(within(c).getByTestId('source-line').textContent).toMatch(/Vorgabe: 4 × 10 × 45 kg \(Fit7.11-Plan\)/)
    expect(within(c).getAllByTestId(/^set-/)).toHaveLength(4)
    expect((within(c).getByLabelText('Satz 1 Gewicht') as HTMLInputElement).value).toBe('45')
    expect((within(c).getByLabelText('Satz 1 Wiederholungen') as HTMLInputElement).value).toBe('10')
    expect(within(c).getByTestId('set-1').querySelector('.set-last')!.textContent).toBe('–')

    fireEvent.click(within(c).getByRole('button', { name: 'Satz 1 abhaken' }))
    expect(active().entries[0].sets[0].done).toBe(true)
    expect(data().timer?.durationSec).toBe(90)
    expect(screen.getByTestId('timer')).toBeTruthy()
  })

  it('Nur Abgehaktes zählt; Abschluss ohne Sätze fragt nach Verwerfen (AK7)', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Training starten' }))
    addFromPicker(['Lat-Zug'])
    expect(screen.getByTestId('done-count').textContent).toBe('0')
    fireEvent.click(screen.getByRole('button', { name: 'Abschließen' }))
    const dlg = screen.getByRole('alertdialog', { name: 'Training verwerfen?' })
    fireEvent.click(within(dlg).getByRole('button', { name: 'Verwerfen' }))
    expect(appStore.getState().activeWorkout()).toBeNull()
    expect(data().workouts).toHaveLength(0)
  })

  it('Dezimalgewicht per Eingabe und Stepper; Sätze hinzufügen/löschen/rückgängig (AK8, AK9)', () => {
    vi.useFakeTimers()
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Training starten' }))
    addFromPicker(['Lat-Zug'])
    const c = card('Lat-Zug')
    const w1 = within(c).getByLabelText('Satz 1 Gewicht')
    fireEvent.change(w1, { target: { value: '12,5' } })
    expect(active().entries[0].sets[0].weightKg).toBe(12.5)
    fireEvent.change(w1, { target: { value: '12.5' } })
    expect(active().entries[0].sets[0].weightKg).toBe(12.5)
    fireEvent.click(within(c).getByRole('button', { name: 'Gewicht plus 2,5 kg' }))
    expect(active().entries[0].sets[0].weightKg).toBe(15)
    expect((w1 as HTMLInputElement).value).toBe('15')
    fireEvent.click(within(c).getByRole('button', { name: 'Eine Wiederholung mehr' }))
    expect(active().entries[0].sets[0].reps).toBe(11)
    fireEvent.change(within(c).getByLabelText('Satz 1 Wiederholungen'), { target: { value: 'abc' } })
    expect(active().entries[0].sets[0].reps).toBe(11) // ungültig wird nicht übernommen

    fireEvent.click(within(c).getByRole('button', { name: '+ Satz' }))
    expect(active().entries[0].sets).toHaveLength(5)
    expect(active().entries[0].sets[4]).toMatchObject({ weightKg: 45, reps: 10 })

    fireEvent.click(within(c).getByRole('button', { name: 'Satz 1 löschen' }))
    expect(active().entries[0].sets).toHaveLength(4)
    fireEvent.click(screen.getByRole('button', { name: 'Rückgängig' }))
    expect(active().entries[0].sets).toHaveLength(5)
    expect(active().entries[0].sets[0].weightKg).toBe(15)
    fireEvent.click(within(c).getByRole('button', { name: 'Satz 1 löschen' }))
    act(() => vi.advanceTimersByTime(5100))
    expect(screen.queryByRole('button', { name: 'Rückgängig' })).toBeNull()

    // Bearbeiten-Modus: nicht aktuelle Sätze löschen, Haken ausgeblendet
    fireEvent.click(within(c).getByRole('button', { name: 'Lat-Zug: Sätze bearbeiten' }))
    expect(within(c).queryByRole('button', { name: 'Satz 1 abhaken' })).toBeNull()
    fireEvent.click(within(c).getByRole('button', { name: 'Satz 3 löschen' }))
    expect(active().entries[0].sets).toHaveLength(3)
    fireEvent.click(within(c).getByRole('button', { name: 'Lat-Zug: Bearbeiten beenden' }))
    expect(within(c).getByRole('button', { name: 'Satz 1 abhaken' })).toBeTruthy()
  })

  it('Umsortieren, Entfernen, Notiz, Übung im Training anlegen (AK10, AK4b, F5)', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Training starten' }))
    addFromPicker(['Lat-Zug', 'Rudern'])
    expect(active().entries.map((e) => e.exerciseId)).toEqual(['ex-lat-zug', 'ex-rudern'])
    // Sortiermodus: kompakte Zeilen statt Karten, Pfeile nur dort
    expect(within(card('Lat-Zug')).queryByRole('button', { name: 'Lat-Zug nach oben' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Sortieren' }))
    const sortList = screen.getByRole('list', { name: 'Reihenfolge der Übungen' })
    expect(screen.queryAllByRole('region')).toHaveLength(0)
    fireEvent.click(within(sortList).getByRole('button', { name: 'Rudern nach oben' }))
    expect(active().entries.map((e) => e.exerciseId)).toEqual(['ex-rudern', 'ex-lat-zug'])
    expect(within(sortList).getByRole('button', { name: 'Rudern nach oben' }).hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Fertig' }))
    expect(screen.getAllByRole('region')).toHaveLength(2)
    // Nach dem Sortieren ist Rudern die aktuelle Übung (ausgeklappt), Lat-Zug eingeklappt
    expect(within(card('Rudern')).getByRole('button', { expanded: true })).toBeTruthy()
    expect(within(card('Lat-Zug')).getByRole('button', { expanded: false })).toBeTruthy()
    fireEvent.click(within(card('Lat-Zug')).getByRole('button', { expanded: false }))

    fireEvent.click(within(card('Lat-Zug')).getByRole('button', { name: 'Notiz' }))
    fireEvent.change(within(card('Lat-Zug')).getByLabelText('Notiz zu Lat-Zug'), { target: { value: 'Griff eng' } })
    expect(active().entries[1].note).toBe('Griff eng')

    // Neue Übung direkt aus der Auswahl
    fireEvent.click(screen.getByRole('button', { name: '+ Übung' }))
    const dialog = screen.getByRole('dialog', { name: 'Übungen hinzufügen' })
    fireEvent.change(within(dialog).getByLabelText('Übung suchen'), { target: { value: 'Beinpresse' } })
    fireEvent.click(within(dialog).getByRole('button', { name: '„Beinpresse“ als neue Übung anlegen' }))
    expect(data().exercises.some((e) => e.name === 'Beinpresse')).toBe(true)
    expect(card('Beinpresse')).toBeTruthy()
    fireEvent.click(within(card('Beinpresse')).getByRole('button', { expanded: false })) // neue Übung ist hinten, daher eingeklappt
    expect(within(card('Beinpresse')).getByTestId('source-line').textContent).toBe('Keine früheren Werte')
    expect(within(card('Beinpresse')).getByRole('button', { name: 'Satz 1 abhaken' }).hasAttribute('disabled')).toBe(true)

    // Entfernen über den Bearbeiten-Modus der Karte
    fireEvent.click(within(card('Rudern')).getByRole('button', { name: 'Rudern: Sätze bearbeiten' }))
    fireEvent.click(within(card('Rudern')).getByRole('button', { name: 'Rudern entfernen' }))
    expect(active().entries.map((e) => e.exerciseId)).toEqual(['ex-lat-zug', expect.stringMatching(/^ex-/)])
  })

  it('Nur die aktuelle Übung ist ausgeklappt; erledigte klappen zu und die nächste öffnet sich (Übersicht)', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Training starten' }))
    addFromPicker(['Rudern', 'Lat-Zug'])
    const rudern = card('Rudern')
    const lat = card('Lat-Zug')
    expect(rudern.getAttribute('data-state')).toBe('current')
    expect(lat.getAttribute('data-state')).toBe('pending')
    expect(within(lat).queryByLabelText('Satz 1 Gewicht')).toBeNull() // eingeklappt
    expect(within(lat).getByTestId('progress-line').textContent).toBe('0/4 Sätze')
    expect(screen.getByTestId('exercise-pos').textContent).toMatch(/Übung 1\/2/)

    // Satz 1 aktuell (farbig), Satz 2 offen
    expect(within(rudern).getByTestId('set-1').getAttribute('data-state')).toBe('current')
    expect(within(rudern).getByTestId('set-2').getAttribute('data-state')).toBe('pending')
    fireEvent.click(within(rudern).getByRole('button', { name: 'Satz 1 abhaken' }))
    expect(within(rudern).getByTestId('set-1').getAttribute('data-state')).toBe('done')
    expect(within(rudern).getByTestId('set-2').getAttribute('data-state')).toBe('current')

    // Manuell die zweite Übung öffnen, dann alle Sätze der ersten abhaken → Wechsel
    fireEvent.click(within(lat).getByRole('button', { expanded: false }))
    expect(within(lat).getByLabelText('Satz 1 Gewicht')).toBeTruthy()
    fireEvent.click(within(rudern).getByRole('button', { name: 'Satz 2 abhaken' }))
    fireEvent.click(within(rudern).getByRole('button', { name: 'Satz 3 abhaken' }))
    expect(card('Rudern').getAttribute('data-state')).toBe('done')
    expect(within(card('Rudern')).queryByLabelText('Satz 1 Gewicht')).toBeNull()
    expect(within(card('Rudern')).getByTestId('progress-line').textContent).toBe('3 Sätze erledigt · 12 × 50 kg')
    expect(card('Lat-Zug').getAttribute('data-state')).toBe('current')
    expect(within(card('Lat-Zug')).getByLabelText('Satz 1 Gewicht')).toBeTruthy()
    expect(screen.getByTestId('exercise-pos').textContent).toMatch(/Übung 2\/2/)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(String(Math.round((3 / 7) * 100)))
  })

  it('Übung ohne Gewicht: nur Wdh.-Feld, kein kg-Stepper; Umschalten im Training; Anzeige „Wdh.“', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Training starten' }))
    addFromPicker(['Serratusstütz', 'Lat-Zug'])
    const ser = card('Serratusstütz')
    expect(within(ser).queryByLabelText('Satz 1 Gewicht')).toBeNull()
    expect(within(ser).getByLabelText('Satz 1 Wiederholungen')).toBeTruthy()
    expect(within(ser).queryByRole('button', { name: /Gewicht plus/ })).toBeNull()
    expect(within(ser).getByRole('button', { name: 'Eine Wiederholung mehr' })).toBeTruthy()
    expect(within(ser).getByText('Wdh.', { selector: '.setrow-header span' })).toBeTruthy()
    fireEvent.change(within(ser).getByLabelText('Satz 1 Wiederholungen'), { target: { value: '12' } })
    fireEvent.click(within(ser).getByRole('button', { name: 'Satz 1 abhaken' }))
    expect(within(ser).getByTestId('set-1').textContent).toMatch(/12\s*Wdh\./)
    expect(active().entries[0].sets[0]).toMatchObject({ weightKg: null, reps: 12, done: true })

    // Lat-Zug im Training auf „ohne Gewicht“ umstellen (Bearbeiten-Modus)
    fireEvent.click(within(card('Lat-Zug')).getByRole('button', { expanded: false }))
    const lat = card('Lat-Zug')
    expect(within(lat).getByLabelText('Satz 1 Gewicht')).toBeTruthy()
    fireEvent.click(within(lat).getByRole('button', { name: 'Lat-Zug: Sätze bearbeiten' }))
    fireEvent.click(within(lat).getByRole('button', { name: 'Lat-Zug: ohne Gewicht' }))
    expect(data().exercises.find((e) => e.id === 'ex-lat-zug')?.noWeight).toBe(true)
    fireEvent.click(within(lat).getByRole('button', { name: 'Lat-Zug: Bearbeiten beenden' }))
    expect(within(lat).queryByLabelText('Satz 1 Gewicht')).toBeNull()
    expect(within(lat).getByTestId('source-line').textContent).toBe('Vorgabe: 4 × 10 (Fit7.11-Plan)')
  })

  it('Abschluss speichert nur abgehakte Sätze, zeigt Zusammenfassung; nächstes Training zeigt Letztes Mal (AK6)', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Training starten' }))
    addFromPicker(['Lat-Zug'])
    let c = card('Lat-Zug')
    fireEvent.change(within(c).getByLabelText('Satz 3 Gewicht'), { target: { value: '47,5' } })
    fireEvent.change(within(c).getByLabelText('Satz 3 Wiederholungen'), { target: { value: '8' } })
    for (const i of [1, 2, 3]) fireEvent.click(within(c).getByRole('button', { name: `Satz ${i} abhaken` }))
    fireEvent.click(screen.getByRole('button', { name: 'Abschließen' }))
    const sheet = screen.getByRole('dialog', { name: 'Training abschließen' })
    expect(sheet.textContent).toMatch(/1.280 kg/)
    expect(sheet.textContent).toMatch(/Nicht abgehakte Sätze werden verworfen/)
    fireEvent.click(within(sheet).getByRole('button', { name: 'Abschließen' }))

    expect(screen.getByTestId('finished-summary').textContent).toMatch(/3.*Sätze/)
    const done = data().workouts[0]
    expect(done.status).toBe('done')
    expect(done.entries[0].sets).toHaveLength(3)

    fireEvent.click(screen.getByRole('button', { name: 'Letztes Training wiederholen' }))
    c = card('Lat-Zug')
    expect(within(c).getByTestId('source-line').textContent).toMatch(/Letztes Mal: heute · 3 Sätze/)
    expect(within(c).getByTestId('set-3').querySelector('.set-last')!.textContent).toBe('8 × 47,5')
    expect((within(c).getByLabelText('Satz 3 Gewicht') as HTMLInputElement).value).toBe('47,5')
    expect(within(c).getAllByTestId(/^set-/)).toHaveLength(3)
  })

  it('Vorlage startet 8 Übungen in Planreihenfolge (AK24)', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Vorlage Oberkörper Fokus Schulter starten' }))
    expect(active().entries).toHaveLength(8)
    const names = screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'))
    expect(names).toEqual(['Lat-Zug', 'Butterfly Maschine', 'Reverse Butterfly', 'Facepulls', 'Rudern', 'Schrägbank Kurzhantel', 'Seitheben Kurzhantel', 'Adduktion'])
  })
})

describe('Timer (AK12, AK13)', () => {
  function startWithLat() {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Training starten' }))
    addFromPicker(['Lat-Zug'])
  }

  it('Presets, eigene Dauer, +30 s, Neu, Überspringen', () => {
    vi.useFakeTimers()
    startWithLat()
    fireEvent.click(within(screen.getByTestId('timer-idle')).getByRole('button', { name: '1:00' }))
    expect(data().timer?.durationSec).toBe(60)
    expect(screen.getByTestId('timer-remaining').textContent).toBe('1:00')
    fireEvent.click(screen.getByRole('button', { name: '+30 s' }))
    expect(data().timer?.durationSec).toBe(90)
    act(() => vi.advanceTimersByTime(10_000))
    expect(screen.getByTestId('timer-remaining').textContent).toBe('1:20')
    fireEvent.click(screen.getByRole('button', { name: 'Neu starten' }))
    expect(screen.getByTestId('timer-remaining').textContent).toBe('1:30')
    fireEvent.click(screen.getByRole('button', { name: 'Überspringen' }))
    expect(data().timer).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Eigene Dauer' }))
    fireEvent.change(screen.getByLabelText('Eigene Dauer in Sekunden'), { target: { value: '45' } })
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(data().timer?.durationSec).toBe(45)
  })

  it('Restzeit folgt dem gespeicherten Endzeitpunkt, auch nach Zeitsprung; Ablauf zeigt „Pause vorbei“', () => {
    vi.useFakeTimers()
    startWithLat()
    fireEvent.click(within(screen.getByTestId('timer-idle')).getByRole('button', { name: '1:30' }))
    // "App-Wechsel": 30 s vergehen ohne Ticks, dann Sichtbarkeitswechsel
    vi.setSystemTime(Date.now() + 30_000)
    fireEvent(document, new Event('visibilitychange'))
    expect(screen.getByTestId('timer-remaining').textContent).toBe('1:00')
    vi.setSystemTime(Date.now() + 61_000)
    fireEvent(document, new Event('visibilitychange'))
    expect(screen.getByTestId('timer-remaining').textContent).toBe('Pause vorbei')
    expect(data().timer?.signalled).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(data().timer).toBeNull()
  })

  it('Auto-Start lässt sich abschalten', () => {
    appStore.getState().updateSettings({ autoStartTimer: false })
    startWithLat()
    fireEvent.click(within(card('Lat-Zug')).getByRole('button', { name: 'Satz 1 abhaken' }))
    expect(data().timer).toBeNull()
  })
})

describe('Wiederaufnahme (AK11)', () => {
  it('rendert ein gespeichertes aktives Training samt Timer direkt', () => {
    const w: Workout = {
      id: 'w-act', startedAt: new Date().toISOString(), status: 'active', updatedAt: new Date().toISOString(),
      entries: [{ exerciseId: 'ex-lat-zug', sets: [{ id: 's1', weightKg: 47.5, reps: 9, done: true }, { id: 's2', weightKg: 47.5, reps: 9, done: false }] }],
    }
    appStore.setState((s) => ({
      data: { ...s.data, workouts: [w], timer: { startedAt: new Date().toISOString(), endsAt: new Date(Date.now() + 50_000).toISOString(), durationSec: 90, signalled: false } },
    }))
    render(<TrainingScreen />)
    const c = card('Lat-Zug')
    expect(within(c).getByRole('button', { name: 'Satz 1 zurücksetzen' })).toBeTruthy()
    expect((within(c).getByLabelText('Satz 2 Gewicht') as HTMLInputElement).value).toBe('47,5')
    expect(screen.getByTestId('timer-remaining').textContent).toMatch(/0:(49|50)/)
  })
})
