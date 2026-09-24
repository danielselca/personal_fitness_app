# Fortschritt

Stand je Umsetzungsschritt aus SPEC.md Abschnitt 9.

| Schritt | Status | Hinweis |
|---|---|---|
| 1 Projekt-Setup | erledigt | live unter https://danielselca.github.io/personal_fitness_app/ |
| 2 Datenmodell, Store, Persistenz, Seed | erledigt | `src/domain/*`, `src/store/*` |
| 3 Export/Import, Sicherungserinnerung | erledigt | Tab „Mehr“, Erinnerung ab 3 Trainings |
| 4 Übungen | erledigt | Suche, Anlegen, Bearbeiten inkl. Vorgabe, Archivieren, Detail mit Verlauf |
| 5 Aktives Training | erledigt | Start, Auswahl mit Neuanlage, Satzzeilen, Stepper, Abhaken, Notiz, Umsortieren, Bearbeiten-Modus, Abschluss |
| 6 Pausentimer | erledigt | Presets, eigene Dauer, +30 s, Neu, Skip, Endzeitpunkt, Ton, Vibration, Wake Lock |
| 7 Verlauf | erledigt | Liste, Detail mit Korrektur, Datum, Löschen |
| 8 Statistik | erledigt | Trainings/Woche, Volumen, Gewichtsverlauf, Leerzustände |
| 9 Vorlagen | erledigt | Bearbeiten, Löschen, Speichern aus Abschluss und Verlauf |
| 10 Feinschliff, Playwright, CI | erledigt | 85 Unit-/Komponententests, 7 E2E-Tests im Chromium (375 px), Installationshinweis, CI mit E2E |
| 11 Übersichtlichkeit (Feedback 2026-09-13) | erledigt | Nur aktuelle Übung ausgeklappt, blaue/grüne Markierung für aktuell/erledigt, Fortschrittsbalken, Sortiermodus, Übungen ohne Gewicht (`noWeight`, Schema 4), Vorsortierung ohne Gewicht zuerst, Sortiermodus mit ganz nach oben/unten, Standard-Vorlage „Oberkörper“ (12 Übungen), kleinere Zahlen, Hinweise gekürzt |
| 12 Erscheinungsbild (Feedback 2026-09-13) | erledigt | Tokens neu (Orange-Akzent, Anthrazit/Off-White), Kopf mit Datum, Tab-Pille, Kacheln im Trainingskopf, Timer als schwebende Karte, Hell/Dunkel/System-Schalter (`settings.theme`) |
| 13 Halteübungen (Feedback 2026-09-13) | erledigt | `Exercise.mode='hold'`, Donut mit Arbeits-/Pausenstücken und Countdown, automatischer Phasenwechsel mit Signal, Endzeitpunkte persistent (`WorkoutEntry.hold`), Schema 6; 107 Unit-, 11 E2E-Tests |
| 14 Handhabung im Training (UX-Durchsicht 2026-09-24) | erledigt | Aktuelle Übung rückt nach Abschluss der vorigen automatisch nach oben, aktueller Satz bleibt über Timer/Tab-Leiste sichtbar; Haken des aktuellen Satzes gefüllt als Hauptaktion; Papierkorb neben den Steppern entfernt (Löschen nur unter „Bearbeiten“); Spalte „Zuletzt“ entfällt ohne frühere Werte; lange Übungsnamen zweizeilig statt abgeschnitten; Einzahl/Mehrzahl („1 Satz“); Stift-Symbol statt Emoji; überflüssige Pausenzeile im Abschluss entfernt |
| 15 Kopf, Pausenleiste, Startseite (UX-Durchsicht 2026-09-24) | erledigt | Trainingskopf als eine Zeile (Übung · Sätze · Minuten, Balken), bleibt beim Scrollen oben; Sortieren und Pausenauswahl als Symbole im Kopf; Pausenleiste nur bei laufendem Timer oder auf Wunsch (mit ✕); Startseite: Vorlagen mit Start-Knopf und „zuletzt …“, darunter „Freies Training“/„Letztes wiederholen“, Wochenleiste Mo–So und letztes Training in Kurzform; 112 Unit-, 11 E2E-Tests |
| 16 Fundament (Roadmap, siehe [ROADMAP.md](ROADMAP.md)) | erledigt | Laden/Import verlieren keine Felder mehr (Normalisierer je Schlüssel in `src/domain/normalize.ts`, Rundreise-Test mit vollständig befüllten Daten), Einstellungen werden geprüft; archivierte Übungen fehlen beim Vorlagenstart und „Letztes wiederholen“; Suche ohne Umlaut-/Akzent-/Trennzeichen-Unterschiede und mit mehreren Wörtern; Zeilen-Knöpfe mit eindeutigem Namen; Tab-Zustand in `navStore`; exakte E2E-Selektoren; Übungsgrafiken nie im Precache, Größenbudget in CI; 124 Unit-, 11 E2E-Tests |
| 17 Bibliothek-Kern (Roadmap) | erledigt | Taxonomie (`src/domain/taxonomy.ts`: 12 Ausrüstungen in 7 Filtergruppen + Calisthenics, 22 Muskeln, Kategorien, Bewegungsmuster, belastete Bereiche); 60 kuratierte deutsche Übungen mit Tipps und typischen Fehlern (`src/library/curation/`, Generator `npm run library`, Details nachgeladen, IDs eingefroren); Schema 8: `Exercise.libraryId/equipment/muscles/category/pattern`, Migration verknüpft 7 Seed-Übungen und ordnet Physio zu; Übungen-Tab „Meine \| Bibliothek“ mit Chips nach Ausrüstung und Muskelgruppe, Bibliotheks-Detail, „Zu meinen Übungen“ (gleicher Name → Rückfrage „verknüpfen“), eigene Übungen verknüpfen/lösen, Zuordnung im Formular; Übungsauswahl mit Ausrüstungs-Chips und Gruppe „Aus der Bibliothek“; 149 Unit-, 13 E2E-Tests |
| 18a Programme & selbst gestalten (Roadmap) | erledigt | Schema 9: `Program`, `Restriction`, Zielbereich/Pause je Vorlagen-Übung, `Workout.programId/programDayId`, `settings.activeProgramId/weeklyGoal`; mitgelieferte Programme Ganzkörper A/B, Oberkörper/Unterkörper (Tag 1 = deine Vorlage „Oberkörper“), Push/Pull/Beine (`src/programs/builtin.ts`), Übernehmen mit deinen vorhandenen Übungen und optionalem Physio-Block, „Nächstes“ aus dem letzten Programm-Training abgeleitet; Startseite mit Programm-Kasten und „Anderen Tag wählen“; Programme-Ansicht (Wochenziel, Empfehlung, aktivieren, bearbeiten, duplizieren, eigenes Programm); Vorlagen-Editor mit „+ Übung“, Wdh. von–bis, Pause, duplizieren, neue Vorlage; Sicherung mit Programmen; 173 Unit-, 15 E2E-Tests |
| 18b Übung tauschen & Körperbereiche schonen (Roadmap) | erledigt | „Übung tauschen“ im Training (unter „Bearbeiten“, nur heute oder auch in der Vorlage) und im Vorlagen-Editor (⇄): Vorschläge mit gleichem Muster bzw. gleichen Muskeln, deine Übungen zuerst, dann Bibliothek, Ausrüstungs-Chips und Suche (`src/domain/swap.ts`); Mehr → „Körperbereiche schonen“ mit Bereichen, Muskeln, optional „bis Datum“ und Notiz (`src/domain/restrictions.ts`); betroffene Übungen im Training markiert (Alternative / Heute auslassen / Trotzdem), Zähler an Vorlagen und Programm, Hinweis in der Übungsauswahl; belastete Bereiche im Übungsformular; 187 Unit-, 17 E2E-Tests |
| 19a Grafiken & Ausführung (Roadmap) | erledigt | Bewegungsgrafiken für alle 60 Bibliotheksübungen (59 Workout Guide, 1 Everkinetic, CC BY-SA 4.0), aufbereitet mit `npm run media` (fester Quell-Stand, SVGO, ~6 KB je Phase, `public/media/v1` mit `ATTRIBUTION.json` und Lizenzdatei); nicht im Precache, Workbox-Laufzeit-Cache „media-v1“, stilles Vorladen deiner verknüpften Übungen, Platzhalter offline; `ExerciseMedia` (Phasen überblendet, „Bewegung reduzieren“ statisch, hell/dunkel) in Bibliothek, Vorschaubildern, Übungsdetail („Grafik passt nicht?“) und im Training („Ausführung“-Blatt mit Tipps, Fehlern, Muskeln); Mehr → Quellen & Lizenzen; Neuladen bei `vite:preloadError`; 193 Unit-, 19 E2E-Tests (u. a. Grafik offline aus dem Cache) |
| 19b Bibliothek auf 125 (Roadmap) | erledigt | 65 neue Übungen im freigegebenen Stil, alle mit Grafik: Brust (Schrägbank/Negativ Langhantel, Fliegende, Kabel von unten, Multipresse, Liegestütz-Varianten), Schultern (Langhantel-Drücken, Arnold Press, Aufrechtes Rudern, Seitheben Maschine, Frontheben/Reverse am Kabel, Pike-Liegestütz, Band Pull-Apart), Rücken (Langhantel-/T-Bar-/KH-Rudern, einarmig am Kabel, gestreckte Arme, Chin-up, neutral, Negativ-Klimmzug, Shrugs, Face Pull Band, Superman), Beine (Frontkniebeuge, Sumo, RDL KH, Ausfallschritt-Varianten, Multipresse, Waden, Nordic Curl, Kickback/Abduktion am Kabel, Wandsitzen), Arme (Kabel-, Scott-, Konzentrations-, Schrägbank-Curl, Seil-Varianten, Stirndrücken, Kickback, enges Bankdrücken, Dips mit Unterstützung), Rumpf (Beinheben, Reverse Crunch, Russian Twist, Mountain Climber, Holzhacker, Knieheben, Ab-Roller, Fahrrad-Crunch), neu Kategorie Mobilität mit 6 Dehnungen als Halteübung; keine neuen Kettlebell-Übungen (Grafikquelle hat keine); 374 Grafikdateien, 2,2 MB |

