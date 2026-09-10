# SPEC – Persönliche Fitness-App (Version 1)

Stand: 2026-09-09 · Status: Entwurf abgestimmt (Hosting: GitHub Pages; Plan-Werte als editierbare Startvorschläge; Haken in den Notizen werden ignoriert). Schritt 1 erledigt und live unter https://danielselca.github.io/personal_fitness_app/. Export/Import auf Schritt 3 vorgezogen.
Referenzen: `Input/Übungen/IMG_0141` (Notizen), `Input/Fit711App/*` (13 Screenshots der Fit7.11-App). Die Originaldateien werden nicht verändert.

---

## 1. Ziel

Eine kleine, offline nutzbare Web-App fürs Smartphone, die während des Trainings möglichst wenig Tipparbeit verlangt.
Kernablauf: **Training starten → Übung wählen → letzte Werte sehen → Gewicht/Wdh. eintragen → Satz abhaken → Pause → nächster Satz → Training abschließen.**
Nur für eine Person, ohne Login, ohne Backend. Alle Daten bleiben lokal auf dem Gerät; Sicherung per JSON-Export.

---

## 2. Erkenntnisse aus den Referenzen

### 2.1 Übungskatalog aus den Notizen (`IMG_0141`, Liste „Physio (Fitnessstudio)“)

18 Einträge, alle gut lesbar. Reihenfolge wie in den Notizen. Die Notizen enthalten **keine Gewichte oder Wiederholungen** (einzige Ausnahme: „10x10s“ beim Kopfheben).

| # | Name (wörtlich) | Haken | Vermutliche Entsprechung im Fit7.11-Plan | Plan-Vorgabe laut Screenshot |
|---|---|---|---|---|
| 1 | Aufdehnen seitlich | – | – | – |
| 2 | Überzüge | – | – | – |
| 3 | Bein absenken (unterer Bauch) | – | – | – |
| 4 | Serratusstütz | – | – | – |
| 5 | Stütz auf Step | – | – | – |
| 6 | Uppercut Theraband | – | – | – |
| 7 | Uppercut Tuch | – | – | – |
| 8 | Bear hug | – | – | – |
| 9 | Tiefes V | – | – | – |
| 10 | Holzhacken Gummiball Wand | – | – | – |
| 11 | 10x10s Kopfheben 1 cm Doppelkinn | – | – | 10 × 10 s halten (Zeit, kein Gewicht) |
| 12 | Incline Frontraise | – | – | – |
| 13 | Kreuzheben | – | – | – |
| 14 | Rudern | ✓ | 711 #29 – Ruderzug am Kabel | 3 Sätze · 12 × 50 kg · 1:00 Pause |
| 15 | Reverse Butterfly | ✓ | 711 #13 – Butterfly reverse | 3 Sätze · 10 × 30 kg · 1:00 Pause |
| 16 | Adduktion | ✓ | Arm-Adduktion einarmig Kabelzug | 3 Sätze · 12 × 15 kg · Pause nicht sichtbar |
| 17 | Lat-Zug | ✓ | 711 #28 – Latzug am Kabel | 4 Sätze · 10 × 45 kg · 1:30 Pause |
| 18 | Schrägbank Kurzhantel | ✓ | Bankdrücken schräg Kurzhantel | 3 Sätze · 12 × 10 kg · 1:00 Pause |

### 2.2 Zusätzliche Übungen nur aus dem Fit7.11-Plan „Oberkörper Fokus Schulter“

| Name laut App | Plan-Vorgabe |
|---|---|
| 711 #17 – Butterfly Maschine | 4 Sätze · 10 × 35 kg · 1:00 Pause |
| 711 Cable – Facepulls | 3 Sätze · 10 × 30 kg · 1:00 Pause |
| Seitheben Kurzhantel (mit Trainer-Kommentar) | 3 Sätze · 15 × 2 kg · 1:30 Pause |

Weitere Informationen aus den Screenshots: Plan „Oberkörper Fokus Schulter“, 1× pro Woche, Trainingsziel „General fitness“, Club „FITSEVENELEVEN Niederrad Black“, 5 absolvierte Einheiten (Wochen 1–5), Woche 6 offen. Die Zahl hinter „711 #“ ist offenbar die **Gerätenummer im Studio**.

### 2.3 Bedien- und Designmuster der Fit7.11-App, die übernommen werden

