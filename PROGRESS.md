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
| 12 Erscheinungsbild (Feedback 2026-09-13) | erledigt | Tokens neu (Orange-Akzent, Anthrazit/Off-White), Kopf mit Datum, Tab-Pille, Kacheln im Trainingskopf, Timer als schwebende Karte, Hell/Dunkel/System-Schalter (`settings.theme`); 97 Unit-, 10 E2E-Tests |

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
