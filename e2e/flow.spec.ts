import { expect, test } from '@playwright/test'
import { addExercises, card, openApp } from './helpers.ts'

test.describe('Kernablauf in mobiler Ansicht (375 px)', () => {
  test('Übungen wählen, letzte Werte, Sätze erfassen, Timer, abschließen, Statistik', async ({ page }) => {
    await openApp(page)
    await page.screenshot({ path: 'test-results/shots/01-start.png' })

    // Start → Auswahl öffnet sich, Lat-Zug + Rudern hinzufügen
    await page.getByRole('button', { name: 'Training starten' }).click()
    await addExercises(page, ['Lat-Zug', 'Rudern'])
    const lat = card(page, 'Lat-Zug')
    await expect(lat.getByTestId('source-line')).toHaveText(/Vorgabe: 4 × 10 × 45 kg/)
    await expect(lat.getByLabel('Satz 1 Gewicht')).toHaveValue('45')
    await expect(lat.getByLabel('Satz 1 Wiederholungen')).toHaveValue('10')
    await page.screenshot({ path: 'test-results/shots/02-training.png', fullPage: true })

    // Gewicht per Stepper und Tastatur, Satz abhaken → Timer startet automatisch (90 s Übungspause)
    await lat.getByRole('button', { name: 'Gewicht plus 2,5 kg' }).click()
    await expect(lat.getByLabel('Satz 1 Gewicht')).toHaveValue('47,5')
    await lat.getByRole('button', { name: 'Satz 1 abhaken' }).click()
    const timer = page.getByTestId('timer')
    await expect(timer).toBeVisible()
    await expect(page.getByTestId('timer-remaining')).toHaveText(/1:(2|3)\d/)
    await page.screenshot({ path: 'test-results/shots/03-timer.png' })
    await page.getByRole('button', { name: '+30 s' }).click()
    await expect(page.getByTestId('timer-remaining')).toHaveText(/1:5\d|2:0\d/)
    await page.getByRole('button', { name: 'Überspringen' }).click()
    await expect(page.getByTestId('timer-idle')).toBeVisible()

    // Zweiter Satz mit Dezimaleingabe per Komma, dritter Satz per Punkt
    await lat.getByLabel('Satz 2 Gewicht').fill('47,5')
    await lat.getByRole('button', { name: 'Satz 2 abhaken' }).click()
    await lat.getByLabel('Satz 3 Gewicht').fill('50.0')
    await lat.getByLabel('Satz 3 Wiederholungen').fill('8')
    await lat.getByRole('button', { name: 'Satz 3 abhaken' }).click()
    await page.getByRole('button', { name: 'Überspringen' }).click()
    await expect(page.getByTestId('done-count')).toHaveText('3')

    // Abschließen → Zusammenfassung mit Volumen 47,5·10 + 47,5·10 + 50·8 = 1350
    await page.getByRole('button', { name: 'Abschließen' }).click()
    const sheet = page.getByRole('dialog', { name: 'Training abschließen' })
    await expect(sheet).toContainText('1.350 kg')
    await expect(sheet).toContainText('Nicht abgehakte Sätze werden verworfen')
    await sheet.getByRole('button', { name: 'Abschließen' }).click()
    await expect(page.getByTestId('finished-summary')).toContainText('3')
    await page.screenshot({ path: 'test-results/shots/04-summary.png' })

    // Nächstes Training zeigt „Letztes Mal“ je Satz
    await page.getByRole('button', { name: 'Letztes Training wieder' }).click()
    const lat2 = card(page, 'Lat-Zug')
    await expect(lat2.getByTestId('source-line')).toHaveText(/Letztes Mal: heute · 3 Sätze/)
    await expect(lat2.getByTestId('set-3').locator('.set-last')).toHaveText('8 × 50')
    await expect(lat2.getByLabel('Satz 3 Gewicht')).toHaveValue('50')
    await page.screenshot({ path: 'test-results/shots/05-letztes-mal.png', fullPage: true })
    // Ohne abgehakten Satz verwerfen
    await page.getByRole('button', { name: 'Abschließen' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Verwerfen' }).click()

    // Verlauf und Statistik
    await page.getByRole('button', { name: 'Verlauf' }).click()
    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByRole('listitem').first()).toContainText('1.350 kg')
    await page.getByRole('tab', { name: 'Statistik' }).click()
    await expect(page.getByRole('img', { name: /Trainings pro Woche/ })).toBeVisible()
    await expect(page.getByTestId('stats-weekly')).toContainText('aktuelle Woche: 1')
    await expect(page.getByRole('img', { name: 'Volumen je Training' })).toBeVisible()
    await expect(page.getByRole('img', { name: 'Gewichtsverlauf' })).toBeVisible()
    await page.screenshot({ path: 'test-results/shots/06-statistik.png', fullPage: true })
  })

  test('Übung im Training neu anlegen (AK4b) und Katalog-Suche (AK3)', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: 'Training starten' }).click()
    const dialog = page.getByRole('dialog', { name: 'Übungen hinzufügen' })
    await dialog.getByLabel('Übung suchen').fill('Beinpresse')
    await dialog.getByRole('button', { name: '„Beinpresse“ als neue Übung anlegen' }).click()
    await expect(card(page, 'Beinpresse')).toBeVisible()
    await expect(card(page, 'Beinpresse').getByTestId('source-line')).toHaveText('Keine früheren Werte')

    await page.getByRole('button', { name: 'Übungen' }).click()
    await expect(page.getByRole('listitem')).toHaveCount(22)
    await page.getByLabel('Übungen suchen').fill('28')
    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByRole('listitem').first()).toContainText('Lat-Zug')
    await page.getByLabel('Übungen suchen').fill('butterfly')
    await expect(page.getByRole('listitem')).toHaveCount(2)
  })

  test('Layout: keine horizontale Scrollleiste, Touchflächen ≥ 44 px, Eingaben ≥ 16 px (AK25)', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: 'Training starten' }).click()
    await addExercises(page, ['Lat-Zug'])
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    for (const name of ['Training', 'Übungen', 'Verlauf', 'Mehr']) {
      const box = await page.getByRole('button', { name, exact: true }).boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
    const check = await card(page, 'Lat-Zug').getByRole('button', { name: 'Satz 1 abhaken' }).boundingBox()
    expect(check!.width).toBeGreaterThanOrEqual(44)
    expect(check!.height).toBeGreaterThanOrEqual(44)
    const fontSize = await card(page, 'Lat-Zug').getByLabel('Satz 1 Gewicht').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    expect(fontSize).toBeGreaterThanOrEqual(16)
    const tab = await page.getByRole('navigation', { name: 'Hauptnavigation' }).boundingBox()
    expect(tab!.y + tab!.height).toBeLessThanOrEqual(812)
  })
})