- Untere Tab-Leiste mit 4 Einträgen, große Titel, dunkler Kopfbereich, hellgrauer Hintergrund, weiße abgerundete Karten.
- Satzzeile im Format **`1. Satz  10 × 45 kg • 1:30 min Pause`** mit großen, fetten Zahlen; der aktuelle Satz ist hervorgehoben.
- Übungskarte mit Name, Satzanzahl und Info-Symbol; Wochenliste mit runden Haken als Fortschrittsanzeige.
- Klare Hierarchie: eine Hauptaktion pro Bildschirm, wenig Text, viel Weißraum.

---

## 3. Annahmen und offene Punkte

**Unklar in den Bildern (werden in der App als solche behandelt):**

| Punkt | Umgang in v1 |
|---|---|
| Bedeutung der Haken in den Notizen (erledigt? im Fit7.11-Plan enthalten?) | Alle 18 Einträge kommen in den Katalog; Haken haben keine Auswirkung. |
| Zuordnung Notizen ↔ Fit7.11-Namen (z. B. „Adduktion“ = „Arm-Adduktion einarmig Kabelzug“?) | Notizname ist Hauptname, Fit7.11-Name und Gerätenummer stehen als Alias/„Gerät“ dabei und sind durchsuchbar. Zuordnung ist in der Übung als „vermutet“ markiert und editierbar. |
| Kurzhantel-Gewichte: pro Hantel oder gesamt? | Wird so gespeichert wie eingegeben; Übung hat ein Hinweisfeld („pro Hantel“). |
| Pause bei „Arm-Adduktion“ nicht sichtbar | Standardpause der App (90 s) wird verwendet. |
| Halteübungen („10x10s Kopfheben“) | v1 erfasst nur Wdh. + optionales Gewicht; Haltezeit gehört in die Übungsnotiz. Zeit-basierte Sätze sind ein Kandidat für v2. |
| Dehn-/Physio-Übungen ohne Gewicht (Nr. 1–12) | Gewicht ist optional; Satz ohne Gewicht zählt 0 kg zum Volumen, aber als absolvierter Satz. |

**Getroffene Annahmen:**

- A-1 Gerät ist ein **iPhone mit Safari** (Statusleiste in den Screenshots). Android/Chrome wird mitgetestet, aber nicht priorisiert.
- A-2 Die **Plan-Vorgaben aus 2.1/2.2 werden als Startvorschläge** in den Katalog übernommen (klar als „Vorgabe aus Fit7.11-Plan“ gekennzeichnet). Sie erzeugen **keine Trainingshistorie** und erscheinen nirgends in Statistiken. Sätze, Wdh. und Gewicht der Vorgabe sind je Übung editierbar. **Bestätigt.**
- A-3 Die 8 Plan-Übungen werden zusätzlich als **Vorlage „Oberkörper Fokus Schulter“** angelegt, damit das erste Training mit einem Tipp startet.
- A-4 „Homescreen“: Eine PWA legt **nur ein App-Symbol** auf den Homescreen, alles andere passiert in der App. Das Symbol ist optional; die App läuft auch im Browser. Auf dem iPhone ist der Homescreen-Weg allerdings **empfohlen**, weil Safari Website-Daten nach 7 Tagen ohne Nutzung löschen darf, installierte Web-Apps davon ausgenommen sind und beide Wege getrennte Speicher haben (Daten im Safari-Tab tauchen nicht in der Homescreen-App auf). Die App zeigt diesen Hinweis einmalig an.
- A-5 Hosting: statische Dateien über HTTPS (Voraussetzung für Offline-Funktion). GitHub Pages, Repo `personal_fitness_app` – kleingeschrieben, App-Adresse https://danielselca.github.io/personal_fitness_app/ (Account vorhanden). **Bestätigt.** Da GitHub Pages im kostenlosen Tarif ein öffentliches Repo braucht, wird der Ordner `Input/` (private Screenshots) nicht eingecheckt. Übungsnamen und Plan-Vorgaben dürfen im öffentlichen Code stehen (bestätigt 2026-09-10). Nach jedem Umsetzungsschritt wird auf `main` gepusht.
- A-6 Wochenzählung: ISO-Woche, Montag bis Sonntag, lokale Zeit.
- A-7 **Datenhaltung und Gerätewechsel:** Die Daten liegen ausschließlich im Browser des jeweiligen Geräts; es gibt keine Serverkopie und keine Synchronisation zwischen Geräten. Ein Gerätewechsel erfolgt über Export und Import (F12, F13, AK28). Die App fordert dauerhaften Speicher an (N7), was aber weder vor dem Löschen der App noch vor Geräteverlust schützt. Eine spätere automatische Sicherung (z. B. in einen privaten GitHub-Gist) oder echte Synchronisation mit Konto bleibt nachrüstbar, weil der Export bereits die vollständige Datenstruktur erzeugt.

