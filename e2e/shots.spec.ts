import { test } from '@playwright/test'
import { card, openApp } from './helpers.ts'

const OUT = process.env.SHOT_DIR ?? 'test-results/shots'

test('Screenshots: gemischte Zustände, Sortiermodus, Dunkelmodus', async ({ page }) => {
  await openApp(page)
  await page.getByRole('button', { name: 'Vorlage Oberkörper Fokus Schulter starten' }).click()
  const lat = card(page, 'Lat-Zug')
  for (const i of [1, 2, 3, 4]) {
    await lat.getByRole('button', { name: `Satz ${i} abhaken` }).click()
    await page.getByRole('button', { name: 'Überspringen' }).click()
  }
  const bf = card(page, 'Butterfly Maschine')
  await bf.getByRole('button', { name: 'Satz 1 abhaken' }).click()
  await page.getByRole('button', { name: '+ Übung' }).click()
  const dialog = page.getByRole('dialog', { name: 'Übungen hinzufügen' })
  await dialog.getByRole('button', { name: /^Serratusstütz/ }).click()
  await dialog.getByRole('button', { name: '1 hinzufügen' }).click()
  await page.screenshot({ path: `${OUT}/10-mixed.png` })
  await page.getByRole('button', { name: 'Überspringen' }).click()
  await page.screenshot({ path: `${OUT}/11-mixed-full.png`, fullPage: true })
  const ser = card(page, 'Serratusstütz')
  await ser.getByRole('button', { expanded: false }).click()
  await ser.scrollIntoViewIfNeeded()
  await page.screenshot({ path: `${OUT}/12-noweight.png` })
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
