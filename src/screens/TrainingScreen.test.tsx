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
  for (const n of names) fireEvent.click(within(dialog).getByRole('button', { name: n }))
  fireEvent.click(within(dialog).getByRole('button', { name: `${names.length} hinzufügen` }))
}

describe('Kernablauf (AK5, AK7, AK9, AK10, AK13)', () => {
  it('Start ohne Historie: Lat-Zug mit 4 Plan-Sätzen, Abhaken startet Timer mit Übungspause 90 s', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
    // Leeres Training → Auswahl offen
    addFromPicker(['Lat-Zug'])
    const c = card('Lat-Zug')
    expect(within(c).getByTestId('source-line').textContent).toBe('Vorgabe: 4 × 10 × 45 kg')
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
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
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
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
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

    // Löschen nur im Bearbeiten-Modus (kein Papierkorb neben den Steppern), Haken dort ausgeblendet
    expect(within(c).queryByRole('button', { name: 'Satz 1 löschen' })).toBeNull()
    fireEvent.click(within(c).getByRole('button', { name: 'Lat-Zug: Sätze bearbeiten' }))
    expect(within(c).queryByRole('button', { name: 'Satz 1 abhaken' })).toBeNull()
    fireEvent.click(within(c).getByRole('button', { name: 'Satz 1 löschen' }))
    expect(active().entries[0].sets).toHaveLength(4)
    fireEvent.click(screen.getByRole('button', { name: 'Rückgängig' }))
    expect(active().entries[0].sets).toHaveLength(5)
    expect(active().entries[0].sets[0].weightKg).toBe(15)
    fireEvent.click(within(c).getByRole('button', { name: 'Satz 1 löschen' }))
    act(() => vi.advanceTimersByTime(5100))
    expect(screen.queryByRole('button', { name: 'Rückgängig' })).toBeNull()
    fireEvent.click(within(c).getByRole('button', { name: 'Satz 3 löschen' }))
    expect(active().entries[0].sets).toHaveLength(3)
    fireEvent.click(within(c).getByRole('button', { name: 'Lat-Zug: Bearbeiten beenden' }))
    expect(within(c).getByRole('button', { name: 'Satz 1 abhaken' })).toBeTruthy()
  })

  it('Umsortieren, Entfernen, Notiz, Übung im Training anlegen (AK10, AK4b, F5)', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
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
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
    addFromPicker(['Rudern', 'Lat-Zug'])
    const rudern = card('Rudern')
    const lat = card('Lat-Zug')
    expect(rudern.getAttribute('data-state')).toBe('current')
    expect(lat.getAttribute('data-state')).toBe('pending')
    expect(within(lat).queryByLabelText('Satz 1 Gewicht')).toBeNull() // eingeklappt
    expect(within(lat).getByTestId('progress-line').textContent).toBe('0/4 Sätze')
    expect(screen.getByTestId('exercise-pos').textContent).toMatch(/1\/2$/)

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
    expect(screen.getByTestId('exercise-pos').textContent).toMatch(/2\/2$/)
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe(String(Math.round((3 / 7) * 100)))
  })

  it('Übung ohne Gewicht: nur Wdh.-Feld, kein kg-Stepper; Umschalten im Training; Anzeige „Wdh.“', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
    addFromPicker(['Aufdehnen seitlich', 'Lat-Zug'])
    const ser = card('Aufdehnen seitlich')
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
    expect(within(lat).getByTestId('source-line').textContent).toBe('Vorgabe: 4 × 10')
  })

  it('Abschluss speichert nur abgehakte Sätze, zeigt Zusammenfassung; nächstes Training zeigt Letztes Mal (AK6)', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
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

    // Startseite: Woche mit heutigem Trainingstag, letztes Training kurz zusammengefasst
    const todayLabel = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'][new Date().getDay()]
    expect(screen.getByRole('img', { name: `Trainiert diese Woche: ${todayLabel}` })).toBeTruthy()
    expect(screen.getByTestId('last-workout').textContent).toMatch(/^3 Sätze · 1.280 kg · \d+ min$/)

    fireEvent.click(screen.getByRole('button', { name: 'Letztes wiederholen' }))
    c = card('Lat-Zug')
    expect(within(c).getByTestId('source-line').textContent).toMatch(/Letztes Mal: heute · 3 Sätze/)
    expect(within(c).getByTestId('set-3').querySelector('.set-last')!.textContent).toBe('8 × 47,5')
    expect((within(c).getByLabelText('Satz 3 Gewicht') as HTMLInputElement).value).toBe('47,5')
    expect(within(c).getAllByTestId(/^set-/)).toHaveLength(3)
  })

  it('ohne Vorlagen ist „Training starten“ der Hauptknopf', () => {
    appStore.setState({ data: { ...data(), templates: [] } })
    render(<TrainingScreen />)
    expect(screen.getByRole('button', { name: 'Training starten' }).className).toMatch(/btn-primary/)
    expect(screen.queryByRole('button', { name: 'Freies Training' })).toBeNull()
    expect(screen.getByRole('img', { name: 'Diese Woche noch nicht trainiert' })).toBeTruthy()
  })

  it('Vorlage startet 12 Übungen in Standard-Reihenfolge, erste ausgeklappt (AK24)', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Vorlage Oberkörper starten' }))
    expect(active().entries).toHaveLength(12)
    const names = screen.getAllByRole('region').map((r) => r.getAttribute('aria-label'))
    expect(names).toEqual(['Aufdehnen seitlich', 'Bein absenken (unterer Bauch)', 'Serratusstütz', 'Stütz auf Step', 'Adduktion', 'Tiefes V', 'Reverse Butterfly', 'Butterfly Maschine', 'Incline Frontraise', 'Schrägbank Kurzhantel', 'Rudern', 'Lat-Zug'])
    expect(card('Aufdehnen seitlich').getAttribute('data-state')).toBe('current')
    expect(within(card('Aufdehnen seitlich')).getByLabelText('Satz 1 Wiederholungen')).toBeTruthy()
  })
})