---

## 4. Ansichten (4 Tabs, wenige Bildschirme)

| Tab | Bildschirme | Inhalt |
|---|---|---|
| **Training** | Start · Aktives Training · Übungsauswahl (Sheet) | Start: großer Button „Training starten“ bzw. „Training fortsetzen“, Vorlagen, „Letztes Training wiederholen“, Kurzinfo „Diese Woche: n Trainings“. Aktives Training: Übungsliste mit Sätzen, Pausentimer-Leiste unten, „Abschließen“. |
| **Übungen** | Liste mit Suche · Übungsdetail (Verlauf + Diagramm) · Bearbeiten (Sheet) | Anlegen, bearbeiten, archivieren; Gerätenummer, Standardpause, Gewichtsschritt, Hinweis. |
| **Verlauf** | Liste · Trainingsdetail (ansehen/korrigieren) · Statistik-Segment | Abgeschlossene Trainings mit Datum, Dauer, Volumen. Statistik: Trainings/Woche, Volumen/Training, Gewichtsverlauf je Übung. |
| **Mehr** | Einstellungen · Export/Import · Hinweise | Standardpause, Auto-Start, Ton/Vibration, Bildschirm anlassen, Sicherung, Installationshinweis, Version. |

### Aktives Training – Detailverhalten (wichtigster Bildschirm)

- Jede Übung ist eine Karte mit Satzzeilen. Der **aktuelle Satz** (erster nicht abgehakter) ist hervorgehoben und zeigt große Bedienelemente: Gewicht mit `−`/`+` (Schrittweite je Übung, Standard 2,5 kg), Wdh. mit `−`/`+`, Zahlenfelder für direkte Eingabe, großer Haken rechts.
- Links in jeder Satzzeile steht „Letztes Mal: 10 × 45 kg“ (Werte des gleichen Satzes im letzten abgeschlossenen Training mit dieser Übung).
- Vorschlagswerte werden vorbefüllt, sind editierbar und gelten erst nach dem **Abhaken** als absolviert. Abhaken lässt sich rückgängig machen.
- „Satz hinzufügen“ übernimmt die Werte des vorherigen Satzes. Löschen über Papierkorb mit 5 s „Rückgängig“.
- Übungen hinzufügen (Suche, Mehrfachauswahl), entfernen, mit Pfeilen umsortieren. Notizfeld je Übung (eingeklappt). **Neue Übung direkt aus der Auswahl anlegen:** Findet die Suche nichts, bietet die Liste „‚<Suchtext>‘ als neue Übung anlegen“ an; die Übung wird sofort ins Training übernommen, ohne den Bildschirm zu verlassen. Details (Gerätenummer, Pause, Schrittweite) können später im Katalog ergänzt werden.
- Timer-Leiste bleibt unten sichtbar: Restzeit groß, Buttons „+30 s“, „Neu“, „Überspringen“. Presets 60/90/120 s und eigene Dauer.
- „Training abschließen“ zeigt Zusammenfassung (Dauer, Sätze, Volumen); bei 0 absolvierten Sätzen wird gefragt, ob verworfen werden soll.

---

## 5. Datenmodell (lokal, JSON)

```
Exercise  { id, name, aliases[], machineNo?, hint?, defaultRestSec?, weightStep?,
            planTarget? { sets, reps, weightKg, source: "Fit7.11-Plan" }, archived, createdAt, updatedAt }
Template  { id, name, entries[ { exerciseId, sets } ], createdAt, updatedAt }
Workout   { id, startedAt, finishedAt?, status: "active" | "done", templateId?, note?,
            entries[ { exerciseId, note?, sets[ { id, weightKg?, reps, done, doneAt? } ] } ], updatedAt }
Timer     { endsAt, durationSec, exerciseId? }           // nur während aktivem Training
Settings  { defaultRestSec: 90, autoStartTimer: true, sound: true, vibration: false,
            keepScreenOn: true, weightStep: 2.5, hintsSeen[] }
Backup    { schemaVersion, app, exportedAt, exercises[], templates[], workouts[], settings }
```

