/**
 * Taxonomie der Übungen (Roadmap Schritt 17): Ausrüstung, Muskeln, Kategorie, Bewegungsmuster,
 * belastete Körperbereiche, Level. Werte sind dauerhafte ASCII-Schlüssel (gespeichert in Übungen
 * und Sicherungen), die deutschen Bezeichnungen stehen daneben.
 */

export const EQUIPMENT = [
  'maschine',
  'seilzug',
  'langhantel',
  'kurzhantel',
  'sz-stange',
  'kettlebell',
  'koerpergewicht',
  'klimmzugstange',
  'band',
  'medizinball',
  'gymnastikball',
  'sonstiges',
] as const
export type Equipment = (typeof EQUIPMENT)[number]

export const EQUIPMENT_LABEL: Record<Equipment, string> = {
  maschine: 'Maschine',
  seilzug: 'Seilzug',
  langhantel: 'Langhantel',
  kurzhantel: 'Kurzhantel',
  'sz-stange': 'SZ-Stange',
  kettlebell: 'Kettlebell',
  koerpergewicht: 'Körpergewicht',
  klimmzugstange: 'Klimmzugstange',
  band: 'Band',
  medizinball: 'Medizinball',
  gymnastikball: 'Gymnastikball',
  sonstiges: 'Sonstiges',
}

/** Filtergruppen für die Chips; „Freihantel“ fasst Lang-, Kurzhantel und SZ-Stange zusammen. */
export const EQUIPMENT_GROUPS = [
  { id: 'maschine', label: 'Maschine', equipment: ['maschine'] },
  { id: 'seilzug', label: 'Seilzug', equipment: ['seilzug'] },
  { id: 'freihantel', label: 'Freihantel', equipment: ['langhantel', 'kurzhantel', 'sz-stange'] },
  { id: 'kettlebell', label: 'Kettlebell', equipment: ['kettlebell'] },
  { id: 'koerpergewicht', label: 'Körpergewicht', equipment: ['koerpergewicht', 'klimmzugstange'] },
  { id: 'band', label: 'Band', equipment: ['band'] },
  { id: 'sonstiges', label: 'Sonstiges', equipment: ['medizinball', 'gymnastikball', 'sonstiges'] },
] as const satisfies readonly { id: string; label: string; equipment: readonly Equipment[] }[]
export type EquipmentGroupId = (typeof EQUIPMENT_GROUPS)[number]['id']

export const REGIONS = ['brust', 'ruecken', 'schultern', 'arme', 'rumpf', 'beine', 'nacken'] as const
export type Region = (typeof REGIONS)[number]

export const REGION_LABEL: Record<Region, string> = {
  brust: 'Brust',
  ruecken: 'Rücken',
  schultern: 'Schultern',
  arme: 'Arme',
  rumpf: 'Rumpf',
  beine: 'Beine',
  nacken: 'Nacken',
}

export const MUSCLES = [
  'brust',
  'lat',
  'oberer-ruecken',
  'oberer-trapez',
  'unterer-ruecken',
  'schulter-vorne',
  'schulter-seitlich',
  'schulter-hinten',
  'rotatorenmanschette',
  'serratus',
  'bizeps',
  'trizeps',
  'unterarme',
  'bauch',
  'seitliche-bauchmuskeln',
  'gesaess',
  'quadrizeps',
  'beinbeuger',
  'waden',
  'adduktoren',
  'abduktoren',
  'nacken',
] as const
export type Muscle = (typeof MUSCLES)[number]

export const MUSCLE_INFO: Record<Muscle, { label: string; region: Region }> = {
  brust: { label: 'Brust', region: 'brust' },
  lat: { label: 'Latissimus', region: 'ruecken' },
  'oberer-ruecken': { label: 'Oberer Rücken', region: 'ruecken' },
  'oberer-trapez': { label: 'Oberer Trapez', region: 'ruecken' },
  'unterer-ruecken': { label: 'Unterer Rücken', region: 'ruecken' },
  'schulter-vorne': { label: 'Schulter vorne', region: 'schultern' },
  'schulter-seitlich': { label: 'Schulter seitlich', region: 'schultern' },
  'schulter-hinten': { label: 'Schulter hinten', region: 'schultern' },
  rotatorenmanschette: { label: 'Rotatorenmanschette', region: 'schultern' },
  serratus: { label: 'Serratus (Sägemuskel)', region: 'schultern' },
  bizeps: { label: 'Bizeps', region: 'arme' },
  trizeps: { label: 'Trizeps', region: 'arme' },
  unterarme: { label: 'Unterarme', region: 'arme' },
  bauch: { label: 'Bauch', region: 'rumpf' },
  'seitliche-bauchmuskeln': { label: 'Seitliche Bauchmuskeln', region: 'rumpf' },
  gesaess: { label: 'Gesäß', region: 'beine' },
  quadrizeps: { label: 'Quadrizeps', region: 'beine' },
  beinbeuger: { label: 'Beinbeuger', region: 'beine' },
  waden: { label: 'Waden', region: 'beine' },
  adduktoren: { label: 'Adduktoren', region: 'beine' },
  abduktoren: { label: 'Abduktoren', region: 'beine' },
  nacken: { label: 'Nacken', region: 'nacken' },
}

