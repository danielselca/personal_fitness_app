# Fortschritt

Stand je Umsetzungsschritt aus SPEC.md Abschnitt 9. Wird nach jedem Schritt fortgeschrieben.

| Schritt | Status | Commit / Hinweis |
|---|---|---|
| 1 Projekt-Setup | erledigt | live unter https://danielselca.github.io/personal_fitness_app/ |
| 2 Datenmodell, Store, Persistenz, Seed | erledigt | `src/domain/*`, `src/store/*`; 53 Tests |
| 3 Export/Import, Sicherungserinnerung | erledigt | Tab „Mehr“: Export, Import mit Vorschau/Zusammenführen/Ersetzen, Erinnerung ab 3 Trainings; Einstellungen und Hinweise; 59 Tests |
| 4 Übungen | erledigt | Liste mit Suche, Anlegen (auch aus Suchtext), Bearbeiten inkl. Vorgabe, Archivieren, Detail mit Verlauf/Diagramm; 64 Tests |
| 5 Aktives Training | offen | |
| 6 Pausentimer | offen | |
| 7 Verlauf | offen | |
| 8 Statistik | offen | |
| 9 Vorlagen | offen | |
| 10 Feinschliff, Playwright, Handy-Durchlauf | offen | |

## Abnahmekriterien – Nachweis

| AK | Nachweis | Status |
|---|---|---|
| AK3 Katalog | `seed.test.ts`, `ExercisesScreen.test.tsx` | Test grün (UI) |
| AK4 Übung anlegen | `appStore.test.ts`, `ExercisesScreen.test.tsx` | Test grün (UI) |
| AK4b Übung im Training anlegen | – | offen (Schritt 5) |
| AK5/AK6 Vorschläge | `suggestions.test.ts`, `appStore.test.ts` | Test grün, UI offen |
| AK7 Nur Abgehaktes zählt | `appStore.test.ts`, `stats.test.ts` | Test grün, UI offen |
| AK9 Sätze bearbeiten (Logik) | `appStore.test.ts` | Test grün, UI offen |
| AK10 Umsortieren (Logik) | `appStore.test.ts` | Test grün, UI offen |
| AK11 Autosave (Store) | `appStore.test.ts` | Test grün, E2E offen |
| AK18/AK19/AK20 Statistik-Logik | `stats.test.ts` | Test grün, UI offen |
| AK21–AK23 Sicherung | `backup.test.ts`, `MoreScreen.test.tsx` | Test grün (UI), E2E offen |
| AK28 Gerätewechsel (Logik) | `backup.test.ts` | Test grün, E2E offen |
| AK27 Sicherungserinnerung | `appStore.test.ts`, `MoreScreen.test.tsx` | Test grün (UI) |

## Nur am Gerät prüfbar (offen, nicht behauptet)

AK2 Installation auf dem iPhone-Homescreen, AK14 Ton unter iOS, AK15 Bildschirm anlassen (Wake Lock).