describe('Vorsortierung: ohne Gewicht zuerst', () => {
  it('Auswahl gruppiert ohne Gewicht zuerst und fügt in dieser Reihenfolge hinzu', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
    const dialog = screen.getByRole('dialog', { name: 'Übungen hinzufügen' })
    const items = within(dialog).getAllByRole('listitem')
    expect(items[0].getAttribute('data-group')).toBe('Ohne Gewicht')
    expect(items[0].textContent).toMatch(/^Aufdehnen seitlich/)
    const firstWeighted = items.findIndex((li) => li.getAttribute('data-group') === 'Mit Gewicht')
    expect(firstWeighted).toBe(8) // 8 Übungen ohne Gewicht (Tiefes V und Bear hug zählen mit Gewicht)
    expect(items[firstWeighted].textContent).toMatch(/^Adduktion/)
    expect(items.filter((li) => li.hasAttribute('data-group'))).toHaveLength(2)
    // Antippen in Reihenfolge Lat-Zug, Serratusstütz → Serratusstütz landet vorn
    addFromPicker(['Lat-Zug', 'Serratusstütz'])
    expect(active().entries.map((e) => e.exerciseId)).toEqual(['ex-serratusstuetz', 'ex-lat-zug'])
  })

  it('Sortiermodus: „Ohne Gewicht zuerst“, ganz nach oben, ganz nach unten', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Vorlage Oberkörper starten' }))
    fireEvent.click(screen.getByRole('button', { name: '+ Übung' }))
    addFromPicker(['Uppercut Tuch'])
    expect(active().entries.at(-1)!.exerciseId).toBe('ex-uppercut-tuch')
    fireEvent.click(screen.getByRole('button', { name: 'Sortieren' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ohne Gewicht zuerst' }))
    let ids = active().entries.map((e) => e.exerciseId)
    expect(ids.slice(0, 5)).toEqual(['ex-aufdehnen-seitlich', 'ex-bein-absenken', 'ex-serratusstuetz', 'ex-stuetz-auf-step', 'ex-uppercut-tuch'])
    expect(ids.slice(5)).toEqual(['ex-adduktion', 'ex-tiefes-v', 'ex-reverse-butterfly', 'ex-butterfly-maschine', 'ex-incline-frontraise', 'ex-schraegbank-kurzhantel', 'ex-rudern', 'ex-lat-zug'])

    fireEvent.click(screen.getByRole('button', { name: 'Lat-Zug ganz nach oben' }))
    ids = active().entries.map((e) => e.exerciseId)
    expect(ids[0]).toBe('ex-lat-zug')
    expect(ids[1]).toBe('ex-aufdehnen-seitlich')
    expect(screen.getByRole('button', { name: 'Lat-Zug ganz nach oben' }).hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Lat-Zug ganz nach unten' }))
    ids = active().entries.map((e) => e.exerciseId)
    expect(ids.at(-1)).toBe('ex-lat-zug')
    expect(ids[0]).toBe('ex-aufdehnen-seitlich')
    expect(ids).toHaveLength(13)
  })
})

describe('Halteübung als Donut (Serratusstütz: 4 × 60 s, 60 s Pause)', () => {
  it('Start → 60 s halten → Satz abgehakt → Pause → nächster Satz; Überspringen und Abschluss', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-13T10:00:00Z'))
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
    addFromPicker(['Serratusstütz'])
    const c = card('Serratusstütz')
    const donut = within(c).getByTestId('hold-donut')
    expect(donut.getAttribute('data-phase')).toBe('idle')
    expect(within(c).queryByLabelText('Satz 1 Wiederholungen')).toBeNull()
    expect(within(c).getByTestId('hold-remaining').textContent).toBe('1:00')
    // 4 Arbeits- und 3 Pausenstücke
    expect(within(c).getAllByTestId(/^hold-seg-work-/)).toHaveLength(4)
    expect(within(c).getAllByTestId(/^hold-seg-rest-/)).toHaveLength(3)

    fireEvent.click(within(c).getByRole('button', { name: 'Halten starten' }))
    expect(donut.getAttribute('data-phase')).toBe('work')
    act(() => vi.advanceTimersByTime(30_000))
    expect(within(c).getByTestId('hold-remaining').textContent).toBe('0:30')
    expect(within(c).getByTestId('hold-seg-work-0').getAttribute('data-state')).toBe('current')

    // Pause per Tipp in die Mitte, dann weiter
    fireEvent.click(within(c).getByRole('button', { name: 'Pausieren' }))
    act(() => vi.advanceTimersByTime(10_000))
    expect(within(c).getByTestId('hold-remaining').textContent).toBe('0:30')
    fireEvent.click(within(c).getByRole('button', { name: 'Weiter' }))

    act(() => vi.advanceTimersByTime(30_500))
    expect(active().entries[0].sets[0]).toMatchObject({ done: true, reps: 60, weightKg: null })
    expect(within(c).getByTestId('hold-donut').getAttribute('data-phase')).toBe('rest')
    expect(within(c).getByTestId('hold-seg-work-0').getAttribute('data-state')).toBe('done')
    expect(within(c).getByTestId('hold-seg-rest-0').getAttribute('data-state')).toBe('current')
    expect(data().timer).toBeNull() // kein zusätzlicher Pausentimer unten

    // Pause überspringen → Satz 2 läuft
    fireEvent.click(within(c).getByRole('button', { name: 'Pause überspringen' }))
    expect(within(c).getByTestId('hold-donut').getAttribute('data-phase')).toBe('work')
    expect(active().entries[0].hold?.setIndex).toBe(1)

    // App-Wechsel: 5 Minuten vergehen auf einmal → Rest läuft komplett durch
    act(() => {
      vi.setSystemTime(Date.now() + 5 * 60_000)
      vi.advanceTimersByTime(300)
    })
    expect(active().entries[0].sets.every((s) => s.done)).toBe(true)
    expect(active().entries[0].hold).toBeUndefined()
    expect(card('Serratusstütz').getAttribute('data-state')).toBe('done')
    expect(within(card('Serratusstütz')).getByTestId('progress-line').textContent).toBe('4 Sätze erledigt · 60 s')
  })

  it('„Satz fertig“ beendet die Haltephase sofort; „− Satz“ entfernt den letzten offenen Satz', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
    addFromPicker(['Stütz auf Step'])
    const c = card('Stütz auf Step')
    fireEvent.click(within(c).getByRole('button', { name: 'Letzten offenen Satz entfernen' }))
    expect(active().entries[0].sets).toHaveLength(3)
    fireEvent.click(within(c).getByRole('button', { name: 'Halten starten' }))
    fireEvent.click(within(c).getByRole('button', { name: 'Satz fertig' }))
    expect(active().entries[0].sets[0].done).toBe(true)
    expect(active().entries[0].hold?.phase).toBe('rest')
    fireEvent.click(within(c).getByRole('button', { name: 'Abbrechen' }))
    expect(active().entries[0].hold).toBeUndefined()
    expect(active().entries[0].sets[0].done).toBe(true)
  })
})