Regeln: Gewicht in kg mit bis zu 2 Nachkommastellen, Eingabe mit Komma oder Punkt. Wdh. ganzzahlig ≥ 1. Volumen = Σ (Gewicht × Wdh.) über Sätze mit `done = true`; Sätze ohne Gewicht zählen 0 kg.

---

## 6. Anforderungen

### F – Funktional

- **F1 Katalog:** Seed mit den 18 Notiz-Übungen + 3 Plan-Übungen (Abschnitt 2). Suche über Name, Alias und Gerätenummer. Anlegen, Bearbeiten, Archivieren (nicht Löschen, damit Verlauf erhalten bleibt). Anlegen ist an zwei Stellen möglich: im Tab „Übungen“ (vollständiges Formular) und direkt aus der Übungsauswahl im aktiven Training (nur Name, Rest optional später). Pflichtfeld ist allein der Name; doppelte Namen werden mit Hinweis abgelehnt.
- **F2 Training starten:** leer, aus Vorlage oder als Wiederholung des letzten Trainings. Genau ein aktives Training gleichzeitig.
- **F3 Sätze:** Gewicht (optional, Dezimal) + Wdh. je Satz; hinzufügen, ändern, löschen; Abhaken/Rückgängig; Vorschlag aus letztem Training, sonst Plan-Vorgabe, sonst leer.
- **F4 Letzte Werte:** je Satz sichtbar neben der Eingabe; zusätzlich Datum des letzten Trainings dieser Übung.
- **F5 Notiz je Übung im Training** (optional, einzeilig ausreichend).
- **F6 Autosave:** jede Änderung wird sofort persistiert; nach Neuladen, Tab-Wechsel oder App-Neustart wird das aktive Training samt Timer fortgesetzt.
- **F7 Abschließen:** Training wird mit Endzeit gespeichert; nicht abgehakte Sätze werden verworfen.
- **F8 Verlauf:** Liste abgeschlossener Trainings; Detail mit Korrektur von Gewicht/Wdh., Löschen von Sätzen/Übungen, Ändern von Datum, Löschen des Trainings (mit Bestätigung).
- **F9 Pausentimer:** Presets 60/90/120 s, eigene Dauer, Standard je Übung; Auto-Start beim Abhaken (abschaltbar); Überspringen, Neustart, +30 s; Restzeit aus gespeichertem Endzeitpunkt; Signal am Ende (Ton, Vibration wo verfügbar, große visuelle Anzeige).
- **F10 Bildschirm anlassen:** Wake Lock während aktivem Training (abschaltbar), damit Timer und Signal zuverlässig funktionieren.
- **F11 Statistik:** Trainings pro Woche (letzte 12 Wochen, Nullwochen sichtbar), Volumen pro Training, Gewichtsverlauf je Übung (Höchstgewicht je Training mit zugehörigen Wdh., zusätzlich Tabelle). Leerzustände mit Handlungshinweis statt Beispieldaten.
- **F12 Export:** JSON-Datei mit allen Daten und `schemaVersion`; Dateiname mit Datum.
- **F13 Import:** Datei wählen → validieren (Struktur, Typen, Version) → Vorschau (Anzahl Übungen/Trainings/Vorlagen) → Wahl „Zusammenführen“ (neue IDs ergänzen, gleiche IDs: neuerer `updatedAt` gewinnt) oder „Alles ersetzen“ (nur nach ausdrücklicher Bestätigung, vorher automatische Sicherung des aktuellen Stands). Ungültige Dateien ändern nichts.
- **F14 Vorlagen:** aus aktuellem/abgeschlossenem Training speichern, umbenennen, löschen, Übungen umsortieren. Seed: „Oberkörper Fokus Schulter“.
- **F15 Sicherungserinnerung:** Die App merkt sich Datum und Datenstand der letzten Sicherung. Sind seither **3 oder mehr Trainings** abgeschlossen worden, erscheint im Tab „Mehr“ und einmalig nach dem Abschluss eines Trainings ein dezenter Hinweis mit direktem Weg zum Export. Der Hinweis lässt sich schließen und blockiert nichts.

