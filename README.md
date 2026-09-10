# Personal Fitness App

Persönliche Fitness-App als PWA fürs Training im Studio: Übungen, Sätze mit Gewicht und Wiederholungen, Pausentimer, Verlauf, Statistik. Alle Daten bleiben lokal auf dem Gerät, Sicherung per JSON-Export. Kein Konto, kein Backend.

Anforderungen und Abnahmekriterien: [SPEC.md](SPEC.md).

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server, auch im WLAN erreichbar (--host)
npm test           # Vitest
npm run lint       # oxlint
npm run build      # tsc + vite build → dist/
npm run preview    # gebauten Stand lokal ansehen (inkl. Service Worker)
npm run icons      # PNG-Icons aus scripts/make-icons.mjs neu erzeugen
```

Der Basis-Pfad ist auf `/Personal_Fitness_App/` eingestellt (GitHub Pages). Lokal ist die App also unter `http://localhost:5173/Personal_Fitness_App/` erreichbar.

## Deployment

Jeder Push auf `main` baut und veröffentlicht die App über GitHub Actions auf GitHub Pages. Voraussetzung: In den Repo-Einstellungen unter *Pages* ist als Quelle **GitHub Actions** gewählt.

## Hinweis für das iPhone

Die App über Safari öffnen und mit *Teilen → Zum Home-Bildschirm* installieren. Die installierte App und der Safari-Tab haben getrennte Speicher; für die Trainingsdaten sollte deshalb immer derselbe Weg genutzt werden. Regelmäßig unter *Mehr → Sicherung* exportieren.

Der Ordner `Input/` enthält private Referenzbilder und wird nicht eingecheckt.
