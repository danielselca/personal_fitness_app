# Fortschritt

Stand je Umsetzungsschritt aus SPEC.md Abschnitt 9. Wird nach jedem Schritt fortgeschrieben.

| Schritt | Status | Commit / Hinweis |
|---|---|---|
| 1 Projekt-Setup | erledigt | live unter https://danielselca.github.io/personal_fitness_app/ |
| 2 Datenmodell, Store, Persistenz, Seed | erledigt | `src/domain/*`, `src/store/*`; 53 Tests |
| 3 Export/Import, Sicherungserinnerung | erledigt | Tab „Mehr“: Export, Import mit Vorschau/Zusammenführen/Ersetzen, Erinnerung ab 3 Trainings; Einstellungen und Hinweise; 59 Tests |
| 4 Übungen | erledigt | Liste mit Suche, Anlegen (auch aus Suchtext), Bearbeiten inkl. Vorgabe, Archivieren, Detail mit Verlauf/Diagramm; 64 Tests |
| 5 Aktives Training | erledigt | Start (leer, Vorlage, Wiederholen), Übungsauswahl mit Neuanlage, Satzzeilen mit „Letztes Mal“, Stepper, Abhaken, Notiz, Umsortieren, Löschen mit Rückgängig, Abschluss/Verwerfen, Zusammenfassung |
| 6 Pausentimer | erledigt | Timer-Leiste mit Presets 60/90/120, eigene Dauer, +30 s, Neu, Überspringen; Endzeitpunkt gespeichert; Ton (Web Audio), Vibration (wo verfügbar), Wake Lock |
| 7 Verlauf | offen | |
| 8 Statistik | offen | |
| 9 Vorlagen | offen | |
| 10 Feinschliff, Playwright, Handy-Durchlauf | offen | |

## Abnahmekriterien – Nachweis

| AK | Nachweis | Status |
|---|---|---|
| AK3 Katalog | `seed.test.ts`, `ExercisesScreen.test.tsx` | Test grün (UI) |
| AK4 Übung anlegen | `appStore.test.ts`, `ExercisesScreen.test.tsx` | Test grün (UI) |
| AK4b Übung im Training anlegen | `TrainingScreen.test.tsx` | Test grün (UI) |
| AK5/AK6 Vorschläge, Letztes Mal | `suggestions.test.ts`, `appStore.test.ts`, `TrainingScreen.test.tsx` | Test grün (UI) |
| AK7 Nur Abgehaktes zählt | `appStore.test.ts`, `stats.test.ts`, `TrainingScreen.test.tsx` | Test grün (UI) |
| AK8 Dezimal + Stepper | `format.test.ts`, `TrainingScreen.test.tsx` | Test grün (UI) |
| AK9 Sätze bearbeiten | `appStore.test.ts`, `TrainingScreen.test.tsx` | Test grün (UI, inkl. Rückgängig 5 s) |
| AK10 Umsortieren | `appStore.test.ts`, `TrainingScreen.test.tsx` | Test grün (UI); Persistenz über Neuladen: E2E offen |
| AK11 Autosave/Wiederaufnahme | `appStore.test.ts`, `TrainingScreen.test.tsx` | Test grün, E2E offen |
| AK12 Timer-Endzeit | `TrainingScreen.test.tsx` (Zeitsprung + Sichtbarkeitswechsel) | Test grün, E2E offen |
| AK13 Timer-Bedienung | `appStore.test.ts`, `TrainingScreen.test.tsx` | Test grün (UI) |
| AK24 Vorlage/Wiederholen | `appStore.test.ts`, `TrainingScreen.test.tsx` | Test grün (UI) |
| AK18/AK19/AK20 Statistik-Logik | `stats.test.ts` | Test grün, UI offen |
| AK21–AK23 Sicherung | `backup.test.ts`, `MoreScreen.test.tsx` | Test grün (UI), E2E offen |
| AK28 Gerätewechsel (Logik) | `backup.test.ts` | Test grün, E2E offen |
| AK27 Sicherungserinnerung | `appStore.test.ts`, `MoreScreen.test.tsx` | Test grün (UI) |

## Nur am Gerät prüfbar (offen, nicht behauptet)

AK2 Installation auf dem iPhone-Homescreen, AK14 Ton unter iOS, AK15 Bildschirm anlassen (Wake Lock).
