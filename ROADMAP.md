# Roadmap: Übungsbibliothek, Programme & Personal Trainer

Freigegeben am 2026-09-24. Stand der Umsetzung: [PROGRESS.md](PROGRESS.md).


## Context

Die App (React/TS-PWA, lokal, kein Backend, GitHub Pages) läuft seit Schritt 15 rund im Studio.
Sie kennt aber nur 21 handgepflegte Übungen und eine Vorlage „Oberkörper“ (12 Übungen).
Daniel möchte sie zu einem Trainingsbegleiter ausbauen: viel mehr Übungen (nach Ausrüstung und
Muskelgruppen), weitere Programme (Ganzkörper, Unterkörper …), Bilder zur korrekten Ausführung
aus guten Quellen, einen Personal Trainer, der Leistungen analysiert und bewertet, und weitere
sinnvolle Funktionen. Dieser Plan beschreibt den Weg dorthin in 8 einzeln auslieferbaren Schritten.

### Deine Entscheidungen (Rückfragen 2026-09-24)

| Thema | Entscheidung |
|---|---|
| Ziele des Trainers | **Muskelaufbau** + **Fitness & Abnehmen** |
| Trainingstage | **3× pro Woche** → Standardempfehlung **Ganzkörper A/B**, Wochenziel 3 |
| KI | **Übergabe an die Claude-App** (Teilen/Kopieren); kein API-Schlüssel; die App selbst macht keine Netzwerkaufrufe |
| Programme | **Ganzkörper 2–3×**, **Oberkörper/Unterkörper 4×** (dein „Oberkörper“ = O1), **Push/Pull/Beine** |
| Bibliothek | **kuratiert, ~250 Übungen auf Deutsch** (Name, Ausführung, typische Fehler, Grafiken) |
| Coach | **eigener Tab** – Training · Übungen · Coach · Verlauf · Mehr |
| Rudern (Gerät 29) | **Seilzug, sitzend** |
| Freiheit | **Programme sind ein Angebot, kein Zwang:** freies Training bleibt; jedes Programm und jede Vorlage lässt sich **duplizieren und frei anpassen**; Körperbereiche lassen sich **vorübergehend schonen** (z. B. bei Schulterproblemen) |

## Leitplanken

- **Deine Historie bleibt unantastbar.** Bestehende Übungs-IDs (`ex-lat-zug` …) bleiben; Programme und
  Bibliothek verwenden zuerst deine vorhandenen Übungen (Verknüpfung → feste ID → gleicher Name nach
  Rückfrage → erst dann neu). Migrationen ergänzen nur leere Felder und setzen nie `updatedAt`.
- **Lokal & offline.** Kein Server, kein Konto. Grafiken kommen vom selben Origin und werden für
  „Meine Übungen“ offline vorgehalten. Einziger Weg nach außen: Teilen an die Claude-App – nur auf
  Knopfdruck, mit Vorschau.
- **Du bleibst frei.** „Freies Training“, eigene Vorlagen und „Letztes wiederholen“ bleiben wie
  heute. Ein übernommenes Programm ist immer *deine Kopie* und frei änderbar; die mitgelieferten
  Programme der App bleiben unverändert als Ausgangspunkt erhalten. Jeder Programm-Tag lässt sich
  frei wählen, statt nur „Nächstes Training“.
- **Kleine Autosaves.** Bibliothek, Grafiken und eigene Fotos liegen nicht im gespeicherten Datensatz.
- **Saubere Lizenzen.** Nur klar lizenziertes Material, Quelle an jedem Bild und unter „Quellen & Lizenzen“.
- **Ehrlicher Trainer.** Jede Bewertung begründet („weil …“), Faustregeln als solche gekennzeichnet.
  Kein Ersatz für ärztliche/physiotherapeutische Beratung; Physio-Übungen werden nie automatisch
  gesteigert und zählen nicht zum Muskelaufbau-Volumen.
- **Jeder Schritt ein PR** → `main`, CI grün (lint, Unit, Build, E2E), Deploy; du testest im Studio,
  bevor der nächste Schritt beginnt.

