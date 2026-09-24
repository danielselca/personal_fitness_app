/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

// Basis-Pfad für GitHub Pages: https://danielselca.github.io/personal_fitness_app/
// Lokal (dev/preview) bleibt der Pfad gleich, damit sich beides identisch verhält.
const BASE = '/personal_fitness_app/'

export default defineConfig({
  base: BASE,
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'apple-touch-icon-180.png', 'icon.svg'],
      manifest: {
        name: 'Personal Fitness App',
        short_name: 'Fitness',
        description: 'Persönliche Fitness-App fürs Training im Studio. Lokal, offline, ohne Konto.',
        lang: 'de',
        start_url: BASE,
        scope: BASE,
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#101010',
        theme_color: '#101010',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Übungsgrafiken nicht beim Installieren laden, sondern bei Bedarf: einmal gesehen oder still
        // vorgeladen (deine Übungen) liegen sie im Laufzeit-Cache und sind offline da.
        globIgnores: ['**/media/**'],
        runtimeCaching: [
          {
            // Regulärer Ausdruck statt Funktion: Workbox überträgt Funktionen ohne ihre Variablen
            urlPattern: /\/media\/v1\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'media-v1',
              expiration: { maxEntries: 800 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // Neue Service-Worker-Version übernimmt offene Seiten sofort, damit schon der erste Besuch offline-fähig ist.
        clientsClaim: true,
        navigateFallback: `${BASE}index.html`,
        cleanupOutdatedCaches: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    // Standard ist Node; Komponententests setzen per Datei-Kommentar auf jsdom um.
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
})
