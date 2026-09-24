import { SEED_TEMPLATE_ID } from '../domain/seed.ts'

/** Tag eines mitgelieferten Programms: Bibliotheks-IDs; `fromTemplate` übernimmt stattdessen eine vorhandene Vorlage. */
export interface ProgramDayDefinition {
  name: string
  exercises: string[]
  /** Vorhandene Vorlage kopieren (z. B. deine „Oberkörper“); fehlt sie, gelten `exercises`. */
  fromTemplate?: string
}

export interface ProgramDefinition {
  id: string
  name: string
  description: string
  sessionsPerWeek: number
  /** Empfohlen für diese Anzahl Trainingstage pro Woche (einschließlich). */
  recommendedFor: [number, number]
  days: ProgramDayDefinition[]
}

/**
 * Mitgelieferte Programme (ROADMAP „Programme (Inhalt)“). Werden nie verändert; übernommen wird
 * immer eine eigene Kopie. Hochrechnung bei 3 Sätzen: Ganzkörper 3× ≈ 9–16 Sätze je Muskel/Woche.
 */
export const BUILTIN_PROGRAMS: ProgramDefinition[] = [
  {
    id: 'builtin-ganzkoerper',
    name: 'Ganzkörper A/B',
    description: 'Zwei Tage im Wechsel, jede Muskelgruppe bei jedem Training. Ideal bei 2–3 Trainings pro Woche.',
    sessionsPerWeek: 3,
    recommendedFor: [2, 3],
    days: [
      {
        name: 'Ganzkörper A',
        exercises: ['beinpresse', 'brustpresse-maschine', 'latzug-breit', 'rumaenisches-kreuzheben', 'schulterpresse-maschine', 'rudern-kabel-sitzend', 'unterarmstuetz'],
      },
      {
        name: 'Ganzkörper B',
        exercises: ['goblet-squat', 'schraegbank-kurzhantel', 'latzug-eng', 'hip-thrust', 'seitheben-kurzhantel', 'beinbeuger-sitzend', 'face-pull', 'crunch-kabel'],
      },
    ],
  },
  {
    id: 'builtin-ok-uk',
    name: 'Oberkörper/Unterkörper',
    description: 'Vier Tage: zweimal Oberkörper, zweimal Beine und Rumpf. Oberkörper 1 ist deine Vorlage „Oberkörper“.',
    sessionsPerWeek: 4,
    recommendedFor: [4, 4],
    days: [
      {
        name: 'Oberkörper 1',
        fromTemplate: SEED_TEMPLATE_ID,
        exercises: ['brustpresse-maschine', 'latzug-breit', 'rudern-kabel-sitzend', 'schraegbank-kurzhantel', 'seitheben-kurzhantel', 'butterfly-maschine', 'reverse-butterfly-maschine', 'face-pull'],
      },
      {
        name: 'Unterkörper 1',
        exercises: ['kniebeuge-langhantel', 'rumaenisches-kreuzheben', 'beinstrecker', 'beinbeuger-liegend', 'wadenheben-stehend', 'adduktoren-maschine', 'abduktoren-maschine', 'dead-bug'],
      },
      {
        name: 'Oberkörper 2',
        exercises: ['schulterdruecken-kurzhantel', 'latzug-eng', 'brustpresse-maschine', 'rudern-kurzhantel-einarmig', 'seitheben-kurzhantel', 'bizepscurl-kurzhantel', 'trizepsdruecken-kabel'],
      },
      {
        name: 'Unterkörper 2',
        exercises: ['hip-thrust', 'ausfallschritte-kurzhantel', 'beinpresse', 'beinbeuger-sitzend', 'wadenheben-sitzend', 'pallof-press'],
      },
    ],
  },
  {
    id: 'builtin-ppl',
    name: 'Push/Pull/Beine',
    description: 'Drücken, Ziehen, Beine. Erst ab etwa 5 Trainings pro Woche sinnvoll, sonst kommt jede Muskelgruppe nur einmal dran.',
    sessionsPerWeek: 5,
    recommendedFor: [5, 7],
    days: [
      {
        name: 'Push',
        exercises: ['bankdruecken-langhantel', 'schraegbank-kurzhantel', 'schulterpresse-maschine', 'seitheben-kurzhantel', 'butterfly-maschine', 'trizepsdruecken-kabel'],
      },
      {
        name: 'Pull',
        exercises: ['latzug-breit', 'rudern-kabel-sitzend', 'reverse-butterfly-maschine', 'face-pull', 'bizepscurl-kurzhantel', 'hammercurl'],
      },
      {
        name: 'Beine',
        exercises: ['kniebeuge-langhantel', 'rumaenisches-kreuzheben', 'beinstrecker', 'beinbeuger-liegend', 'wadenheben-stehend', 'crunch-kabel'],
      },
    ],
  },
]
