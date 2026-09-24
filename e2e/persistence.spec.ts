import { expect, test } from '@playwright/test'
import { SEED_EXERCISE_COUNT } from '../src/domain/seed.ts'
import { addExercises, card, openApp, tab, waitForPrecache } from './helpers.ts'

test.describe('Persistenz, Offline, Timer', () => {
  test('laufendes Training samt Eingaben und Timer überlebt ein Neuladen (AK11)', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: 'Freies Training' }).click()
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
    await expect(page.getByRole('button', { name: 'Freies Training' })).toHaveCount(0)
  })

  test('App funktioniert offline nach dem ersten Laden (AK1)', async ({ page, context }) => {
    await openApp(page)
    await waitForPrecache(page)
    await context.setOffline(true)
    await page.reload()
    await expect(page.getByRole('button', { name: 'Freies Training' })).toBeVisible({ timeout: 15_000 })
    await tab(page, 'Übungen').click()
    await expect(page.getByRole('listitem')).toHaveCount(SEED_EXERCISE_COUNT)
    await context.setOffline(false)
  })

  test('Restzeit folgt dem gespeicherten Endzeitpunkt über einen Sichtbarkeitswechsel (AK12)', async ({ page }) => {
    await openApp(page)
    await page.clock.install()
    await page.getByRole('button', { name: 'Freies Training' }).click()
    await addExercises(page, ['Lat-Zug'])
    await page.getByRole('button', { name: 'Pausentimer' }).click()
    await page.getByTestId('timer-idle').getByRole('button', { name: '1:30' }).click()
    await expect(page.getByTestId('timer-remaining')).toHaveText('1:30')
    // „App verlassen“: Zeit läuft 30 s weiter, ohne dass Takt-Ticks laufen
    await page.clock.pauseAt(Date.now() + 30_000)
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
    await expect(page.getByTestId('timer-remaining')).toHaveText(/1:0[01]|0:59/)
    await page.clock.fastForward(65_000)
    await expect(page.getByTestId('timer-remaining')).toHaveText('Pause vorbei')
    await page.getByRole('button', { name: 'OK' }).click()
    await expect(page.getByTestId('timer')).toHaveCount(0)
  })

  test('Grafiken: nicht im Precache, einmal gesehen oder vorgeladen offline verfügbar (Schritt 19)', async ({ page, context }) => {
    await openApp(page)
    await waitForPrecache(page)
    const precached = await page.evaluate(async () => {
      const key = (await caches.keys()).find((k) => k.includes('precache'))!
      return (await (await caches.open(key)).keys()).map((r) => r.url)
    })
    expect(precached.some((u) => u.includes('/media/'))).toBe(false)

    // Deine verknüpften Übungen werden still vorgeladen (z. B. Lat-Zug → latzug-breit)
    const cached = (name: string) =>
      page.evaluate(async (n) => {
        if (!(await caches.keys()).includes('media-v1')) return false
        return (await (await caches.open('media-v1')).keys()).some((r) => r.url.endsWith(n))
      }, name)
    await expect.poll(() => cached('latzug-breit-3.svg'), { timeout: 20_000 }).toBe(true)

    // Bibliotheksübung ansehen → landet im Cache
    await tab(page, 'Übungen').click()
    await page.getByRole('radio', { name: 'Bibliothek' }).click()
    await page.getByRole('button', { name: 'Goblet Squat', exact: true }).click()
    await expect(page.getByRole('img', { name: /Bewegungsablauf Goblet Squat/ })).toBeVisible()
    await expect.poll(() => cached('goblet-squat-3.svg'), { timeout: 10_000 }).toBe(true)

    await context.setOffline(true)
    await page.reload()
    await tab(page, 'Übungen').click()
    await page.getByRole('radio', { name: 'Bibliothek' }).click()
    await page.getByRole('button', { name: 'Goblet Squat', exact: true }).click()
    await expect(page.getByRole('img', { name: /Bewegungsablauf Goblet Squat/ })).toBeVisible()
    await expect
      .poll(() => page.evaluate(() => [...document.querySelectorAll<HTMLImageElement>('img.media-frame')].every((i) => i.complete && i.naturalWidth > 0)))
      .toBe(true)
    await page.screenshot({ path: 'test-results/shots/50-media-offline.png' })
    await context.setOffline(false)
  })
})