describe('Timer (AK12, AK13)', () => {
  function startWithLat() {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
    addFromPicker(['Lat-Zug'])
  }

  it('Presets, eigene Dauer, +30 s, Neu, Überspringen', () => {
    vi.useFakeTimers()
    startWithLat()
    // eingeklappt, bis die Pausenauswahl im Kopf geöffnet wird
    expect(screen.queryByTestId('timer-idle')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Pausentimer' }))
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
    expect(screen.queryByTestId('timer-idle')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Pausentimer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Pausenauswahl schließen' }))
    expect(screen.queryByTestId('timer-idle')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Pausentimer' }))
    fireEvent.click(screen.getByRole('button', { name: 'Eigene Dauer' }))
    fireEvent.change(screen.getByLabelText('Eigene Dauer in Sekunden'), { target: { value: '45' } })
    fireEvent.click(screen.getByRole('button', { name: 'Start' }))
    expect(data().timer?.durationSec).toBe(45)
  })

  it('Restzeit folgt dem gespeicherten Endzeitpunkt, auch nach Zeitsprung; Ablauf zeigt „Pause vorbei“', () => {
    vi.useFakeTimers()
    startWithLat()
    fireEvent.click(screen.getByRole('button', { name: 'Pausentimer' }))
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

describe('Übungsauswahl mit Bibliothek (Schritt 17)', () => {
  it('Ausrüstungs-Chips filtern; Bibliothekstreffer werden beim Hinzufügen übernommen', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Freies Training' }))
    const dialog = screen.getByRole('dialog', { name: 'Übungen hinzufügen' })
    fireEvent.click(within(within(dialog).getByRole('group', { name: 'Ausrüstung' })).getByRole('button', { name: 'Kettlebell' }))
    // Keine eigene Kettlebell-Übung, aber Treffer aus der Bibliothek
    const lib = within(dialog).getByRole('list', { name: 'Aus der Bibliothek' })
    expect(within(lib).getAllByRole('listitem')[0].getAttribute('data-group')).toBe('Aus der Bibliothek')
    expect(within(lib).getByRole('button', { name: 'Kettlebell-Swing' })).toBeTruthy()

    fireEvent.click(within(within(dialog).getByRole('group', { name: 'Ausrüstung' })).getByRole('button', { name: 'Alle' }))
    fireEvent.change(within(dialog).getByLabelText('Übung suchen'), { target: { value: 'face' } })
    // Face Pull ist mit „Facepulls“ verknüpft → nur die eigene Übung, kein Doppel aus der Bibliothek
    expect(within(dialog).getByRole('button', { name: 'Facepulls' })).toBeTruthy()
    const libFace = within(dialog).getByRole('list', { name: 'Aus der Bibliothek' })
    expect(within(libFace).queryByRole('button', { name: 'Face Pull' })).toBeNull()
    expect(within(libFace).getByRole('button', { name: 'Face Pull mit Band' })).toBeTruthy()

    fireEvent.change(within(dialog).getByLabelText('Übung suchen'), { target: { value: 'swing' } })
    addFromPicker(['Kettlebell-Swing'])
    expect(active().entries.map((e) => e.exerciseId)).toEqual(['ex-lib-kettlebell-swing'])
    expect(data().exercises.find((e) => e.id === 'ex-lib-kettlebell-swing')?.libraryId).toBe('kettlebell-swing')
    expect(card('Kettlebell-Swing')).toBeTruthy()
  })
})

describe('Übung tauschen und Schonen im Training (Schritt 18b)', () => {
  const AT = '2026-09-01T00:00:00.000Z'

  it('„Übung tauschen“ unter Bearbeiten: nur heute oder auch in der Vorlage', () => {
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: 'Vorlage Oberkörper starten' }))
    const lat = card('Lat-Zug')
    fireEvent.click(within(lat).getByRole('button', { expanded: false }))
    fireEvent.click(within(lat).getByRole('button', { name: 'Lat-Zug: Sätze bearbeiten' }))
    fireEvent.click(within(lat).getByRole('button', { name: 'Lat-Zug tauschen' }))
    const sheet = screen.getByRole('dialog', { name: '„Lat-Zug“ tauschen' })
    fireEvent.click(within(sheet).getByRole('radio', { name: 'Auch in der Vorlage' }))
    fireEvent.click(within(within(sheet).getByRole('list', { name: 'Aus der Bibliothek' })).getByRole('button', { name: 'Latzug eng' }))
    expect(active().entries.at(-1)?.exerciseId).toBe('ex-lib-latzug-eng')
    expect(data().templates[0].entries.at(-1)?.exerciseId).toBe('ex-lib-latzug-eng')
    expect(card('Latzug eng')).toBeTruthy()
  })

  it('geschonte Schulter: Karte markiert, Alternative wählen, heute auslassen, trotzdem', () => {
    appStore.setState({ data: { ...data(), restrictions: [{ id: 'rs', bodyParts: ['schulter'], muscles: [], createdAt: AT, updatedAt: AT }] } })
    render(<TrainingScreen />)
    expect(screen.getByRole('button', { name: 'Vorlage Oberkörper starten' }).textContent).toContain('⚠ 4 geschont')
    fireEvent.click(screen.getByRole('button', { name: 'Vorlage Oberkörper starten' }))
    const open = (name: string) => {
      const c = card(name)
      const toggle = within(c).queryByRole('button', { expanded: false })
      if (toggle) fireEvent.click(toggle)
      return c
    }
    // Alternative (nur heute) – Vorschläge ohne Schulterbelastung
    const rb = open('Reverse Butterfly')
    expect(within(rb).getByRole('note').textContent).toContain('Belastet Schulter')
    fireEvent.click(within(rb).getByRole('button', { name: 'Alternative' }))
    const sheet = screen.getByRole('dialog', { name: '„Reverse Butterfly“ tauschen' })
    expect(within(sheet).getByRole('radio', { name: 'Nur heute' }).getAttribute('aria-checked')).toBe('true')
    expect(sheet.textContent).toContain('ohne Übungen, die geschonte Bereiche belasten')
    fireEvent.click(within(sheet).getByRole('button', { name: 'Schließen' }))
    // Heute auslassen
    fireEvent.click(within(open('Butterfly Maschine')).getByRole('button', { name: 'Heute auslassen' }))
    expect(active().entries.some((e) => e.exerciseId === 'ex-butterfly-maschine')).toBe(false)
    // Trotzdem: Hinweis verschwindet, Übung bleibt
    const lat = open('Lat-Zug')
    fireEvent.click(within(lat).getByRole('button', { name: 'Trotzdem' }))
    expect(within(lat).queryByRole('note')).toBeNull()
    expect(data().templates[0].entries.some((e) => e.exerciseId === 'ex-butterfly-maschine')).toBe(true) // Vorlage unverändert
  })
})

describe('Coach: Steigerung im Training (Schritt 20a)', () => {
  function programWithHistory(sets: [number, number][], rating?: 'leicht' | 'passend' | 'schwer') {
    const p = appStore.getState().installProgram('builtin-ganzkoerper', { goal: 'muskelaufbau', physioBlock: false })!
    const at = new Date(Date.now() - 2 * 86_400_000).toISOString()
    const w: Workout = {
      id: 'w-hist', startedAt: at, finishedAt: at, status: 'done', updatedAt: at, programId: p.id, programDayId: p.days[1].id,
      entries: [{ exerciseId: 'ex-lat-zug', rating, sets: sets.map(([kg, r], i) => ({ id: `h${i}`, weightKg: kg, reps: r, done: true })) }],
    }
    appStore.setState({ data: { ...data(), workouts: [w] } })
    return p
  }

  it('alle Sätze am oberen Ende → Hinweis mit Gewichtssteigerung, „Wie letztes Mal“ setzt zurück', () => {
    programWithHistory([[45, 12], [45, 12], [45, 12]])
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Nächstes: Ganzkörper A/ }))
    const lat = card('Lat-Zug')
    if (within(lat).queryByRole('button', { expanded: false })) fireEvent.click(within(lat).getByRole('button', { expanded: false }))
    expect(within(lat).getByRole('note', { name: 'Coach' }).textContent).toContain('↑ 47,5 kg – letztes Mal 3 × 12 × 45 kg')
    expect((within(lat).getByLabelText('Satz 1 Gewicht') as HTMLInputElement).value).toBe('47,5')
    expect((within(lat).getByLabelText('Satz 1 Wiederholungen') as HTMLInputElement).value).toBe('8')
    fireEvent.click(within(lat).getByRole('button', { name: 'Wie letztes Mal' }))
    expect((within(lat).getByLabelText('Satz 1 Gewicht') as HTMLInputElement).value).toBe('45')
    expect((within(lat).getByLabelText('Satz 1 Wiederholungen') as HTMLInputElement).value).toBe('12')
    expect(within(lat).queryByRole('note', { name: 'Coach' })).toBeNull()
  })

  it('Coach abgeschaltet → wie bisher letzte Werte, kein Hinweis', () => {
    programWithHistory([[45, 12], [45, 12], [45, 12]])
    appStore.getState().updateSettings({ coachProgression: false })
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Nächstes: Ganzkörper A/ }))
    const lat = card('Lat-Zug')
    if (within(lat).queryByRole('button', { expanded: false })) fireEvent.click(within(lat).getByRole('button', { expanded: false }))
    expect(within(lat).queryByRole('note', { name: 'Coach' })).toBeNull()
    expect((within(lat).getByLabelText('Satz 1 Gewicht') as HTMLInputElement).value).toBe('45')
  })

  it("Abschluss: „Wie war's?“ je Übung mit Zielbereich, danach neue Bestwerte", () => {
    programWithHistory([[45, 12], [45, 12], [45, 12]])
    render(<TrainingScreen />)
    fireEvent.click(screen.getByRole('button', { name: /Nächstes: Ganzkörper A/ }))
    const lat = card('Lat-Zug')
    if (within(lat).queryByRole('button', { expanded: false })) fireEvent.click(within(lat).getByRole('button', { expanded: false }))
    fireEvent.click(within(lat).getByRole('button', { name: 'Satz 1 abhaken' }))
    fireEvent.click(screen.getByRole('button', { name: 'Abschließen' }))
    const sheet = screen.getByRole('dialog', { name: 'Training abschließen' })
    fireEvent.click(within(within(sheet).getByRole('group', { name: 'Wie war Lat-Zug?' })).getByRole('button', { name: 'schwer' }))
    expect(active().entries.find((e) => e.exerciseId === 'ex-lat-zug')?.rating).toBe('schwer')
    fireEvent.click(within(sheet).getByRole('button', { name: 'Abschließen' }))
    expect(screen.getByTestId('new-records').textContent).toContain('Lat-Zug: 47,5 kg (bisher 45 kg)')
  })
})