### N – Nicht-funktional

- **N1** Deutsche Oberfläche, Zahlen im deutschen Format („12,5 kg“).
- **N2** Optimiert für 375 px Breite; alle Touchflächen ≥ 44 × 44 px; Eingabefelder ≥ 16 px Schrift (kein Auto-Zoom auf iOS); Safe-Area beachtet.
- **N3** Hauptaktionen im unteren Drittel (Daumenzone); kein Tab-Wechsel nötig, um einen Satz zu erfassen.
- **N4** Kontrast mindestens WCAG AA; Zahlen im Training ≥ 20 px fett.
- **N5** Offline nach erstem Laden (Service Worker, alle Assets vorgeladen); Update-Hinweis bei neuer Version.
- **N6** Installierbar (Manifest, Icons, Standalone-Modus); nutzbar auch ohne Installation.
- **N7** Persistenter Speicher (IndexedDB, `navigator.storage.persist()` wird angefragt).
- **N8** Kein Netzwerkaufruf außer dem Laden der App selbst; keine Analytics, keine externen Schriften.
- **N9** Domänenlogik (Volumen, Wochen, Vorschläge, Timer, Import-Validierung) durch automatisierte Tests abgedeckt.

### Grenzen von Ton und Vibration (werden in der App unter „Mehr“ erklärt)

| Situation | iPhone/Safari | Android/Chrome |
|---|---|---|
| App im Vordergrund, Bildschirm an | Ton ✓ (nach erstem Tipp freigeschaltet) · Vibration ✗ (API nicht vorhanden) | Ton ✓ · Vibration ✓ |
| App im Hintergrund oder Bildschirm gesperrt | Kein Ton, keine Vibration: JavaScript wird angehalten | Meist kein Signal (Timer werden gedrosselt) |
| Rückkehr in die App | Restzeit ist korrekt (Endzeitpunkt gespeichert); „Pause vorbei“ wird angezeigt | wie iPhone |

Konsequenz: v1 hält den Bildschirm während des Trainings per Wake Lock an (Standard an). Push-Benachrichtigungen mit Zeitplanung gibt es im Web nicht; das ist keine Lösung für v1.

---

## 7. Abnahmekriterien (überprüfbar)

