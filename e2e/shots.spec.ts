import { test } from '@playwright/test'
import { card, openApp } from './helpers.ts'

const OUT = process.env.SHOT_DIR ?? 'test-results/shots'

test('Screenshots: gemischte Zustände, Sortiermodus, Dunkelmodus', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Vorlage Oberkörper starten' }).click()
  const first = card(page, 'Aufdehnen seitlich')
  for (const i of [1, 2, 3]) {
    await first.getByLabel(`Satz ${i} Wiederholungen`).fill('12')
    await first.getByRole('button', { name: `Satz ${i} abhaken` }).click()
    await page.getByRole('button', { name: 'Überspringen' }).click()
  }
  const second = card(page, 'Bein absenken (unterer Bauch)')
  await second.getByLabel('Satz 1 Wiederholungen').fill('15')
  await second.getByRole('button', { name: 'Satz 1 abhaken' }).click()
  await page.getByRole('button', { name: '+ Übung' }).click()
  const dialog = page.getByRole('dialog', { name: 'Übungen hinzufügen' })
  await dialog.getByRole('button', { name: /^Kreuzheben/ }).click()
  await dialog.getByRole('button', { name: '1 hinzufügen' }).click()
  await page.screenshot({ path: `${OUT}/10-mixed.png` })
  await page.getByRole('button', { name: 'Überspringen' }).click()
  await page.screenshot({ path: `${OUT}/11-mixed-full.png`, fullPage: true })
  const lat = card(page, 'Lat-Zug')
  await lat.getByRole('button', { expanded: false }).click()
  await lat.scrollIntoViewIfNeeded()
  await page.waitForTimeout(250)
  await page.screenshot({ path: `${OUT}/12-weighted.png` })
  await page.getByRole('button', { name: 'Sortieren' }).click()
  await page.screenshot({ path: `${OUT}/13-sort.png` })
  await page.getByRole('button', { name: 'Fertig' }).click()
  await page.emulateMedia({ colorScheme: 'dark' })
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: `${OUT}/14-dark.png` })
})

test('Screenshot: Übungsauswahl mit Gruppen', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Training starten' }).click()
  await page.getByRole('dialog', { name: 'Übungen hinzufügen' }).waitFor()
  await page.screenshot({ path: `${OUT}/15-picker.png` })
})

test('Screenshots: Übungen, Verlauf, Mehr (dunkel)', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Dunklen Modus einschalten' }).click()
  await page.getByRole('button', { name: 'Übungen' }).click()
  await page.screenshot({ path: `${OUT}/16-exercises-dark.png` })
  await page.getByRole('button', { name: 'Lat-Zug' }).click()
  await page.screenshot({ path: `${OUT}/17-exercise-detail-dark.png` })
  await page.getByRole('button', { name: 'Mehr' }).click()
  await page.screenshot({ path: `${OUT}/18-more-dark.png` })
  await page.getByRole('button', { name: 'Hellen Modus einschalten' }).click()
  await page.screenshot({ path: `${OUT}/19-more-light.png` })
})