export const CATEGORIES = ['kraft', 'mobilitaet', 'kardio', 'physio'] as const
export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_LABEL: Record<Category, string> = {
  kraft: 'Kraft',
  mobilitaet: 'Mobilität',
  kardio: 'Kardio',
  physio: 'Physio',
}

/** Bewegungsmuster inklusive Gelenkaktionen – Grundlage für „Übung tauschen“. */
export const PATTERNS = [
  'druecken-horizontal',
  'druecken-vertikal',
  'ziehen-horizontal',
  'ziehen-vertikal',
  'kniebeuge',
  'hueftstreckung',
  'ausfallschritt',
  'fliegende',
  'reverse-fliegende',
  'seitheben',
  'frontheben',
  'ueberzug',
  'curl',
  'trizeps-streckung',
  'beinstrecken',
  'beinbeugen',
  'wadenheben',
  'adduktion',
  'abduktion',
  'rumpfbeuge',
  'rumpf-stabilitaet',
  'rumpfrotation',
  'rueckenstrecken',
  'tragen',
  'mobilitaet',
] as const
export type Pattern = (typeof PATTERNS)[number]

export const PATTERN_LABEL: Record<Pattern, string> = {
  'druecken-horizontal': 'Drücken horizontal',
  'druecken-vertikal': 'Drücken vertikal',
  'ziehen-horizontal': 'Ziehen horizontal',
  'ziehen-vertikal': 'Ziehen vertikal',
  kniebeuge: 'Kniebeuge',
  hueftstreckung: 'Hüftstreckung',
  ausfallschritt: 'Ausfallschritt',
  fliegende: 'Fliegende',
  'reverse-fliegende': 'Reverse Fliegende',
  seitheben: 'Seitheben',
  frontheben: 'Frontheben',
  ueberzug: 'Überzug',
  curl: 'Curl',
  'trizeps-streckung': 'Trizepsstrecken',
  beinstrecken: 'Beinstrecken',
  beinbeugen: 'Beinbeugen',
  wadenheben: 'Wadenheben',
  adduktion: 'Adduktion',
  abduktion: 'Abduktion',
  rumpfbeuge: 'Rumpfbeuge',
  'rumpf-stabilitaet': 'Rumpf stabilisieren',
  rumpfrotation: 'Rumpfrotation',
  rueckenstrecken: 'Rückenstrecken',
  tragen: 'Tragen',
  mobilitaet: 'Mobilität',
}

/** Belastete Körperbereiche – Grundlage fürs „Schonen“ (Roadmap Schritt 18). */
export const BODY_PARTS = ['schulter', 'ellbogen', 'handgelenk', 'nacken', 'oberer-ruecken', 'unterer-ruecken', 'huefte', 'knie', 'sprunggelenk'] as const
export type BodyPart = (typeof BODY_PARTS)[number]

export const BODY_PART_LABEL: Record<BodyPart, string> = {
  schulter: 'Schulter',
  ellbogen: 'Ellbogen',
  handgelenk: 'Handgelenk',
  nacken: 'Nacken',
  'oberer-ruecken': 'Oberer Rücken',
  'unterer-ruecken': 'Unterer Rücken',
  huefte: 'Hüfte',
  knie: 'Knie',
  sprunggelenk: 'Sprunggelenk',
}

export const LEVELS = ['einsteiger', 'fortgeschritten'] as const
export type Level = (typeof LEVELS)[number]
export const LEVEL_LABEL: Record<Level, string> = { einsteiger: 'Einsteiger', fortgeschritten: 'Fortgeschritten' }

export const TAGS = ['calisthenics'] as const
export type Tag = (typeof TAGS)[number]
export const TAG_LABEL: Record<Tag, string> = { calisthenics: 'Calisthenics' }

export interface MuscleSet {
  primary: Muscle[]
  secondary: Muscle[]
}

export function equipmentGroupOf(e: Equipment): EquipmentGroupId {
  return EQUIPMENT_GROUPS.find((g) => (g.equipment as readonly Equipment[]).includes(e))!.id
}

export function regionsOf(muscles: readonly Muscle[]): Region[] {
  return [...new Set(muscles.map((m) => MUSCLE_INFO[m].region))]
}

const oneOf =
  <T extends string>(values: readonly T[]) =>
  (v: unknown): v is T =>
    typeof v === 'string' && (values as readonly string[]).includes(v)

export const isEquipment = oneOf(EQUIPMENT)
export const isMuscle = oneOf(MUSCLES)
export const isCategory = oneOf(CATEGORIES)
export const isPattern = oneOf(PATTERNS)
export const isBodyPart = oneOf(BODY_PARTS)
