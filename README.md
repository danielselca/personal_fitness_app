# Personal Fitness App

Persönliche Fitness-App als PWA fürs Training im Studio: Übungen, Sätze mit Gewicht und Wiederholungen, Pausentimer, Verlauf, Statistik. Alle Daten bleiben lokal auf dem Gerät, Sicherung per JSON-Export. Kein Konto, kein Backend.

Anforderungen und Abnahmekriterien: [SPEC.md](SPEC.md) · Stand der Umsetzung: [PROGRESS.md](PROGRESS.md) · Weiterer Ausbau: [ROADMAP.md](ROADMAP.md)

**Live:** https://danielselca.github.io/personal_fitness_app/

## Auf dem iPhone starten und benutzen

1. Die Adresse oben in **Safari** öffnen (nicht in Chrome oder einem In-App-Browser).
2. **Teilen-Symbol** tippen, dann **„Zum Home-Bildschirm“**. Das Symbol heißt „Fitness“.
3. Ab jetzt immer über dieses Symbol öffnen. Die installierte App und der Safari-Tab haben getrennte Speicher; wer beides mischt, sieht zwei verschiedene Datenstände.
4. Einmal online geöffnet, funktioniert die App danach auch ohne Netz (Flugmodus).

**Training erfassen**

- Tab **Training** → eine Vorlage über den orangen Start-Knopf starten („Oberkörper“ ist vorbereitet: erst die vier Übungen ohne Gewicht, dann Adduktion, Tiefes V, Reverse Butterfly, Butterfly, Incline Frontraise, Schrägbank, Rudern, Lat-Zug) Darunter „Freies Training“ (leer beginnen) und „Letztes wiederholen“. „Diese Woche“ zeigt Mo–So mit den Trainingstagen und das letzte Training in Kurzform.
- Je Übung stehen die Sätze vorbefüllt: aus dem letzten Training, sonst aus der Plan-Vorgabe. Links steht „Zuletzt“ mit den Werten des gleichen Satzes beim letzten Mal.
- Beim aktuellen Satz gibt es große **+/−-Tasten** für Gewicht und Wiederholungen. Tippen ins Feld öffnet die Zahlentastatur, Komma ist erlaubt (12,5).
- **Haken** tippen = Satz gespeichert. Der Pausentimer startet automatisch mit der Pause der Übung (Standard 90 s). Unten: **+30 s**, **Neu**, **Skip**. Ohne laufenden Timer ist die Leiste weg; das **Uhr-Symbol** oben im Trainingskopf öffnet 1:00 / 1:30 / 2:00 und eine eigene Dauer.
- Nur die **aktuelle Übung** (orange umrandet) ist aufgeklappt, alle anderen stehen als eine Zeile darunter; antippen klappt sie auf. Erledigte Übungen werden grün. Ist eine Übung fertig, rückt die nächste von selbst nach oben, Scrollen ist nicht nötig. Oben steht eine schmale Kopfzeile, die beim Scrollen stehen bleibt: „Übung 2/8 · 5/24 Sätze · 18 min“ und ein Balken.
- **Sortieren** (Pfeil-Symbol oben rechts im Kopf) zeigt alle Übungen als kurze Liste mit „ganz nach oben“, ↑, ↓, „ganz nach unten“ und ✕; **Ohne Gewicht zuerst** schiebt die Körpergewichts- und Bandübungen nach vorn, **Fertig** kehrt zurück. Die Übungsauswahl listet „Ohne Gewicht“ vor „Mit Gewicht“ und übernimmt Mehrfachauswahl in dieser Reihenfolge.
- **+ Satz**, **Notiz**, **Bearbeiten** (Sätze löschen, **Ohne Gewicht** umschalten, Übung entfernen). **+ Übung** öffnet die Suche; steht die Übung nicht im Katalog, legt „… als neue Übung anlegen“ sie sofort an. Die Suche ist großzügig: „latzug“ findet „Lat-Zug“, „uberzuge“ oder „ueberzuege“ findet „Überzüge“, mehrere Wörter („kurzhantel schräg“) müssen alle vorkommen.
- **Halteübungen** (Serratusstütz, Stütz auf Step) zeigen einen Donut: je Satz ein Stück „Halten“, dazwischen „Pause“. Tippen in die Mitte startet, der Countdown läuft rückwärts, Pause und nächster Satz folgen automatisch mit Ton. Nochmal tippen pausiert. „Satz fertig“ beendet die Haltezeit früher.
- **Übungen ohne Gewicht** (Aufdehnen, Theraband usw.) zeigen nur ein Wdh.-Feld. Die Physio-Übungen sind so vorbelegt; jede andere Übung lässt sich im Katalog oder im Training umstellen.
- **Abschließen** speichert nur abgehakte Sätze. Ohne abgehakten Satz wird gefragt, ob verworfen werden soll.
- Die App speichert jede Eingabe sofort. Wird sie unterbrochen, geht es beim nächsten Öffnen an derselben Stelle weiter, der Timer läuft korrekt weiter.

