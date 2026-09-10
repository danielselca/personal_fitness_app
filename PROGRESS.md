# Fortschritt

Stand je Umsetzungsschritt aus SPEC.md Abschnitt 9. Wird nach jedem Schritt fortgeschrieben.

| Schritt | Status | Commit / Hinweis |
|---|---|---|
| 1 Projekt-Setup | erledigt | live unter https://danielselca.github.io/personal_fitness_app/ |
| 2 Datenmodell, Store, Persistenz, Seed | erledigt | `src/domain/*`, `src/store/*`; 53 Tests |
| 3 Export/Import, Sicherungserinnerung | offen | Domänenlogik (`backup.ts`) bereits mit Tests, UI fehlt |
| 4 Übungen | offen | |
| 5 Aktives Training | offen | |
| 6 Pausentimer | offen | |
| 7 Verlauf | offen | |
| 8 Statistik | offen | |
| 9 Vorlagen | offen | |
| 10 Feinschliff, Playwright, Handy-Durchlauf | offen | |

## Abnahmekriterien – Nachweis

| AK | Nachweis | Status |
|---|---|---|
| AK3 Katalog | `seed.test.ts` | Test grün |
| AK4 Übung anlegen (Logik) | `appStore.test.ts` | Test grün, UI offen |
| AK5/AK6 Vorschläge | `suggestions.test.ts`, `appStore.test.ts` | Test grün, UI offen |
| AK7 Nur Abgehaktes zählt | `appStore.test.ts`, `stats.test.ts` | Test grün, UI offen |
| AK9 Sätze bearbeiten (Logik) | `appStore.test.ts` | Test grün, UI offen |
| AK10 Umsortieren (Logik) | `appStore.test.ts` | Test grün, UI offen |
| AK11 Autosave (Store) | `appStore.test.ts` | Test grün, E2E offen |
| AK18/AK19/AK20 Statistik-Logik | `stats.test.ts` | Test grün, UI offen |
| AK21–AK23, AK28 Sicherung (Logik) | `backup.test.ts` | Test grün, UI offen |
| AK27 Sicherungszähler | `appStore.test.ts` | Test grün, UI offen |

## Nur am Gerät prüfbar (offen, nicht behauptet)

AK2 Installation auf dem iPhone-Homescreen, AK14 Ton unter iOS, AK15 Bildschirm anlassen (Wake Lock).