## Abnahmekriterien – Nachweis

Legende: **Unit** = Vitest (Logik/Komponenten in jsdom), **E2E** = Playwright gegen den Produktionsbuild inkl. Service Worker, mobile Ansicht 375 px, Chromium. **Gerät** = nur am echten iPhone prüfbar.

| AK | Nachweis | Status |
|---|---|---|
| AK1 Offline nach erstem Laden | E2E `persistence.spec.ts` (Netz aus, Neuladen, Katalog offline) | belegt (Chromium) · iPhone offen |
| AK2 Installation auf dem Homescreen | Manifest/Icons/Standalone im Build geprüft | **offen, nur am Gerät** |
| AK3 Katalog, Suche | Unit `seed.test.ts`, `ExercisesScreen.test.tsx`; E2E `flow.spec.ts` | belegt |
| AK4 Übung anlegen/umbenennen/archivieren | Unit `ExercisesScreen.test.tsx`, `appStore.test.ts` | belegt |
| AK4b Übung im Training anlegen | Unit `TrainingScreen.test.tsx`; E2E `flow.spec.ts` | belegt |
| AK5 Kernablauf ohne Historie (Plan-Vorgabe, Auto-Timer 90 s) | Unit `TrainingScreen.test.tsx`; E2E `flow.spec.ts` | belegt |
| AK6 Kernablauf mit Historie („Letztes Mal“ je Satz) | Unit `suggestions.test.ts`, `TrainingScreen.test.tsx`; E2E `flow.spec.ts` | belegt |
| AK7 Nur Abgehaktes zählt, Verwerfen-Rückfrage | Unit `TrainingScreen.test.tsx`, `stats.test.ts`; E2E `flow.spec.ts` | belegt |
| AK8 Dezimal (Komma/Punkt), Schrittweite | Unit `format.test.ts`, `TrainingScreen.test.tsx`; E2E `flow.spec.ts` | belegt |
| AK9 Satz hinzufügen/ändern/löschen mit Rückgängig | Unit `TrainingScreen.test.tsx`, `appStore.test.ts` | belegt |
| AK10 Umsortieren bleibt nach Neuladen | Unit `appStore.test.ts`; E2E `persistence.spec.ts` | belegt |
| AK11 Autosave, Fortsetzen nach Neuladen inkl. Timer | Unit `appStore.test.ts`; E2E `persistence.spec.ts` | belegt |
| AK12 Timer-Restzeit nach Zeitsprung, „Pause vorbei“ | Unit `TrainingScreen.test.tsx`; E2E `persistence.spec.ts` (Uhr-Emulation) | belegt |
| AK13 Presets, eigene Dauer, +30 s, Neu, Überspringen | Unit `TrainingScreen.test.tsx`, `appStore.test.ts`; E2E `flow.spec.ts` | belegt |
| AK14 Signal (Ton/Vibration) | Logik in `TimerBar.tsx` (Flag `signalled`, Einstellungen); Vibrations-Option nur bei Unterstützung, sonst Hinweis | Ton unter iOS **offen, nur am Gerät** |
| AK15 Wake Lock | `useWakeLock.ts`, Einstellung in „Mehr“ | **offen, nur am Gerät** |
| AK16 Verlauf korrigieren wirkt auf Statistik | Unit `HistoryScreen.test.tsx` | belegt |
| AK17 Statistik-Leerzustände | Unit `HistoryScreen.test.tsx` | belegt |
| AK18 Trainings/Woche mit Nullwochen | Unit `stats.test.ts`, `HistoryScreen.test.tsx`; E2E `flow.spec.ts` | belegt |
| AK19 Gewichtsverlauf mit Wdh. und Tabelle | Unit `stats.test.ts`, `HistoryScreen.test.tsx`; E2E `flow.spec.ts` | belegt |
| AK20 Volumen 1 280 kg, Satz ohne Gewicht | Unit `stats.test.ts` | belegt |
| AK21 Export-Datei | Unit `backup.test.ts`, `MoreScreen.test.tsx`; E2E `backup.spec.ts` (echter Download) | belegt |
| AK22 Import ungültig | Unit `backup.test.ts`, `MoreScreen.test.tsx`; E2E `backup.spec.ts` | belegt |
| AK23 Import gültig: Vorschau, Zusammenführen, Ersetzen mit Vorab-Sicherung | Unit `MoreScreen.test.tsx`; E2E `backup.spec.ts` | belegt |
| AK24 Vorlage startet 8 Übungen, Wiederholen | Unit `TrainingScreen.test.tsx`, `TemplateEditor.test.tsx` | belegt |
| AK25 Touchflächen ≥ 44 px, kein horizontales Scrollen, kein Zoom | E2E `flow.spec.ts` (Maße gemessen) | belegt (Chromium) |
| AK26 Tests grün, PWA installierbar | `npm test`, `npm run test:e2e`, Manifest + SW im Build | belegt; Lighthouse-Lauf offen |
| AK27 Sicherungserinnerung ab 3 Trainings | Unit `appStore.test.ts`, `MoreScreen.test.tsx` | belegt |
| AK28 Gerätewechsel per Export/Import | Unit `backup.test.ts`; E2E `backup.spec.ts` (zweiter Browserkontext) | belegt |

## Offen, nur am echten iPhone prüfbar

- **AK2** Installation über Teilen → „Zum Home-Bildschirm“, Start ohne Browserleiste.
- **AK14** Ton am Ende der Pause unter iOS (Web Audio nach erstem Tipp freigeschaltet).
- **AK15** Bildschirm bleibt während des Trainings an (Wake Lock, iOS ≥ 16.4).
- **AK1 am Gerät**: Flugmodus nach dem ersten Laden (im Chromium belegt, Safari-Verhalten nicht getestet).
- Lighthouse-PWA-Prüfung wurde nicht ausgeführt.