**Programme und eigene Vorlagen**

- Oben auf der Trainingsseite: **Programme** → Wochenziel wählen (z. B. 3×), einen Vorschlag übernehmen (Ganzkörper A/B, Oberkörper/Unterkörper, Push/Pull/Beine) mit Ziel **Muskelaufbau** (8–12 Wdh.) oder **Fitness & Abnehmen** (12–15) und optional deinen Physio-Übungen vorne. Deine vorhandenen Übungen (Lat-Zug, Rudern …) werden verwendet, dein Verlauf läuft weiter.
- Danach zeigt die Startseite **„Nächstes: Ganzkörper B ▶“** und „2/3 diese Woche“; **„Anderen Tag wählen“** startet einen beliebigen Tag. Freies Training, deine Vorlagen und „Letztes wiederholen“ bleiben wie gewohnt.
- Unter **Programme** lässt sich jedes Programm **duplizieren** und frei **bearbeiten** (Name, Ziel, Tage umbenennen/sortieren/hinzufügen/entfernen, je Tag die Übungen) – z. B. „Ganzkörper ohne Schulter“. Auch ein **eigenes Programm** ganz ohne Vorgabe ist möglich. Die Vorschläge bleiben unverändert zum erneuten Übernehmen.
- **Vorlagen-Editor** (Stift an der Vorlage, „+ Neue Vorlage“): Übungen hinzufügen (auch aus der Bibliothek), je Übung Sätze, **Wdh. von–bis** und **Pause**, sortieren, entfernen, **duplizieren**.

**Übungen und Bibliothek**

- Tab **Übungen** → oben **Meine** (deine Übungen mit Verlauf) oder **Bibliothek** (60 Übungen mit Ausführungstipps und typischen Fehlern). Die Chips filtern nach Ausrüstung (Maschine, Seilzug, Freihantel, Kettlebell, Körpergewicht, Band, Calisthenics …) und Muskelgruppe; bei „Meine“ zeigt „Ohne Zuordnung“ Übungen ohne Angaben.
- In der Bibliothek holt **„Zu meinen Übungen“** eine Übung zu dir. Gibt es schon eine gleichnamige, fragt die App, ob sie verknüpft werden soll.
- Bei deiner Übung: **„Mit Bibliothek verknüpfen“** zeigt danach Muskeln und Ausführungstipps (z. B. für Überzüge); **Bearbeiten → Zuordnung** legt Ausrüstung, Kategorie und Muskeln selbst fest.
- Im Training filtert die Übungsauswahl nach Ausrüstung; bei Suche erscheinen zusätzlich Treffer **„Aus der Bibliothek“**, die beim Hinzufügen übernommen werden.

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
npm run size       # Größenbudget des Builds prüfen (läuft auch in CI)
npm run library    # Übungsbibliothek aus src/library/curation neu erzeugen
```

Einmalig für die E2E-Tests: `npx playwright install chromium`.

Der Basis-Pfad ist auf `/personal_fitness_app/` eingestellt (GitHub Pages). Lokal ist die App unter `http://localhost:5173/personal_fitness_app/` erreichbar.

## Aufbau

- `src/domain/` reine Logik: Typen, Seed-Katalog, Taxonomie, Bibliothekszugriff, Vorschläge, Statistik, ISO-Wochen, Sicherung, Migration
- `src/library/` Übungsbibliothek: Quellen in `curation/`, daraus erzeugt `npm run library` die Dateien `*.generated.ts`
- `src/store/` Zustand-Store und Persistenz (IndexedDB, Fallback localStorage)
- `src/screens/` die vier Tabs, `src/components/` Bausteine, `src/hooks/` Wake Lock und Takt
- `e2e/` Playwright-Tests, `scripts/` Icon-Generator

## Deployment

Jeder Push auf `main` läuft durch Lint, Unit-Tests, Build und E2E-Tests und wird dann auf GitHub Pages veröffentlicht. Voraussetzung: In den Repo-Einstellungen unter *Pages* ist als Quelle **GitHub Actions** gewählt.

Der Ordner `Input/` enthält private Referenzbilder und wird nicht eingecheckt.
