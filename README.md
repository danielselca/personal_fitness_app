# Personal Fitness App

Persönliche Fitness-App als PWA fürs Training im Studio: Übungen, Sätze mit Gewicht und Wiederholungen, Pausentimer, Verlauf, Statistik. Alle Daten bleiben lokal auf dem Gerät, Sicherung per JSON-Export. Kein Konto, kein Backend.

Anforderungen und Abnahmekriterien: [SPEC.md](SPEC.md) · Stand der Umsetzung: [PROGRESS.md](PROGRESS.md)

**Live:** https://danielselca.github.io/personal_fitness_app/

## Auf dem iPhone starten und benutzen

1. Die Adresse oben in **Safari** öffnen (nicht in Chrome oder einem In-App-Browser).
2. **Teilen-Symbol** tippen, dann **„Zum Home-Bildschirm“**. Das Symbol heißt „Fitness“.
3. Ab jetzt immer über dieses Symbol öffnen. Die installierte App und der Safari-Tab haben getrennte Speicher; wer beides mischt, sieht zwei verschiedene Datenstände.
4. Einmal online geöffnet, funktioniert die App danach auch ohne Netz (Flugmodus).

**Training erfassen**

- Tab **Training** → „Training starten“ oder eine Vorlage tippen („Oberkörper“ ist vorbereitet: erst die vier Übungen ohne Gewicht, dann Adduktion, Tiefes V, Reverse Butterfly, Butterfly, Incline Frontraise, Schrägbank, Rudern, Lat-Zug) oder „Letztes Training wiederholen“.
- Je Übung stehen die Sätze vorbefüllt: aus dem letzten Training, sonst aus der Plan-Vorgabe. Links steht „Zuletzt“ mit den Werten des gleichen Satzes beim letzten Mal.
- Beim aktuellen Satz gibt es große **+/−-Tasten** für Gewicht und Wiederholungen. Tippen ins Feld öffnet die Zahlentastatur, Komma ist erlaubt (12,5).
- **Haken** tippen = Satz gespeichert. Der Pausentimer startet automatisch mit der Pause der Übung (Standard 90 s). Unten: **+30 s**, **Neu**, **Skip**. Ohne laufenden Timer stehen dort 1:00 / 1:30 / 2:00 und eine eigene Dauer.
- Nur die **aktuelle Übung** (blau umrandet) ist aufgeklappt, alle anderen stehen als eine Zeile darunter; antippen klappt sie auf. Erledigte Übungen werden grün. Oben zeigen „Übung 2/8“ und ein Balken den Fortschritt.
- **Sortieren** (oben rechts) zeigt alle Übungen als kurze Liste mit „ganz nach oben“, ↑, ↓, „ganz nach unten“ und ✕; **Ohne Gewicht zuerst** schiebt die Körpergewichts- und Bandübungen nach vorn, **Fertig** kehrt zurück. Die Übungsauswahl listet „Ohne Gewicht“ vor „Mit Gewicht“ und übernimmt Mehrfachauswahl in dieser Reihenfolge.
- **+ Satz**, **Notiz**, **Bearbeiten** (Sätze löschen, **Ohne Gewicht** umschalten, Übung entfernen). **+ Übung** öffnet die Suche; steht die Übung nicht im Katalog, legt „… als neue Übung anlegen“ sie sofort an.
- **Übungen ohne Gewicht** (Serratusstütz, Aufdehnen, Theraband usw.) zeigen nur ein Wdh.-Feld. Die Physio-Übungen sind so vorbelegt; jede andere Übung lässt sich im Katalog oder im Training umstellen.
- **Abschließen** speichert nur abgehakte Sätze. Ohne abgehakten Satz wird gefragt, ob verworfen werden soll.
- Die App speichert jede Eingabe sofort. Wird sie unterbrochen, geht es beim nächsten Öffnen an derselben Stelle weiter, der Timer läuft korrekt weiter.

**Hell oder dunkel:** Sonne/Mond oben rechts schaltet um. Unter **Mehr → Erscheinungsbild** lässt sich auch „System“ wählen, dann folgt die App dem iPhone.

**Sicherung, wichtig**

- Tab **Mehr → Exportieren** erzeugt eine Datei `fitness-backup-JJJJ-MM-TT.json`. Auf dem iPhone im Teilen-Dialog **„In Dateien sichern“** wählen, am besten in iCloud Drive.
- Auf einem neuen Gerät: App installieren, **Mehr → Importieren**, Datei wählen, **„Alles ersetzen“**. Zum Zusammenführen zweier Stände „Zusammenführen“.
- Nach drei Trainings ohne Sicherung erinnert die App daran.

**Grenzen auf dem iPhone:** Ton am Ende der Pause gibt es nur, solange die App im Vordergrund ist und der Bildschirm an ist. Vibration bietet Safari nicht. Deshalb bleibt der Bildschirm während des Trainings standardmäßig an (Einstellung „Bildschirm anlassen“).

## Entwicklung

```bash
npm install
npm run dev        # Dev-Server, auch im WLAN erreichbar (--host)
npm test           # Vitest: Logik- und Komponententests
npm run test:e2e   # Playwright: Ende-zu-Ende gegen den Produktionsbuild, mobile Ansicht 375 px
npm run lint       # oxlint
npm run build      # tsc + vite build → dist/
npm run preview    # gebauten Stand lokal ansehen (inkl. Service Worker)
npm run icons      # PNG-Icons aus scripts/make-icons.mjs neu erzeugen
```

Einmalig für die E2E-Tests: `npx playwright install chromium`.

Der Basis-Pfad ist auf `/personal_fitness_app/` eingestellt (GitHub Pages). Lokal ist die App unter `http://localhost:5173/personal_fitness_app/` erreichbar.

## Aufbau

- `src/domain/` reine Logik: Typen, Seed-Katalog, Vorschläge, Statistik, ISO-Wochen, Sicherung, Migration
- `src/store/` Zustand-Store und Persistenz (IndexedDB, Fallback localStorage)
- `src/screens/` die vier Tabs, `src/components/` Bausteine, `src/hooks/` Wake Lock und Takt
- `e2e/` Playwright-Tests, `scripts/` Icon-Generator

## Deployment

Jeder Push auf `main` läuft durch Lint, Unit-Tests, Build und E2E-Tests und wird dann auf GitHub Pages veröffentlicht. Voraussetzung: In den Repo-Einstellungen unter *Pages* ist als Quelle **GitHub Actions** gewählt.

Der Ordner `Input/` enthält private Referenzbilder und wird nicht eingecheckt.
