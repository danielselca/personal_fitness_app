import { expect, test } from '@playwright/test'
import { SEED_EXERCISE_COUNT } from '../src/domain/seed.ts'
import { addExercises, card, openApp, tab } from './helpers.ts'

test.describe('Kernablauf in mobiler Ansicht (375 px)', () => {
  test('Übungen wählen, letzte Werte, Sätze erfassen, Timer, abschließen, Statistik', async ({ page }) => {
    await openApp(page)
    await page.screenshot({ path: 'test-results/shots/01-start.png' })

    // Start → Auswahl öffnet sich, Lat-Zug + Rudern hinzufügen
    await page.getByRole('button', { name: 'Freies Training' }).click()
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
    await expect(page.getByTestId('timer')).toHaveCount(0)

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
    await page.getByRole('button', { name: 'Letztes wiederholen' }).click()
    const lat2 = card(page, 'Lat-Zug')
    await expect(lat2.getByTestId('source-line')).toHaveText(/Letztes Mal: heute · 3 Sätze/)
    await expect(lat2.getByTestId('set-3').locator('.set-last')).toHaveText('8 × 50')
    await expect(lat2.getByLabel('Satz 3 Gewicht')).toHaveValue('50')
    await page.screenshot({ path: 'test-results/shots/05-letztes-mal.png', fullPage: true })
    // Ohne abgehakten Satz verwerfen
    await page.getByRole('button', { name: 'Abschließen' }).click()
    await page.getByRole('alertdialog').getByRole('button', { name: 'Verwerfen' }).click()

    // Verlauf und Statistik
    await tab(page, 'Verlauf').click()
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
    await page.getByRole('button', { name: 'Freies Training' }).click()
    const dialog = page.getByRole('dialog', { name: 'Übungen hinzufügen' })
    await dialog.getByLabel('Übung suchen').fill('Beinpresse')
    await dialog.getByRole('button', { name: '„Beinpresse“ als neue Übung anlegen' }).click()
    await expect(card(page, 'Beinpresse')).toBeVisible()
    await expect(card(page, 'Beinpresse').getByTestId('source-line')).toHaveText('Keine früheren Werte')

    await tab(page, 'Übungen').click()
    await expect(page.getByRole('listitem')).toHaveCount(SEED_EXERCISE_COUNT + 1)
    await page.getByLabel('Übungen suchen').fill('28')
    await expect(page.getByRole('listitem')).toHaveCount(1)
    await expect(page.getByRole('listitem').first()).toContainText('Lat-Zug')
    await page.getByLabel('Übungen suchen').fill('butterfly')
    await expect(page.getByRole('listitem')).toHaveCount(2)
  })

  test('Layout: keine horizontale Scrollleiste, Touchflächen ≥ 44 px, Eingaben ≥ 16 px (AK25)', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: 'Freies Training' }).click()
    await addExercises(page, ['Lat-Zug'])
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    for (const name of ['Training', 'Übungen', 'Coach', 'Verlauf', 'Mehr'] as const) {
      const box = await tab(page, name).boundingBox()
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
    const check = await card(page, 'Lat-Zug').getByRole('button', { name: 'Satz 1 abhaken' }).boundingBox()
    expect(check!.width).toBeGreaterThanOrEqual(44)
    expect(check!.height).toBeGreaterThanOrEqual(44)
    const fontSize = await card(page, 'Lat-Zug').getByLabel('Satz 1 Gewicht').evaluate((el) => parseFloat(getComputedStyle(el).fontSize))
    expect(fontSize).toBeGreaterThanOrEqual(16)
    const nav = await page.getByRole('navigation', { name: 'Hauptnavigation' }).boundingBox()
    expect(nav!.y + nav!.height).toBeLessThanOrEqual(812)
  })

  test('Bibliothek: Seilzug filtern, übernehmen, im Training nutzen; verknüpfte Tipps (Schritt 17)', async ({ page }) => {
    await openApp(page)
    await tab(page, 'Übungen').click()
    await page.getByRole('radio', { name: 'Bibliothek' }).click()
    await page.getByRole('group', { name: 'Ausrüstung' }).getByRole('button', { name: 'Seilzug', exact: true }).click()
    const lib = page.getByRole('list', { name: 'Bibliothek' })
    await expect(lib.getByRole('button', { name: 'Face Pull', exact: true })).toContainText('In Meine')
    await lib.getByRole('button', { name: 'Trizepsdrücken am Kabel', exact: true }).click()
    await expect(page.getByRole('list', { name: 'Ausführung' })).toBeVisible()
    await page.getByRole('button', { name: 'Zu meinen Übungen' }).click()
    await expect(page.getByRole('button', { name: 'In Meine Übungen öffnen' })).toBeVisible()

    await tab(page, 'Training').click()
    await page.getByRole('button', { name: 'Freies Training' }).click()
    await page.getByRole('dialog', { name: 'Übungen hinzufügen' }).getByLabel('Übung suchen').fill('trizeps')
    await addExercises(page, ['Trizepsdrücken am Kabel'])
    await expect(card(page, 'Trizepsdrücken am Kabel')).toBeVisible()

    await tab(page, 'Übungen').click()
    await page.getByRole('radio', { name: 'Meine' }).click()
    await page.getByRole('group', { name: 'Ausrüstung' }).getByRole('button', { name: 'Alle', exact: true }).click()
    await page.getByRole('button', { name: 'Lat-Zug', exact: true }).click()
    await expect(page.getByRole('list', { name: 'Ausführung' })).toContainText('Schulterblätter')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('Programm: Ganzkörper übernehmen, Nächstes starten und abschließen, B folgt; duplizieren und Tag ändern (Schritt 18)', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: /^Programme/ }).click()
    await page.getByRole('listitem', { name: 'Vorschlag Ganzkörper A/B' }).getByRole('button', { name: 'Übernehmen …' }).click()
    await page.getByRole('dialog', { name: 'Ganzkörper A/B übernehmen' }).getByRole('button', { name: 'Übernehmen und aktivieren' }).click()

    const hero = page.getByRole('region', { name: 'Programm Ganzkörper A/B' })
    await expect(hero.getByRole('button', { name: /Nächstes: Ganzkörper A/ })).toBeVisible()
    await hero.getByRole('button', { name: /Nächstes: Ganzkörper A/ }).click()
    const lat = card(page, 'Lat-Zug')
    await lat.getByRole('button', { expanded: false }).click()
    await expect(lat.getByTestId('source-line')).toContainText('Ziel 3 × 8–12')
    await lat.getByRole('button', { name: 'Satz 1 abhaken' }).click()
    await page.getByRole('button', { name: 'Abschließen' }).click()
    await page.getByRole('dialog', { name: 'Training abschließen' }).getByRole('button', { name: 'Abschließen' }).click()
    await page.getByRole('button', { name: 'OK' }).click()
    await expect(hero.getByRole('button', { name: /Nächstes: Ganzkörper B/ })).toBeVisible()
    await expect(hero).toContainText('1/3')

    // Duplizieren und einen Tag anpassen
    await hero.getByRole('button', { name: 'Programme' }).click()
    await page.getByRole('listitem', { name: 'Ganzkörper A/B' }).getByRole('button', { name: 'Duplizieren' }).click()
    const editor = page.getByRole('dialog', { name: 'Programm bearbeiten' })
    await editor.getByLabel('Programmname').fill('Ganzkörper ohne Schulter')
    await editor.getByRole('button', { name: 'Übungen von Ganzkörper A bearbeiten' }).click()
    const day = page.getByRole('dialog', { name: 'Tag bearbeiten' })
    await day.getByRole('button', { name: 'Schulterpresse (Maschine) entfernen' }).click()
    await day.getByRole('button', { name: 'Speichern' }).click()
    await editor.getByRole('button', { name: 'Fertig' }).click()
    const copy = page.getByRole('listitem', { name: 'Ganzkörper ohne Schulter' })
    await copy.getByRole('button', { name: 'Aktivieren' }).click()
    await page.getByRole('button', { name: '‹ Training' }).click()
    const hero2 = page.getByRole('region', { name: 'Programm Ganzkörper ohne Schulter' })
    await hero2.getByRole('button', { name: /Nächstes: Ganzkörper A/ }).click()
    await expect(card(page, 'Lat-Zug')).toBeVisible()
    await expect(page.getByRole('region', { name: 'Schulterpresse (Maschine)' })).toHaveCount(0)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('Schonen: Schulter schonen → Karte markiert → Alternative wählen (Schritt 18b)', async ({ page }) => {
    await openApp(page)
    await tab(page, 'Mehr').click()
    await page.getByRole('button', { name: '+ Bereich schonen' }).click()
    const sheet = page.getByRole('dialog', { name: 'Bereich schonen' })
    await sheet.getByRole('group', { name: 'Körperbereiche' }).getByRole('button', { name: 'Schulter', exact: true }).click()
    await sheet.getByRole('button', { name: 'Schonen', exact: true }).click()
    await expect(page.getByRole('list', { name: 'Geschonte Bereiche' })).toContainText('Schulter')

    await tab(page, 'Training').click()
    await expect(page.getByRole('button', { name: 'Vorlage Oberkörper starten' })).toContainText('4 geschont')
    await page.getByRole('button', { name: 'Vorlage Oberkörper starten' }).click()
    const rb = card(page, 'Reverse Butterfly')
    await rb.getByRole('button', { expanded: false }).click()
    await expect(rb.getByRole('note')).toContainText('Belastet Schulter')
    await rb.getByRole('button', { name: 'Alternative' }).click()
    const swap = page.getByRole('dialog', { name: '„Reverse Butterfly“ tauschen' })
    await swap.getByLabel('Übung zum Tauschen suchen').fill('rudern einarmig')
    await swap.getByRole('button', { name: 'Rudern einarmig (Kurzhantel)' }).click()
    await expect(card(page, 'Rudern einarmig (Kurzhantel)')).toBeVisible()
    await expect(page.getByRole('region', { name: 'Reverse Butterfly' })).toHaveCount(0)
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
  })

  test('Coach: oberes Ende erreicht → nächstes Mal Gewicht erhöht, „Wie letztes Mal“ (Schritt 20a)', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: /^Programme/ }).click()
    await page.getByRole('listitem', { name: 'Vorschlag Ganzkörper A/B' }).getByRole('button', { name: 'Übernehmen …' }).click()
    await page.getByRole('dialog', { name: 'Ganzkörper A/B übernehmen' }).getByRole('button', { name: 'Übernehmen und aktivieren' }).click()
    const hero = page.getByRole('region', { name: 'Programm Ganzkörper A/B' })
    await hero.getByRole('button', { name: /Nächstes: Ganzkörper A/ }).click()

    const lat = card(page, 'Lat-Zug')
    await lat.getByRole('button', { expanded: false }).click()
    await expect(lat.getByRole('note', { name: 'Coach' })).toContainText('Erstes Mal')
    for (const i of [1, 2, 3]) {
      await lat.getByLabel(`Satz ${i} Wiederholungen`).fill('12')
      await lat.getByRole('button', { name: `Satz ${i} abhaken` }).click()
    }
    await page.getByRole('button', { name: 'Abschließen' }).click()
    await page.getByRole('dialog', { name: 'Training abschließen' }).getByRole('button', { name: 'Abschließen' }).click()
    await page.getByRole('button', { name: 'OK' }).click()

    await hero.getByRole('button', { name: 'Anderen Tag wählen' }).click()
    await page.getByRole('button', { name: 'Ganzkörper A starten' }).click()
    const lat2 = card(page, 'Lat-Zug')
    await lat2.getByRole('button', { expanded: false }).click()
    await expect(lat2.getByRole('note', { name: 'Coach' })).toContainText('↑ 47,5 kg – letztes Mal 3 × 12 × 45 kg')
    await expect(lat2.getByLabel('Satz 1 Gewicht')).toHaveValue('47,5')
    await page.screenshot({ path: 'test-results/shots/60-coach-hint.png' })
    await lat2.getByRole('button', { name: 'Wie letztes Mal' }).click()
    await expect(lat2.getByLabel('Satz 1 Gewicht')).toHaveValue('45')
  })

  test('Coach II: Wochencheck mit Ampeln, Vorschlag öffnet den Programm-Tag, Muskelkarte (Schritt 21)', async ({ page }) => {
    await openApp(page)
    await page.getByRole('button', { name: /^Programme/ }).click()
    await page.getByRole('radiogroup', { name: 'Trainings pro Woche' }).getByRole('radio', { name: '2×' }).click()
    await page.getByRole('listitem', { name: 'Vorschlag Ganzkörper A/B' }).getByRole('button', { name: 'Übernehmen …' }).click()
    await page.getByRole('dialog', { name: 'Ganzkörper A/B übernehmen' }).getByRole('button', { name: 'Übernehmen und aktivieren' }).click()
    const hero = page.getByRole('region', { name: 'Programm Ganzkörper A/B' })
    // zweimal Ganzkörper A, jeweils nur Lat-Zug → Wochenziel 2 erreicht, Brust fehlt
    for (const first of [true, false]) {
      if (first) await hero.getByRole('button', { name: /Nächstes: Ganzkörper A/ }).click()
      else {
        await hero.getByRole('button', { name: 'Anderen Tag wählen' }).click()
        await page.getByRole('button', { name: 'Ganzkörper A starten' }).click()
      }
      const lat = card(page, 'Lat-Zug')
      await lat.getByRole('button', { expanded: false }).click()
      for (const i of [1, 2, 3]) {
        await lat.getByLabel(`Satz ${i} Wiederholungen`).fill('10')
        await lat.getByRole('button', { name: `Satz ${i} abhaken` }).click()
      }
      await page.getByRole('button', { name: 'Abschließen' }).click()
      await page.getByRole('dialog', { name: 'Training abschließen' }).getByRole('button', { name: 'Abschließen' }).click()
      await page.getByRole('button', { name: 'OK' }).click()
    }

    await tab(page, 'Coach').click()
    const check = page.getByRole('region', { name: 'Wochencheck' })
    await expect(check.getByRole('radio', { name: 'Diese Woche' })).toBeChecked()
    const lights = check.getByRole('list', { name: 'Ampeln' })
    await expect(lights).toContainText('2 von 2 Trainings')
    await expect(lights).toContainText('Brust 0')
    await expect(page.getByRole('img', { name: /Muskelkarte: \d+ Muskeln trainiert/ })).toBeVisible()
    await lights.getByText('Volumen & Balance').click()
    await expect(check.getByRole('list', { name: 'Sätze je Muskelgruppe' })).toBeVisible()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    await check.screenshot({ path: 'test-results/shots/73-week-check.png' })

    await check.getByRole('list', { name: 'Vorschläge für nächste Woche' }).getByRole('button', { name: /^Ganzkörper A: \+ 1 Satz Brustpresse/ }).click()
    await expect(page.getByRole('dialog', { name: 'Tag bearbeiten' })).toBeVisible()
    await expect(tab(page, 'Training')).toHaveAttribute('aria-current', 'page')
  })

  test('Mit Claude besprechen: Brief kopieren, Programmvorschlag einfügen und übernehmen (Schritt 22)', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])
    await openApp(page)
    await tab(page, 'Coach').click()
    const card = page.getByRole('region', { name: 'Mit Claude besprechen' })
    await card.getByRole('button', { name: 'Brief erstellen' }).click()
    const brief = page.getByRole('dialog', { name: 'Mit Claude besprechen' })
    await brief.getByLabel('Deine Frage').fill('Welches Programm passt zu 3 Tagen?')
    await brief.getByText(/^Vorschau/).click()
    await expect(brief.getByLabel('Vorschau des Briefs')).toContainText('Meine Frage: Welches Programm passt zu 3 Tagen?')
    await page.screenshot({ path: 'test-results/shots/80-claude-brief.png' })
    await brief.getByRole('button', { name: 'Kopieren' }).click()
    await expect(brief.getByRole('status')).toContainText('Kopiert')
    const copied = await page.evaluate(() => navigator.clipboard.readText())
    expect(copied).toContain('"format": "fitness-app-programm/v1"')

    await brief.getByRole('button', { name: 'Programm übernehmen …' }).click()
    const imp = page.getByRole('dialog', { name: 'Programm von Claude übernehmen' })
    const answer = [
      'Gern! Mit 3 Tagen passt ein Ganzkörperplan:',
      '```json',
      JSON.stringify({
        format: 'fitness-app-programm/v1', name: 'Ganzkörper Herbst', sessionsPerWeek: 3, goal: 'muskelaufbau',
        days: [
          { name: 'Herbst A', exercises: [{ id: 'ex-lat-zug', name: 'Lat-Zug', sets: 3, reps: [8, 12], restSec: 90 }, { library: 'beinpresse', name: 'Beinpresse', sets: 3, reps: [8, 12] }] },
          { name: 'Herbst B', exercises: [{ name: 'Facepulls', sets: 3, reps: [12, 15] }, { name: 'Plank', sets: 3, holdSec: 40 }] },
        ],
      }, null, 2),
      '```',
    ].join('\n')
    await imp.getByLabel('Antwort von Claude').fill(answer)
    await imp.getByRole('button', { name: 'Prüfen' }).click()
    const check = page.getByRole('dialog', { name: 'Programm prüfen' })
    await expect(check.getByRole('region', { name: 'Tag Herbst A' })).toContainText('aus der Bibliothek')
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
    expect(overflow).toBeLessThanOrEqual(0)
    await page.screenshot({ path: 'test-results/shots/81-claude-import-preview.png' })
    await check.getByRole('button', { name: 'Übernehmen' }).click()
    await page.getByRole('dialog', { name: 'Programm übernommen' }).getByRole('button', { name: 'Zu den Programmen' }).click()

    await expect(tab(page, 'Training')).toHaveAttribute('aria-current', 'page')
    await expect(page.getByText('Ganzkörper Herbst', { exact: true })).toBeVisible()
    await page.getByRole('button', { name: '‹ Training' }).click()
    await expect(page.getByRole('region', { name: 'Programm Ganzkörper Herbst' }).getByRole('button', { name: /Nächstes: Herbst A/ })).toBeVisible()
  })
})