- [ ] **AK1 Offline:** App einmal online laden, Flugmodus an, App neu laden → startet und funktioniert vollständig.
- [ ] **AK2 Installation:** „Zum Home-Bildschirm“ zeigt Icon und Namen; App öffnet ohne Browserleiste.
- [ ] **AK3 Katalog:** Nach Erstinstallation sind genau die 21 Übungen aus Abschnitt 2 vorhanden, Namen wörtlich wie in den Notizen; Suche „28“ findet „Lat-Zug“, Suche „butterfly“ findet beide Butterfly-Übungen.
- [ ] **AK4 Übung anlegen:** Neue Übung „Test“ im Tab „Übungen“ anlegen, umbenennen, archivieren → verschwindet aus Auswahl, bleibt im Verlauf. Name ist Pflicht, Name „Lat-Zug“ (bereits vorhanden) wird mit Hinweis abgelehnt.
- [ ] **AK4b Übung im Training anlegen:** Im aktiven Training „Beinpresse“ suchen (nicht vorhanden) → Angebot „als neue Übung anlegen“ → Übung erscheint sofort im Training und danach im Katalog; die Eingabe auf dem Handy erfordert nur den Namen.
- [ ] **AK5 Kernablauf ohne Historie:** Training starten, „Lat-Zug“ hinzufügen → 4 Sätze mit „Vorgabe: 10 × 45 kg“ vorbefüllt, keine „Letztes Mal“-Angabe. Satz 1 abhaken → Timer startet automatisch mit 90 s (Übungspause).
- [ ] **AK6 Kernablauf mit Historie:** Nach einem abgeschlossenen Training mit Lat-Zug (z. B. 3 Sätze 10 × 45, 10 × 45, 8 × 47,5) zeigt das nächste Training je Satz „Letztes Mal“ mit genau diesen Werten und befüllt die Eingabe damit; Satz 3 zeigt 47,5 kg.
- [ ] **AK7 Nur Abgehaktes zählt:** Vorbefüllte, nicht abgehakte Sätze erscheinen nicht im Volumen und nicht im Verlauf; Abschluss mit 0 abgehakten Sätzen fragt „Verwerfen?“.
- [ ] **AK8 Dezimal:** Eingabe „12,5“ und „12.5“ ergeben 12,5 kg; Anzeige „12,5 kg“; `+`-Taste erhöht um Übungsschritt (Standard 2,5).
- [ ] **AK9 Sätze bearbeiten:** Satz hinzufügen (übernimmt Werte des vorherigen), Werte ändern, Satz löschen mit „Rückgängig“ innerhalb 5 s.
- [ ] **AK10 Umsortieren:** Übung nach oben/unten verschieben, Reihenfolge bleibt nach Neuladen erhalten.
- [ ] **AK11 Autosave:** Während eines Trainings Tab schließen bzw. App beenden, erneut öffnen → „Training fortsetzen“ mit allen Sätzen, Eingaben und laufendem Timer.
- [ ] **AK12 Timer-Endzeit:** Timer 90 s starten, App 30 s verlassen, zurückkehren → Rest ≈ 60 s. Nach Ablauf im Hintergrund: „Pause vorbei“ sichtbar.
- [ ] **AK13 Timer-Bedienung:** Presets 60/90/120 und eigene Dauer setzen die Zeit; „+30 s“ verlängert; „Neu“ startet mit gleicher Dauer; „Überspringen“ beendet ohne Signal.
- [ ] **AK14 Signal:** Bei Ablauf im Vordergrund ertönt ein Ton (Einstellung „Ton“) und die Anzeige wechselt deutlich; auf Geräten ohne Vibrations-API ist die Option ausgeblendet und mit Hinweis erklärt.
- [ ] **AK15 Wake Lock:** Bei aktiviertem „Bildschirm anlassen“ schaltet sich der Bildschirm während des aktiven Trainings nicht ab (auf unterstützten Geräten).
- [ ] **AK16 Verlauf korrigieren:** Gewicht eines Satzes im abgeschlossenen Training ändern → Statistik und „Letztes Mal“ verwenden den korrigierten Wert.
- [ ] **AK17 Statistik leer:** Ohne abgeschlossenes Training zeigen alle drei Statistiken einen Leerzustand mit Hinweis; keine Beispieldaten.
- [ ] **AK18 Trainings/Woche:** Zwei Trainings in derselben ISO-Woche → Balken „2“; Wochen ohne Training zeigen „0“; letzte 12 Wochen inkl. aktueller.
- [ ] **AK19 Gewichtsverlauf:** Je Übung ein Punkt pro abgeschlossenem Training mit Höchstgewicht und Wdh. als Beschriftung; Tabelle darunter stimmt mit dem Verlauf überein.
- [ ] **AK20 Volumen:** Training mit 10 × 45 + 10 × 45 + 8 × 47,5 → 1 280 kg; ein Satz ohne Gewicht ändert das Volumen nicht, zählt aber als Satz.
- [ ] **AK21 Export:** Datei `fitness-backup-JJJJ-MM-TT.json` enthält alle Übungen, Vorlagen, Trainings, Einstellungen und `schemaVersion`.
- [ ] **AK22 Import ungültig:** Nicht-JSON, fremdes JSON oder falsche Version → Fehlermeldung, Daten unverändert.
- [ ] **AK23 Import gültig:** Vorschau mit Anzahlen; „Zusammenführen“ ergänzt nur Neues und verliert nichts; „Alles ersetzen“ verlangt Bestätigung und legt vorher eine Sicherung ab.
- [ ] **AK24 Vorlage:** „Oberkörper Fokus Schulter“ startet ein Training mit den 8 Plan-Übungen in Planreihenfolge; „Letztes Training wiederholen“ übernimmt die Übungsliste des letzten Trainings.
- [ ] **AK25 Bedienung:** Alle Buttons ≥ 44 px; keine horizontale Scrollleiste bei 375 px; Fokus auf Zahlenfeld zoomt nicht; Tab-Leiste über der Home-Geste.
- [ ] **AK26 Tests:** `npm test` läuft grün; Lighthouse-Kategorie „PWA“ meldet installierbar.
- [ ] **AK27 Sicherungserinnerung:** Nach dem dritten abgeschlossenen Training seit der letzten Sicherung erscheint der Hinweis; nach einem Export verschwindet er und der Zähler beginnt neu.
- [ ] **AK28 Gerätewechsel:** Export auf Gerät A, Import auf Gerät B (oder in einem frisch geleerten Browserprofil) stellt Übungen, Vorlagen, Trainings und Einstellungen vollständig wieder her; „Letztes Mal“-Werte und Statistiken stimmen danach mit Gerät A überein.