## Quellen (recherchiert und geprüft)

**Grafiken:** [workout-guide](https://github.com/bryllim/workout-guide) – 302 Übungen mit je 3
Bewegungsphasen als einfarbige SVG (CC BY-SA 4.0, Bryl Lim, teils nach Everkinetic); ergänzend
[Everkinetic](https://github.com/everkinetic/data) (289 Übungen, 2 Phasen, CC BY-SA 4.0).
Gemessen: Ø 27 KB je Phase, nach Koordinaten-Rundung ~7 KB übertragen → alle 250 Übungen ≈ 5 MB,
deine ~40 Übungen < 1 MB auf dem iPhone. ~250 mit Grafik sind machbar (~200 workout-guide,
~50 Everkinetic). Lücken: Kettlebell (nur 2 Grafiken) und deine Physio-Übungen → Text,
Muskelkarte, eigenes Foto. Muskelkarte nach `react-body-highlighter` (MIT).
**Verworfen:** free-exercise-db (Upstream-Autor: Fotos „scrapped off the internet“), ExerciseDB und
MuscleWiki (Bedingungen verbieten Weitergabe/Offline-Speicherung).
**Texte:** deutsche Namen, Ausführungstipps und typische Fehler schreibe ich selbst.

**Trainingswissenschaft:** ACSM Position Stand 2009 (MSSE 41:687) – +2–10 % Last, wenn Soll-Wdh.
um 1–2 überschritten; ACSM 2026 (MSSE 58:851) – alle großen Muskelgruppen ≥ 2×/Woche;
Schoenfeld 2017 (J Sports Sci 35:1073) – ~10+ Sätze/Muskel/Woche, Pelland 2026 (Sports Med
56:481) – abnehmender Zusatznutzen; Schoenfeld 2016 (Sports Med 46:1689) – ≥ 2×/Woche;
WHO 2020 (BJSM 54:1451); Epley-1RM (nur ≤ 10 Wdh.); Rogerson 2024 (Entlastung Ø alle 5–6 Wochen).
Für „Stagnation“ gibt es kein validiertes Kriterium → Faustregel.

## Architektur

1. **Bibliothek getrennt von „Meine Übungen“.** Kleiner Index im App-Bundle (eigene, dauerhafte
   deutsche Slugs, Name, Aliasse inkl. Englisch, Ausrüstung, Muskeln, Kategorie, Muster, Level,
   Medienverweis; ~40 KB) + nachgeladene Details (Tipps, Fehler). Einträge werden nie gelöscht,
   nur ausgeblendet (Test auf eingefrorene ID-Liste). `data.exercises` bleibt „Meine Übungen“;
   **Übernehmen beim ersten Gebrauch** als `ex-lib-<slug>` mit `libraryId` (geräteübergreifend
   gleich). Verhalten (ohne Gewicht, Halten, Pause, Schritt) wird beim Übernehmen kopiert,
   Beschreibendes (Ausrüstung, Muskeln …) per `exerciseMeta(ex)` nachgeschlagen, mit eigenen
   Feldern für selbst angelegte Übungen.
2. **Taxonomie** (`src/domain/taxonomy.ts`, von Hand kuratiert): Ausrüstung (Maschine, Seilzug,
   Lang-/Kurzhantel, SZ-Stange → Filter „Freihantel“, Kettlebell, Körpergewicht, Klimmzugstange,
   Band, Sonstiges), Stil „Calisthenics“, ~20 Muskeln (u. a. Schulter vorne/seitlich/hinten),
   Kategorie (Kraft, Mobilität, Kardio, Physio), Bewegungsmuster inkl. Gelenkaktionen (Drücken/
   Ziehen horizontal/vertikal, Kniebeuge, Hüftstreckung, Ausfallschritt, Fliegende, Seitheben,
   Curl, Rumpf …) – Grundlage für „Übung tauschen“ – und **belastete Körperbereiche** (Schulter,
   Ellbogen, Handgelenk, Nacken, oberer/unterer Rücken, Hüfte, Knie, Sprunggelenk) je Übung,
   Grundlage fürs Schonen.
3. **Grafiken:** `public/media/v1/ex/<slug>-<n>.svg` (Koordinaten gerundet, Füllfarbe entfernt →
   Lizenzvermerk „verändert“, eigene Lizenzdatei + `ATTRIBUTION.json`). Nicht vorgeladen
   (`globIgnores`), sondern Laufzeit-Cache (CacheFirst, Größenlimit) + stilles Vorladen für
   „Meine Übungen“; offline ohne Cache → Platzhalter. Anzeige als CSS-Maske in Textfarbe (passt
   zu Hell/Dunkel), Phasen weich überblendet = Animation; bei „Bewegung reduzieren“ nebeneinander.
4. **Programme:** `Program {id, name, goal, sessionsPerWeek, days[{id, name, templateId}],
   copiedFrom?}`, Vorlagen-Einträge mit `repMin/repMax/restSec/note`,
   `Workout.programId/programDayId`. „Nächstes Training“ wird aus dem letzten abgeschlossenen
   Programm-Training **abgeleitet** (robust bei Löschen/Import); gespeichert wird nur
   `settings.activeProgramId`, `weeklyGoal = 3`. **Duplizieren** legt Programm und Tages-Vorlagen
   mit neuen IDs an, verwendet aber dieselben Übungen → deine Historie und Steigerungen laufen weiter.
5. **Schonen:** `restrictions[] {id, bodyParts[], muscles[], note?, until?}` (optional mit Enddatum).
   Wirkt beim Trainingsstart (betroffene Übungen markiert, Alternative / auslassen / trotzdem
   machen), im Coach (keine „zu wenig“-Warnung für geschonte Bereiche, Steigerung pausiert, danach
   Wiedereinstieg mit weniger Gewicht) und in der Übungsauswahl (Hinweis an betroffenen Übungen).
   Kein medizinischer Rat: bei Schmerzen Arzt/Physio.
6. **Trainer-Engine** `src/domain/coach/*`: reine, getestete Funktionen, offline.
7. **Mit Claude besprechen:** Brief-Text → Vorschau → iOS-Teilen (Claude-App) oder Kopieren;
   Rückweg: Programmvorschlag als JSON einfügen und übernehmen.

## Schritte

| # | Inhalt | Aufwand | Schema |
|---|---|---|---|
| 16 | Fundament: Datenverluste und Stolpersteine beseitigen | M | 7 |
| 17 | Bibliothek-Kern: Taxonomie, ~60 Übungen, Filter, Verknüpfung deiner Übungen | M + Inhalt | 8 |
| 18 | Programme: Ganzkörper A/B, OK/UK, PPL, „Nächstes Training“, duplizieren & anpassen, Übung tauschen, Körperbereiche schonen | L | 9 |
| 19 | Ausführung & Grafiken, Bibliothek auf ~120 | M + Inhalt | – |
| 20 | Coach I: Tab, Steigerungsvorschläge, Bestwerte, Wochenziel | L | 10 |
| 21 | Coach II: Muskelvolumen, Häufigkeit, Balance, Dichte, Entlastung, Muskelkarte | M | – |
| 22 | Mit Claude besprechen + Programm-Import | M | – |
| 23 | Ausbau: Bibliothek ~250 und Extras | fortlaufend | 11 |

### 16 – Fundament
- `migrate.ts` `fillDefaults`: je Schlüssel ein Normalisierer, unbekannte Felder gehen nicht mehr verloren.
- `backup.ts`: `normalizeExercise`/`normalizeWorkout` vollständig, neu `normalizeTemplate`/
  `normalizeSettings`, Export aus expliziter Schlüsselliste; Rundreise-Test mit vollständig
  befüllter Fixture (`src/test/fixtures.ts`, `Required<…>` → neue Felder erzwingen Testanpassung).
- `appStore.ts` `buildEntry`: archivierte Übungen beim Vorlagenstart/„Letztes wiederholen“ überspringen.
- Suche nach `src/domain/search.ts`: ohne Akzente/Umlaute, ß → ss, Trennzeichen egal
  („latzug“ findet „Lat-Zug“, „uberzuge“ findet „Überzüge“).
- Barrierefreiheit: Zeilen-Buttons in Auswahl/Liste mit `aria-label={name}`.
- Tab-Zustand in `src/store/navStore.ts` (Querverweise zwischen Tabs).
- E2E-Helfer: Tabs und Übungen exakt wählen; Schema-Version/Seed-Anzahl importieren statt festschreiben.
- `vite.config.ts`: `globIgnores: ['**/media/**']`; CI-Größenbudget (`scripts/check-size.mjs`).

### 17 – Bibliothek-Kern (Schema 8)
- `taxonomy.ts`; Quelle der Wahrheit `scripts/library/curation/*.ts` → Generator erzeugt
  `src/library/index.generated.ts` + `details.generated.ts` (Test prüft, dass sie aktuell sind).
- Erste ~60 Einträge: alle Programm-Übungen + Verknüpfungen deiner Übungen. Vorher **10 Beispiele
  zur Freigabe** durch dich (Stil, Genauigkeit der Tipps).
- `src/domain/library.ts`: `adoptFromLibrary`, `exerciseMeta`, `alternativesFor`.
- Schema 8: `Exercise.libraryId? equipment? muscles? category? pattern?`; Migration 7→8 verknüpft
  eindeutig zuordenbare Übungen (Tabelle unten), setzt „Physio“ für deine Physio-Liste.
- Übungen-Tab: „Meine | Bibliothek“ (Meine als Standard), Filter-Chips (Ausrüstung, Muskelgruppe,
  Calisthenics), Bibliotheks-Detail, „Zu meinen Übungen“. Auswahl im Training: Bibliothekstreffer
  erscheinen bei Suche; „… als neue Übung anlegen“ bleibt immer sichtbar.
- `ExerciseForm.tsx`: Ausrüstung/Muskeln/Kategorie für eigene Übungen.

### 18 – Programme (Schema 9)
- `src/domain/programs.ts`: `installProgram` (verwendet deine vorhandenen Übungen zuerst; auch
  für den Claude-Import), `nextProgramDay`, `validateProgramDefinition`;
  `src/programs/builtin.ts` mit den drei Programmen (Tabelle unten).
- Start-Seite: `ProgramHero` („Nächstes: Ganzkörper B ▶ · 2/3 diese Woche“) plus „Anderen Tag
  wählen“; darunter wie gewohnt „Freies Training“, deine Vorlagen und „Letztes wiederholen“.
  Programmauswahl mit Empfehlung nach Tagen/Woche. Seed-Daten aktivieren kein Programm
  (bestehende Tests bleiben grün).
- **Selbst gestalten:** „Programm duplizieren“ und „Vorlage duplizieren“ (Kopie mit neuem Namen,
  z. B. „Ganzkörper – ohne Schulter“); Programm-Editor: umbenennen, Tage hinzufügen/entfernen/
  sortieren, jeden Tag über den Vorlagen-Editor ändern; „Neues Programm“ und „Neue Vorlage“ auch
  ganz ohne Vorgabe. Mitgelieferte Programme bleiben unverändert zum erneuten Übernehmen.
- Vorlagen-Editor: Übung hinzufügen (Auswahl mit Bibliothek und Filtern), entfernen, sortieren,
  Sätze, „Wdh. von–bis“, Pause, Tauschen.
- „Übung tauschen“ im Training (Gerät besetzt oder Beschwerden): gleiches Muster/Muskel, andere
  Ausrüstung bzw. ohne geschonten Bereich; wahlweise nur heute oder auch in der Vorlage.
- **Körperbereiche schonen** (Coach/Mehr): Bereiche oder Muskelgruppen wählen, optional „bis
  Datum“. Beim Start eines Programm-Tags oder einer Vorlage sind betroffene Übungen markiert,
  mit „Alternative“, „heute auslassen“ oder „trotzdem“; die Übungsauswahl zeigt einen Hinweis.
  Eigene Übungen bekommen im Formular ebenfalls belastete Bereiche.
- Backup: `programs` und `restrictions` in Export, Prüfung, Zusammenführen, Ersetzen.

### 19 – Ausführung & Grafiken
- `scripts/library/media.ts` (fester Commit der Quellen) → `public/media/v1/ex/`, Lizenzdateien.
- Laufzeit-Cache + Vorladen, Platzhalter, Neuladen bei `vite:preloadError`.
- `ExerciseMedia` (Animation), `ExecutionSheet` („Ausführung“ auf der Übungskarte im Training:
  große Grafik, 3–5 Tipps, typische Fehler, Muskeln), kleine laufende Grafik in der aufgeklappten Karte.
- „Grafik passt nicht? Andere Bibliotheksübung verknüpfen“; Mehr → „Quellen & Lizenzen“.
- Bibliothek auf ~120 Übungen.

### 20 – Coach I (Schema 10)
- Tab „Coach“ (lazy geladen), Tab-Leiste mit 5 Spalten.
- `coach/progression.ts` – **doppelte Progression**: sind alle Arbeitssätze am oberen Ende des
  Zielbereichs, nächstes Mal + ein Gewichtsschritt (begrenzt auf 2–10 %, ACSM) und Wdh. zurück ans
  untere Ende; sonst +1 Wdh. Körpergewicht: Wdh. → Satz → schwerere Variante; Halten: +5 s.
  Nach ≥ 14 Tagen Pause −10 %. Gilt in Programm-Trainings und Vorlagen mit Zielbereich (auch
  deinen Kopien): Werte werden eingetragen, Hinweis „↑ 47,5 kg – letztes Mal 4 × 12“ + Knopf
  „Wie letztes Mal“. Freies Training und „Letztes wiederholen“ bleiben wie heute. Abschaltbar.
  Für geschonte Bereiche pausiert, danach Wiedereinstieg mit weniger Gewicht.
- `coach/records.ts`: geschätztes 1RM (Epley, ≤ 10 Wdh.), schwerstes Gewicht, meiste Wdh.,
  Volumen → „2 neue Bestwerte“ im Abschluss, Trend und 1RM im Übungsdetail.
- `coach/consistency.ts`: Trainings vs. Wochenziel 3, Serie in Wochen.
- „Wie war’s? leicht / passend / schwer“ im Abschluss → beeinflusst die nächste Steigerung.
- Profil (Mehr): Ziele, Erfahrung, optional Körpergewicht mit Verlauf. Schema 10:
  `WorkoutEntry.rating`, `bodyLog[]`.

### 21 – Coach II
- `volume.ts` (harte Sätze je Muskel/Woche: primär 1, sekundär 0,5, nur Kraft; Ziel ~10–20),
  `frequency.ts` (jede große Gruppe ≥ 2×), `balance.ts` (Drücken:Ziehen, Ober-/Unterkörper),
  `rest.ts` (echte Pausen aus Zeitstempeln), `deload.ts` (Faustregel), `hints.ts`.
  Geschonte Bereiche werden ausgenommen und angezeigt („Schulter wird geschont bis 15.10.“).
- `BodyMap.tsx` (Muskelkarte vorne/hinten). Wochencheck im Coach-Tab, z. B.:

  ```
  Wochencheck KW 39                                   Gesamt: gut
  🟢 Regelmäßigkeit   3 von 3 Trainings
  🟡 Fortschritt      6 Übungen gesteigert, Bankdrücken seit 4 Einheiten gleich
  🟡 Volumen/Balance  Beine 6 Sätze (Ziel ≥ 10) · Drücken : Ziehen = 1,4 : 1
  🟢 Dichte           Pausen Ø 1:40 (Soll 1:30) · 52 min
  Nächste Woche: 1) Ganzkörper B: + Beinbeuger-Satz  2) Bankdrücken 8–10 Wdh. statt 10–12
                 3) Face Pull ergänzen (mehr Ziehen)
  ```

### 22 – Mit Claude besprechen
- `briefing.ts`: deutscher Brief ≤ ~6 000 Zeichen (Ziele, Programm, geschonte Bereiche, 8 Wochen
  Kennzahlen, beste Sätze je Übung, Befunde des Coachs, eigene Frage), Vorschau, Teilen (iOS-Menü
  → Claude-App) oder Kopieren, notfalls Textfeld zum Markieren.
- `programJson.ts`: Claude darf Programmvorschläge zusätzlich als JSON liefern; die App findet den
  Block im eingefügten Text, prüft ihn, ordnet Übungen zu (ID, Name, Alias, englischer Name) und
  übernimmt per `installProgram`:

  ```json
  { "format": "fitness-app-programm/v1", "name": "Ganzkörper Herbst", "sessionsPerWeek": 3,
    "days": [ { "name": "A", "exercises": [
      { "library": "beinpresse", "name": "Beinpresse", "sets": 3, "reps": [8, 12], "restSec": 90 } ] } ] }
  ```

### 23 – Ausbau (fortlaufend, Schema 11)
Bibliothek auf ~250 (Kettlebell, Calisthenics-Progressionsleitern, Mobilität), dann nach Priorität:
Supersätze/Zirkel und Kardio-Einträge (Fitness & Abnehmen), Aufwärmsätze (zählen nicht), eigene
Fotos (Kamera → IndexedDB, nicht im Datensatz), Übungen zusammenführen, Scheibenrechner,
Sprachansagen für Timer/Halten, Kalender im Verlauf, Programme als Datei teilen, CSV-Export.

## Programme (Inhalt)

3 Sätze, Muskelaufbau 8–12 Wdh., Fitness 12–15; deine Physio-Übungen optional als Block vorne.
Hochrechnung (primär 1, sekundär 0,5 Sätze): Ganzkörper 3× ≈ 9–16 Sätze je Muskel/Woche, jede
Gruppe 3×; OK/UK 4× ≈ 9–18, 2×; PPL mit 3 Tagen nur ≈ 4–9, 1× → PPL erst ab ~5 Tagen empfohlen.
(Bezeichnungen hier nach Grafikquelle; in der App deutsche Namen.)

| Programm | Tag | Übungen |
|---|---|---|
| **Ganzkörper A/B** (deine Empfehlung) | A | Beinpresse, Brustpresse Maschine, Latzug (= dein Lat-Zug), Rumänisches Kreuzheben, Schulterpresse Maschine, Rudern am Kabel (= dein Rudern), Unterarmstütz |
| | B | Goblet Squat, Schrägbank Kurzhantel (= deine), Latzug eng, Hip Thrust, Seitheben (= deins), Beinbeuger sitzend, Face Pull (= deins), Crunch am Kabel |
| Oberkörper/Unterkörper 4× | O1 | dein „Oberkörper“ (unverändert) |
| | U1 | Kniebeuge (alternativ Beinpresse/Hackenschmidt), Rumänisches Kreuzheben, Beinstrecker, Beinbeuger liegend, Wadenheben stehend, Adduktoren-/Abduktorenmaschine, Dead Bug |
| | O2 | Schulterdrücken Kurzhantel, Latzug eng, Brustpresse, Rudern einarmig, Seitheben, Bizepscurl, Trizepsdrücken am Kabel |
| | U2 | Hip Thrust, Ausfallschritte, Beinpresse, Beinbeuger sitzend, Wadenheben sitzend, Pallof Press |
| Push/Pull/Beine (ab 5×) | Push | Bankdrücken, Schrägbank Kurzhantel, Schulterpresse, Seitheben, Butterfly (= deins), Trizepsdrücken |
| | Pull | Latzug, Rudern am Kabel, Reverse Butterfly (= deins), Face Pull, Bizepscurl, Hammercurl |
| | Beine | Kniebeuge/Beinpresse, Rumänisches Kreuzheben, Beinstrecker, Beinbeuger liegend, Wadenheben, Crunch am Kabel |

### Deine 21 Übungen und die Bibliothek (Migration Schema 8)

| Automatisch verknüpft (eindeutig, aus dem Fit7-Plan) | Grafik |
|---|---|
| Lat-Zug (28) · Rudern (29) · Butterfly Maschine (17) · Reverse Butterfly (13) · Facepulls · Seitheben Kurzhantel · Schrägbank Kurzhantel | `lat-pulldown` · `seated-row` · `pec-deck` · `reverse-pec-deck` · `face-pull` · `lateral-raise` · `incline-dumbbell-press` |

**Nur nach deiner Bestätigung in der App** (stammen aus deiner Physio-Liste, Varianten unklar):
Adduktion (= Arm-Adduktion einarmig am Kabel, *nicht* die Beinmaschine), Überzüge (Kurzhantel?),
Incline Frontraise, Kreuzheben (Langhantel?), Tiefes V, Bear hug. Deine übrigen Physio-Übungen
(Aufdehnen, Bein absenken, Serratusstütz, Stütz auf Step, Kopfheben, Uppercut ×2, Holzhacken)
bekommen Kategorie „Physio“; ähnliche Grafiken (z. B. Bein absenken ↔ Everkinetic „Flat Bench
Leg Raises“) nur, wenn du zustimmst, sonst eigenes Foto.

## Risiken

| Risiko | Gegenmaßnahme |
|---|---|
| Migration beschädigt Historie | IDs bleiben, nur leere Felder ergänzt; Rundreise- und Migrationstests; vor Schritt 16 in der App exportieren |
| Programme spalten Historie auf (neue statt deiner Übung) | `installProgram` nutzt zuerst deine Übungen; Test: Ganzkörper verwendet `ex-lat-zug`/`ex-rudern`, „Letztes Mal“ bleibt |
| Grafiken beim ersten Laden komplett vorgeladen | `globIgnores` + Laufzeit-Cache; E2E prüft, dass der Precache keine Grafiken enthält |
| Lizenz CC BY-SA | Namensnennung je Grafik, „verändert“, eigene Lizenzdatei, fester Quell-Commit |
| Qualität der deutschen Texte | 10 Beispiele zur Freigabe, einheitliche Vorlage, Vollständigkeitstest |
| iOS leert den Cache | fehlende Grafiken von „Meine Übungen“ beim Start still nachladen |
| Claude-App fehlt im Teilen-Menü | „Kopieren“ als gleichwertiger Knopf |
| Tests brechen durch Namen aus der Bibliothek (z. B. „Beinpresse“ im AK4b-Test) | Testnamen ändern, die nicht in der Bibliothek stehen; „als neue Übung anlegen“ bleibt sichtbar |

## Verifikation (je Schritt)

- `npm run lint`, `npx tsc -b`, `npm test`. Neue Tests: Rundreise mit vollständiger Fixture,
  Migrationen 7→8→9→10 (deine Werte bleiben, migrierter Seed = frischer Seed), Katalog-Integrität
  (eindeutige Slugs/Namen, gültige Werte, eingefrorene IDs, alle Programm-Übungen vorhanden,
  Grafiken + Lizenzangabe vorhanden), Übernehmen/Verknüpfen, `installProgram`/`nextProgramDay`,
  Duplizieren (neue Programm-/Vorlagen-IDs, gleiche Übungs-IDs, Original unverändert), Schonen
  (Markierung beim Start, Alternativen ohne geschonten Bereich, Coach nimmt Bereich aus, Ablauf
  des Enddatums), Progression, Bestwerte, Volumen/Balance, Brief (Snapshot), JSON-Import.
- `npm run test:e2e` (Chromium, 375 px): Bibliothek → Übung übernehmen → trainieren; Programm
  übernehmen → „Nächstes Training“ rückt weiter; Programm duplizieren → Tag ändern → starten;
  Bereich schonen → betroffene Übung beim Start markiert und tauschbar; freies Training
  unverändert; Steigerung + „Wie letztes Mal“; Coach-Tab;
  Grafiken offline aus dem Cache, Precache ohne Grafiken; 5 Tabs mit ≥ 44 px Touchflächen.
- Screenshots hell/dunkel aller neuen Ansichten; PR → `main`, CI grün, Deploy prüfen; README,
  PROGRESS.md und SPEC.md nachziehen (Datenmodell, 5 Tabs, N5/N8, Nicht-Ziele).
- Am iPhone: Grafiken im Flugmodus, Teilen an die Claude-App, Programmwechsel im Studio.
