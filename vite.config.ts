/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { readFileSync } from 'node:fs'

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { version: string }

// Basis-Pfad für GitHub Pages: https://<user>.github.io/Personal_Fitness_App/
// Lokal (dev/preview) bleibt der Pfad gleich, damit sich beides identisch verhält.
const BASE = '/Personal_Fitness_App/'

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
        background_color: '#f2f2f7',
        theme_color: '#151517',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
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
