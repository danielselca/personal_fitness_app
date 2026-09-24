import { DEFAULT_HOLD_SEC, type Exercise, type HoldState, type Settings, type WorkoutEntry, type WorkoutSet } from './types.ts'

export function isHold(e: Pick<Exercise, 'mode'>): boolean {
  return e.mode === 'hold'
}

export function holdSecFor(e: Pick<Exercise, 'holdSec'>): number {
  return e.holdSec ?? DEFAULT_HOLD_SEC
}

/** Pause: Vorgabe der Vorlage (im Trainingseintrag) → Pause der Übung → Einstellung. */
export function restSecFor(e: Pick<Exercise, 'defaultRestSec'>, settings: Pick<Settings, 'defaultRestSec'>, entry?: { restSec?: number }): number {
  return entry?.restSec ?? e.defaultRestSec ?? settings.defaultRestSec
}

export interface HoldSegment {
  kind: 'work' | 'rest'
  setIndex: number
  sec: number
  state: 'done' | 'current' | 'pending'
  /** 0..1 Fortschritt, nur für 'current'. */
  progress: number
}

/**
 * Donut-Segmente: je Satz ein Arbeitsstück, dazwischen ein Pausenstück (nach dem letzten Satz keins).
 * Länge proportional zur Dauer.
 */
export function holdSegments(entry: WorkoutEntry, holdSec: number, restSec: number, nowMs: number): HoldSegment[] {
  const out: HoldSegment[] = []
  const n = entry.sets.length
  const h = entry.hold
  const remaining = h ? holdRemainingSec(h, nowMs) : 0
  for (let i = 0; i < n; i++) {
    const set = entry.sets[i]
    const workSec = set.done && set.reps ? set.reps : holdSec
    let state: HoldSegment['state'] = set.done ? 'done' : 'pending'
    let progress = 0
    if (h && h.phase === 'work' && h.setIndex === i && !set.done) {
      state = 'current'
      progress = 1 - remaining / h.durationSec
    }
    out.push({ kind: 'work', setIndex: i, sec: workSec, state, progress })
    if (i < n - 1) {
      let rstate: HoldSegment['state'] = 'pending'
      let rprogress = 0
      if (h && h.phase === 'rest' && h.setIndex === i) {
        rstate = 'current'
        rprogress = 1 - remaining / h.durationSec
      } else if (set.done && (entry.sets[i + 1].done || (h && h.setIndex > i))) {
        rstate = 'done'
      }
      out.push({ kind: 'rest', setIndex: i, sec: restSec, state: rstate, progress: rprogress })
    }
  }
  return out
}

export function holdRemainingSec(h: HoldState, nowMs: number): number {
  if (h.pausedRemainingSec !== undefined) return Math.max(0, h.pausedRemainingSec)
  if (!h.endsAt) return 0
  return Math.max(0, Math.ceil((new Date(h.endsAt).getTime() - nowMs) / 1000))
}

export function startHold(entry: WorkoutEntry, holdSec: number, nowMs: number): WorkoutEntry {
  const setIndex = entry.sets.findIndex((s) => !s.done)
  if (setIndex < 0) return entry
  return { ...entry, hold: { setIndex, phase: 'work', durationSec: holdSec, endsAt: new Date(nowMs + holdSec * 1000).toISOString() } }
}

export function pauseHold(entry: WorkoutEntry, nowMs: number): WorkoutEntry {
  if (!entry.hold || entry.hold.pausedRemainingSec !== undefined) return entry
  const rem = (new Date(entry.hold.endsAt!).getTime() - nowMs) / 1000
  return { ...entry, hold: { ...entry.hold, endsAt: undefined, pausedRemainingSec: Math.max(0, Math.round(rem * 10) / 10) } }
}

export function resumeHold(entry: WorkoutEntry, nowMs: number): WorkoutEntry {
  if (!entry.hold || entry.hold.pausedRemainingSec === undefined) return entry
  return { ...entry, hold: { ...entry.hold, pausedRemainingSec: undefined, endsAt: new Date(nowMs + entry.hold.pausedRemainingSec * 1000).toISOString() } }
}

export interface HoldAdvance {
  entry: WorkoutEntry
  /** Anzahl abgeschlossener Phasen (für Signal). */
  events: number
  /** true, wenn der ganze Ablauf zu Ende ist. */
  finished: boolean
}

/**
 * Treibt den Ablauf voran: jede abgelaufene Phase wird abgeschlossen (Arbeit → Satz abgehakt,
 * dann Pause; Pause → nächster Satz). Auch mehrere Phasen auf einmal, z. B. nach App-Wechsel.
 * `force` schließt die aktuelle Phase sofort ab (Überspringen).
 */
export function advanceHold(entry: WorkoutEntry, holdSec: number, restSec: number, nowMs: number, nowIso: string, force = false): HoldAdvance {
  let cur = entry
  let events = 0
  let finished = false
  let guard = 0
  while (cur.hold && guard++ < 100) {
    const h = cur.hold
    const paused = h.pausedRemainingSec !== undefined
    const endsMs = h.endsAt ? new Date(h.endsAt).getTime() : Number.POSITIVE_INFINITY
    const due = force && events === 0 ? true : !paused && endsMs <= nowMs
    if (!due) break
    events++
    const boundary = force && events === 1 ? nowMs : endsMs
    if (h.phase === 'work') {
      const sets: WorkoutSet[] = cur.sets.map((s, i) => (i === h.setIndex ? { ...s, reps: h.durationSec, weightKg: s.weightKg, done: true, doneAt: nowIso } : s))
      const isLast = h.setIndex >= cur.sets.length - 1
      if (isLast) {
        cur = { ...cur, sets, hold: undefined }
        finished = true
      } else {
        cur = { ...cur, sets, hold: { setIndex: h.setIndex, phase: 'rest', durationSec: restSec, endsAt: new Date(boundary + restSec * 1000).toISOString() } }
      }
    } else {
      const next = h.setIndex + 1
      if (next >= cur.sets.length) {
        cur = { ...cur, hold: undefined }
        finished = true
      } else {
        cur = { ...cur, hold: { setIndex: next, phase: 'work', durationSec: holdSec, endsAt: new Date(boundary + holdSec * 1000).toISOString() } }
      }
    }
    if (force) break
  }
  return { entry: cur, events, finished }
}
