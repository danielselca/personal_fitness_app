import { expect, type Page } from '@playwright/test'

export async function openApp(page: Page) {
  await page.goto('./')
  await expect(page.getByRole('button', { name: 'Training starten' })).toBeVisible()
}

/** Übungen über die Auswahl ins Training holen. */
export async function addExercises(page: Page, names: string[]) {
  const dialog = page.getByRole('dialog', { name: 'Übungen hinzufügen' })
  await expect(dialog).toBeVisible()
  for (const n of names) await dialog.getByRole('button', { name: new RegExp(`^${n}`) }).click()
  await dialog.getByRole('button', { name: `${names.length} hinzufügen` }).click()
  await expect(dialog).toBeHidden()
}

export function card(page: Page, name: string) {
  return page.getByRole('region', { name })
}

/** Wartet, bis der Service Worker aktiviert ist, die Seite kontrolliert und index.html im Precache liegt. */
export async function waitForPrecache(page: Page) {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    const ready = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false
      const reg = await navigator.serviceWorker.getRegistration()
      if (!reg || !reg.active || reg.active.state !== 'activated') return false
      if (!navigator.serviceWorker.controller) return false
      const keys = await caches.keys()
      if (!keys.some((k) => k.includes('precache'))) return false
      const res = await caches.match(new URL('index.html', location.href).toString(), { ignoreSearch: true })
      return !!res
    })
    if (ready) return
    await page.waitForTimeout(150)
  }
  throw new Error('Service Worker wurde nicht rechtzeitig aktiv')
}
