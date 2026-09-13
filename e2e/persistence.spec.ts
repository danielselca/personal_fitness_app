import { expect, test } from '@playwright/test'
import { addExercises, card, openApp, waitForPrecache } from './helpers.ts'

test.describe('Persistenz, Offline, Timer', () => {
  test('laufendes Training samt Eingaben und Timer überlebt ein Neuladen (AK11)', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: 'Training starten' }).click()
    await addExercises(page, ['Lat-Zug', 'Rudern'])
    const lat = card(page, 'Lat-Zug')
    await lat.getByLabel('Satz 1 Gewicht').fill('47,5')
    await lat.getByLabel('Satz 1 Wiederholungen').fill('9')
    await lat.getByRole('button', { name: 'Satz 1 abhaken' }).click()
    await lat.getByLabel('Satz 2 Gewicht').fill('52,5')
    await page.getByRole('button', { name: 'Sortieren' }).click()
    await page.getByRole('button', { name: 'Rudern nach oben' }).click()
    await page.getByRole('button', { name: 'Fertig' }).click()
    await page.getByRole('button', { name: '+30 s' }).click()
    await expect(page.getByTestId('timer-remaining')).toHaveText(/1:5\d|2:0\d/)
    await page.waitForTimeout(300)

    await page.reload()
    await expect(page.getByTestId('done-count')).toHaveText('1')
    const regions = page.getByRole('region')
    await expect(regions.first()).toHaveAttribute('aria-label', 'Rudern')
    // Rudern ist jetzt die aktuelle Übung (ausgeklappt), Lat-Zug eingeklappt → aufklappen
    const lat2 = card(page, 'Lat-Zug')
    await expect(lat2.getByTestId('progress-line')).toHaveText('1/4 Sätze · zuletzt 9 × 47,5 kg')
    await lat2.getByRole('button', { expanded: false }).click()
    await expect(lat2.getByRole('button', { name: 'Satz 1 zurücksetzen' })).toBeVisible()
    await expect(lat2.getByLabel('Satz 2 Gewicht')).toHaveValue('52,5')
    await expect(page.getByTestId('timer-remaining')).toHaveText(/1:5\d|1:4\d/)
    await expect(page.getByRole('button', { name: 'Training starten' })).toHaveCount(0)
  })

  test('App funktioniert offline nach dem ersten Laden (AK1)', async ({ page, context }) => {
    await openApp(page)
    await waitForPrecache(page)
    await context.setOffline(true)
    await page.reload()
    await expect(page.getByRole('button', { name: 'Training starten' })).toBeVisible({ timeout: 15_000 })
    await page.getByRole('button', { name: 'Übungen' }).click()
    await expect(page.getByRole('listitem')).toHaveCount(21)
    await context.setOffline(false)
  })

  test('Restzeit folgt dem gespeicherten Endzeitpunkt über einen Sichtbarkeitswechsel (AK12)', async ({ page }) => {
    await openApp(page)
    await page.clock.install()
    await page.getByRole('button', { name: 'Training starten' }).click()
    await addExercises(page, ['Lat-Zug'])
    await page.getByTestId('timer-idle').getByRole('button', { name: '1:30' }).click()
    await expect(page.getByTestId('timer-remaining')).toHaveText('1:30')
    // „App verlassen“: Zeit läuft 30 s weiter, ohne dass Takt-Ticks laufen
    await page.clock.pauseAt(Date.now() + 30_000)
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await expect(page.getByTestId('timer-remaining')).toHaveText(/1:0[01]|0:59/)
    await page.clock.fastForward(65_000)
    await expect(page.getByTestId('timer-remaining')).toHaveText('Pause vorbei')
    await page.getByRole('button', { name: 'OK' }).click()
    await expect(page.getByTestId('timer-idle')).toBeVisible()
  })
})