---

## 8. Technische Lösung

**Gewählt:** Vite + React + TypeScript, `vite-plugin-pwa` (Workbox), Zustand für den Zustand, IndexedDB über `idb-keyval` als Persistenz (gesamter Datenbestand als ein Dokument, Autosave bei jeder Änderung), Diagramme als handgeschriebenes SVG, Vitest für Logik- und Komponententests, **Playwright** für Ende-zu-Ende-Prüfungen im echten Browser (mobile Ansicht 375 px, Offline-Betrieb, Neuladen, Sichtbarkeitswechsel). Keine UI-Bibliothek, eigenes kleines CSS mit Design-Tokens.

**Warum:** Es gibt kein bestehendes Projekt. Der Stack ist etabliert, klein, ohne Backend und in Jahren noch wartbar. Ein Service Worker macht die App nach dem ersten Laden offline nutzbar; IndexedDB bietet auf dem iPhone mehr Platz und Beständigkeit als localStorage. Ein Dokument statt Tabellen hält Export/Import trivial (Datenmenge nach Jahren < 1 MB). Diagramme brauchen keine Bibliothek: drei einfache Balken-/Liniendiagramme.

**Verworfen:** Native App (App-Store/Signierung, unnötig), reines HTML ohne Build (Zustandsverwaltung würde schnell unübersichtlich), Chart-Bibliothek (Gewicht, Styling), Cloud-Sync (nicht gewünscht).

**Betrieb:** Statisches Hosting über HTTPS (GitHub Pages mit Deploy-Workflow vorgeschlagen). Lokale Entwicklung mit `npm run dev`, Handy-Test im gleichen WLAN.

---

## 9. Umsetzungsplan

| Schritt | Inhalt | Ergebnis | Status |
|---|---|---|---|
| 1 | Projekt-Setup: Vite/React/TS, PWA-Plugin, Vitest, Design-Tokens, App-Shell mit 4 Tabs, Safe-Area, Deployment | Leere App läuft auf dem Handy, installierbar | **erledigt** (2026-09-10, live) |
| 2 | Datenmodell, Store, Persistenz, Seed (21 Übungen, 1 Vorlage), Migrations-Gerüst (`schemaVersion`) | Daten überleben Neuladen | offen |
| 3 | **Export/Import mit Validierung, Sicherungserinnerung** | F12, F13, F15 | offen |
| 4 | Übungen: Liste, Suche, Anlegen/Bearbeiten/Archivieren | F1 | offen |
| 5 | Aktives Training: Start, Auswahl, Satzzeilen mit Vorschlag/„Letztes Mal“, Abhaken, Notiz, Umsortieren, Abschluss, Resume | F2–F7 (Kern) | offen |
| 6 | Pausentimer mit Endzeitpunkt, Auto-Start, Signal, Wake Lock | F9, F10 | offen |
| 7 | Verlauf mit Korrektur | F8 | offen |
| 8 | Statistik mit Leerzuständen | F11 | offen |
| 9 | Vorlagen, „Letztes Training wiederholen“ | F14 | offen |
| 10 | Feinschliff: Hinweise (Installation, Speicher, Signalgrenzen), Tests, Handy-Durchlauf aller AK | AK1–AK28 | offen |

**Warum Export/Import so früh (Schritt 3 statt 8):** Die Trainingsdaten liegen ausschließlich im Browser des Geräts. Ohne Sicherungsweg gäbe es eine Phase, in der echte Trainings erfasst werden, die bei Geräteverlust, App-Löschung oder Gerätewechsel unwiederbringlich wären. Ab Schritt 3 existiert für jeden erfassten Datensatz ein Weg, ihn zu sichern und auf ein neues Gerät zu übertragen.

Nach Schritt 6 ist der Kernablauf im Studio benutzbar.

---

## 10. Nicht im Umfang (v1)

Login, Cloud-Sync, Social, Abos, Ernährung, KI-Coaching, Push-Benachrichtigungen, Supersätze, zeitbasierte Sätze, Körpergewichtsverlauf, 1RM-Rechner, Apple-Health-Anbindung, Mehrsprachigkeit.
