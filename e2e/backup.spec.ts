import { readFileSync } from 'node:fs'
import { expect, test } from '@playwright/test'
import { addExercises, card, openApp } from './helpers.ts'

test.describe('Sicherung', () => {
  test('Export enthält alle Daten; Import auf „Gerät B“ stellt sie her; Zusammenführen verliert nichts (AK21–AK23, AK28)', async ({ page, browser }) => {
    // Gerät A: ein Training erfassen
    await openApp(page)
    await page.getByRole('button', { name: 'Training starten' }).click()
    await addExercises(page, ['Lat-Zug'])
    const lat = card(page, 'Lat-Zug')
    await lat.getByRole('button', { name: 'Satz 1 abhaken' }).click()
    await page.getByRole('button', { name: 'Überspringen' }).click()
    await page.getByRole('button', { name: 'Abschließen' }).click()
    await page.getByRole('dialog', { name: 'Training abschließen' }).getByRole('button', { name: 'Abschließen' }).click()

    // Export
    await page.getByRole('button', { name: 'Mehr' }).click()
    const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Exportieren' }).click()])
    expect(download.suggestedFilename()).toMatch(/^fitness-backup-\d{4}-\d{2}-\d{2}\.json$/)
    const path = await download.path()
    const json = JSON.parse(readFileSync(path!, 'utf8'))
    expect(json.app).toBe('personal-fitness-app')
    expect(json.schemaVersion).toBe(4)
    expect(json.exercises).toHaveLength(21)
    expect(json.templates).toHaveLength(1)
    expect(json.workouts).toHaveLength(1)
    expect(json.settings.defaultRestSec).toBe(90)
    await expect(page.getByText('Letzte Sicherung: noch nie')).toHaveCount(0)

    // Ungültige Datei ändert nichts
    await page.getByLabel('Sicherungsdatei wählen').setInputFiles({ name: 'kaputt.json', mimeType: 'application/json', buffer: Buffer.from('{"foo":1}') })
    await expect(page.getByRole('alert')).toContainText('nicht aus dieser App')
    await page.getByRole('button', { name: 'OK' }).click()

    // Gerät B: frischer Browserkontext ohne Daten → Import → Alles ersetzen
    const ctxB = await browser.newContext({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true, locale: 'de-DE', acceptDownloads: true })
    const b = await ctxB.newPage()
    await openApp(b)
    await b.getByRole('button', { name: 'Verlauf' }).click()
    await expect(b.getByText('Noch kein Training abgeschlossen')).toBeVisible()
    await b.getByRole('button', { name: 'Mehr' }).click()
    await b.getByLabel('Sicherungsdatei wählen').setInputFiles(path!)
    await expect(b.getByTestId('import-preview')).toContainText('21 Übungen · 1 Vorlagen · 1 Trainings')
    await b.getByRole('button', { name: 'Alles ersetzen' }).click()
    const [preBackup] = await Promise.all([b.waitForEvent('download'), b.getByRole('alertdialog').getByRole('button', { name: 'Ersetzen' }).click()])
    expect(preBackup.suggestedFilename()).toMatch(/-vor-import\.json$/)
    await expect(b.getByRole('status')).toContainText('Alle Daten ersetzt')
    await b.getByRole('button', { name: 'Verlauf' }).click()
    await expect(b.getByRole('listitem')).toHaveCount(1)
    await b.getByRole('tab', { name: 'Statistik' }).click()
    await expect(b.getByRole('img', { name: 'Gewichtsverlauf' })).toBeVisible()
    // Nach Neuladen weiterhin vorhanden
    await b.reload()
    await b.getByRole('button', { name: 'Verlauf' }).click()
    await expect(b.getByRole('listitem')).toHaveCount(1)
    await ctxB.close()

    // Gerät A: Zusammenführen derselben Datei ergänzt nichts und verliert nichts
    await page.getByLabel('Sicherungsdatei wählen').setInputFiles(path!)
    await page.getByRole('button', { name: 'Zusammenführen' }).click()
    await expect(page.getByRole('status').last()).toContainText('0 Trainings neu')
    await page.getByRole('button', { name: 'Verlauf' }).click()
    await expect(page.getByRole('listitem')).toHaveCount(1)
  })
})
