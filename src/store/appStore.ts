import { createStore, type StoreApi } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { applyImport, type ImportMode, type ImportResult } from '../domain/backup.ts'
import { newId, nowIso } from '../domain/ids.ts'
import { adoptExercise } from '../domain/adopt.ts'
import { dayKey } from '../domain/restrictions.ts'
import { migrateAppData } from '../domain/migrate.ts'
import { advanceHold, holdSecFor, pauseHold, restSecFor, resumeHold, startHold } from '../domain/hold.ts'
import { noWeightFirst } from '../domain/progress.ts'
import { createSeedData } from '../domain/seed.ts'
import { progressionFor, type ProgressionTarget } from '../domain/coach/progression.ts'
import { lastValuesFor, normalizeName, suggestSets } from '../domain/suggestions.ts'
import {
  builtinProgram,
  createEmptyProgram,
  deleteProgram as deleteProgramData,
  duplicateProgram as duplicateProgramData,
  duplicateTemplate as duplicateTemplateData,
  installProgram as installProgramData,
  type InstallOptions,
} from '../domain/programs.ts'
import type { AppData, Backup, EntryRating, Exercise, Program, ProgramDay, Restriction, Settings, Template, TemplateEntry, Workout, WorkoutEntry, WorkoutSet } from '../domain/types.ts'
import { idbStorage, type DataStorage } from './persistence.ts'

export type ExerciseInput = Omit<Exercise, 'id' | 'createdAt' | 'updatedAt' | 'archived' | 'aliases'> & {
  aliases?: string[]
}

/**
 * Ergebnis von `adoptFromLibrary`: vorhandene oder neu angelegte eigene Übung. `name-match` heißt:
 * Es gibt schon eine eigene, nicht verknüpfte Übung mit gleichem Namen – die Oberfläche fragt, ob
 * sie verknüpft (`linkTo`) oder eine neue angelegt werden soll (`createNew`).
 */
export type AdoptResult =
  | { status: 'existing' | 'linked' | 'created'; exercise: Exercise }
  | { status: 'name-match'; exercise: Exercise }
  | { status: 'unknown' }

export type StartOptions =
  | { templateId?: string }
  | { programId: string; dayId: string }
  | { exerciseIds: string[] }
  | { repeatLast: true }
  | undefined

export interface AppStore {
  data: AppData
  hydrated: boolean
  loadError: string | null
  hydrate(): Promise<void>
  flush(): Promise<void>

  // Übungen
  addExercise(input: ExerciseInput): { ok: true; exercise: Exercise } | { ok: false; error: string }
  updateExercise(id: string, patch: Partial<Omit<Exercise, 'id' | 'createdAt'>>): { ok: true } | { ok: false; error: string }
  setExerciseArchived(id: string, archived: boolean): void
  /** Bibliotheksübung in „Meine Übungen“ holen: Verknüpfung → feste ID → gleicher Name (Rückfrage) → neu. */
  adoptFromLibrary(entryId: string, opts?: { linkTo?: string; createNew?: boolean }): AdoptResult
  /** Eigene Übung mit einem Bibliothekseintrag verknüpfen (`null` löst die Verknüpfung). */
  linkExercise(exerciseId: string, entryId: string | null): void

  // Aktives Training
  activeWorkout(): Workout | null
  startWorkout(opts?: StartOptions): Workout
  addExerciseToWorkout(exerciseId: string): void
  removeExerciseFromWorkout(exerciseId: string): void
  /**
   * Übung im laufenden Training tauschen: gleiche Position und Satzzahl, Werte aus dem Verlauf der
   * neuen Übung. Nur ohne abgehakte Sätze und wenn die neue Übung noch nicht im Training ist.
   */
  replaceExerciseInWorkout(oldId: string, newId: string): boolean
  /** Übung in einer Vorlage tauschen (Sätze und Wdh.-Bereich bleiben). */
  replaceExerciseInTemplate(templateId: string, oldId: string, newId: string): void
  moveWorkoutEntry(exerciseId: string, direction: -1 | 1): void
  moveWorkoutEntryToEnd(exerciseId: string, end: 'top' | 'bottom'): void
  /** Übungen ohne Gewicht nach vorn, Reihenfolge sonst unverändert. */
  sortWorkoutNoWeightFirst(): void
  addSet(exerciseId: string): void
  updateSet(exerciseId: string, setId: string, patch: Partial<Pick<WorkoutSet, 'weightKg' | 'reps'>>): void
  deleteSet(exerciseId: string, setId: string): { set: WorkoutSet; index: number } | null
  restoreSet(exerciseId: string, set: WorkoutSet, index: number): void
  setSetDone(exerciseId: string, setId: string, done: boolean): boolean
  setEntryNote(exerciseId: string, note: string): void
  /** „Wie letztes Mal“: offene Sätze auf die Werte der letzten Einheit setzen (Coach-Hinweis entfällt). */
  applyLastValues(exerciseId: string): void
  /** „Wie war's?“ – leicht / passend / schwer (undefined löscht). */
  setEntryRating(exerciseId: string, rating: EntryRating | undefined): void
  // Halteübungen (Donut): Ablauf Arbeit → Pause → … je Übung
  startHold(exerciseId: string, nowMs?: number): void
  pauseHold(exerciseId: string, nowMs?: number): void
  resumeHold(exerciseId: string, nowMs?: number): void
  /** Aktuelle Phase sofort abschließen (Überspringen). */
  skipHoldPhase(exerciseId: string, nowMs?: number): number
  /** Ablauf abbrechen; abgehakte Sätze bleiben. */
  stopHold(exerciseId: string): void
  /** Abgelaufene Phasen nachziehen; liefert die Zahl abgeschlossener Phasen (für das Signal). */
  advanceHold(exerciseId: string, nowMs?: number): number
  finishWorkout(): Workout | null
  discardWorkout(): void

  // Verlauf
  updateWorkout(id: string, updater: (w: Workout) => Workout): void
  deleteWorkout(id: string): void

  // Timer
  startTimer(durationSec: number, exerciseId?: string): void
  addTimerSeconds(sec: number): void
  restartTimer(): void
  stopTimer(): void
  markTimerSignalled(): void

  // Einstellungen, Vorlagen, Sicherung
  updateSettings(patch: Partial<Settings>): void
  saveTemplate(name: string, entries: TemplateEntry[]): Template
  updateTemplate(id: string, patch: Partial<Pick<Template, 'name' | 'entries'>>): void
  deleteTemplate(id: string): void
  /** Leere eigene Vorlage. */
  createTemplate(name: string): Template
  /** Kopie als eigenständige Vorlage (auch von einem Programm-Tag). */
  duplicateTemplate(id: string): Template | null

  // Programme
  /** Mitgeliefertes Programm als eigene Kopie übernehmen und aktivieren. */
  installProgram(builtinId: string, opts: InstallOptions): Program | null
  /**
   * Programm aus einem geprüften Import (Claude) anlegen, wahlweise aktivieren. `build` legt es in
   * den aktuellen Daten an (z. B. `importProgram` aus `programJson.ts`, das nachgeladen wird).
   */
  importProgram(build: (data: AppData, at: string) => { data: AppData; program: Program }, activate: boolean): Program
  createProgram(name: string): Program
  /** Name, Ziel, Tage/Woche oder Tage (Reihenfolge, Namen) ändern; Tagesnamen gehen an die Vorlagen. */
  updateProgram(id: string, patch: Partial<Pick<Program, 'name' | 'goal' | 'sessionsPerWeek' | 'days'>>): void
  /** Neuer, leerer Tag mit eigener Vorlage. */
  addProgramDay(programId: string, name: string): ProgramDay | null
  /** Tag und seine Vorlage entfernen (abgeschlossene Trainings bleiben). */
  removeProgramDay(programId: string, dayId: string): void
  duplicateProgram(id: string): Program | null
  deleteProgram(id: string): void
  setActiveProgram(id: string | undefined): void

  // Körperbereiche schonen
  addRestriction(input: Pick<Restriction, 'bodyParts' | 'muscles' | 'note' | 'until'>): Restriction | null
  removeRestriction(id: string): void
  /** Schonen beenden: gilt ab heute nicht mehr, bleibt aber für den Wiedereinstieg erhalten. */
  endRestriction(id: string): void

  // Profil
  /** Körpergewicht für einen Tag eintragen (ersetzt einen Eintrag vom selben Tag). */
  addBodyWeight(date: string, weightKg: number): boolean
  removeBodyWeight(id: string): void
  markBackupDone(): void
  importBackup(backup: Backup, mode: ImportMode): ImportResult
  markHintSeen(id: string): void
  replaceData(data: AppData): void
}

export function createAppStore(storage: DataStorage): StoreApi<AppStore> {
  let saving: Promise<void> | null = null
  let pending: AppData | null = null

  /** Sofort speichern; laufende Schreibvorgänge werden zusammengefasst (F6). */
  function persist(data: AppData) {
    pending = data
    if (saving) return
    const run = async () => {
      while (pending) {
        const next = pending
        pending = null
        try {
          await storage.save(next)
        } catch (err) {
          console.error('Speichern fehlgeschlagen', err)
        }
      }
      saving = null
    }
    saving = run()
  }

  const store = createStore<AppStore>()((set, get) => {
    const update = (fn: (d: AppData) => AppData) => {
      const next = fn(get().data)
      set({ data: next })
      persist(next)
    }
    const updateActive = (fn: (w: Workout) => Workout) => {
      update((d) => ({
        ...d,
        workouts: d.workouts.map((w) => (w.status === 'active' ? { ...fn(w), updatedAt: nowIso() } : w)),
      }))
    }
    const updateEntry = (exerciseId: string, fn: (e: WorkoutEntry) => WorkoutEntry) =>
      updateActive((w) => ({ ...w, entries: w.entries.map((e) => (e.exerciseId === exerciseId ? fn(e) : e)) }))

    /**
     * Neuer Trainingseintrag mit vorbefüllten Sätzen. `skipArchived`: beim Start aus einer Vorlage
     * oder „Letztes wiederholen“ bleiben archivierte Übungen draußen (bewusst ausgewählte nicht).
     */
    const buildEntry = (
      d: AppData,
      exerciseId: string,
      opts: { targetSets?: number; excludeWorkoutId?: string; skipArchived?: boolean; target?: ProgressionTarget } = {},
    ): WorkoutEntry | null => {
      const ex = d.exercises.find((e) => e.id === exerciseId)
      if (!ex || (opts.skipArchived && ex.archived)) return null
      // Mit Zielbereich schlägt der Coach die nächste Steigerung vor (abschaltbar)
      if (opts.target && d.settings.coachProgression) {
        const r = progressionFor({
          exercise: ex,
          target: opts.target,
          workouts: d.workouts,
          restrictions: d.restrictions,
          weightStep: d.settings.weightStep,
          now: new Date(),
          excludeWorkoutId: opts.excludeWorkoutId,
        })
        if (r) return { exerciseId, sets: r.sets, coach: r.coach }
      }
      const last = lastValuesFor(d.workouts, exerciseId, opts.excludeWorkoutId)
      return { exerciseId, sets: suggestSets(ex, last, opts.targetSets).sets }
    }
    const targetOf = (e: { sets: number; repMin?: number; repMax?: number }): ProgressionTarget | undefined =>
      e.repMin !== undefined && e.repMax !== undefined ? { sets: e.sets, repMin: e.repMin, repMax: e.repMax } : undefined

    return {
      data: createSeedData(),
      hydrated: false,
      loadError: null,

      async hydrate() {
        try {
          const raw = await storage.load()
          if (raw === null) {
            const seed = createSeedData()
            set({ data: seed, hydrated: true })
            persist(seed)
          } else {
            set({ data: migrateAppData(raw), hydrated: true })
          }
        } catch (err) {
          set({ loadError: err instanceof Error ? err.message : String(err), hydrated: true })
        }
      },

      async flush() {
        while (saving) await saving
      },

      addExercise(input) {
        const name = input.name.trim().replace(/\s+/g, ' ')
        if (!name) return { ok: false, error: 'Bitte einen Namen eingeben.' }
        const key = normalizeName(name)
        if (get().data.exercises.some((e) => normalizeName(e.name) === key)) {
          return { ok: false, error: `„${name}“ gibt es schon.` }
        }
        const at = nowIso()
        const exercise: Exercise = {
          ...input,
          name,
          aliases: input.aliases ?? [],
          id: newId('ex-'),
          archived: false,
          createdAt: at,
          updatedAt: at,
        }
        update((d) => ({ ...d, exercises: [...d.exercises, exercise] }))
        return { ok: true, exercise }
      },

      updateExercise(id, patch) {
        if (patch.name !== undefined) {
          const name = patch.name.trim().replace(/\s+/g, ' ')
          if (!name) return { ok: false, error: 'Bitte einen Namen eingeben.' }
          const key = normalizeName(name)
          if (get().data.exercises.some((e) => e.id !== id && normalizeName(e.name) === key)) {
            return { ok: false, error: `„${name}“ gibt es schon.` }
          }
          patch = { ...patch, name }
        }
        update((d) => ({
          ...d,
          exercises: d.exercises.map((e) => (e.id === id ? { ...e, ...patch, updatedAt: nowIso() } : e)),
        }))
        return { ok: true }
      },

      setExerciseArchived(id, archived) {
        update((d) => ({
          ...d,
          exercises: d.exercises.map((e) => (e.id === id ? { ...e, archived, updatedAt: nowIso() } : e)),
        }))
      },

      adoptFromLibrary(entryId, opts = {}) {
        const r = adoptExercise(get().data.exercises, entryId, nowIso(), opts)
        if (r.status === 'unknown') return r
        if (r.exercises !== get().data.exercises) update((d) => ({ ...d, exercises: r.exercises }))
        return { status: r.status, exercise: r.exercise }
      },

      linkExercise(exerciseId, entryId) {
        update((d) => ({
          ...d,
          exercises: d.exercises.map((e) => (e.id === exerciseId ? { ...e, libraryId: entryId ?? undefined, updatedAt: nowIso() } : e)),
        }))
      },

      activeWorkout() {
        return get().data.workouts.find((w) => w.status === 'active') ?? null
      },

      startWorkout(opts) {
        const existing = get().activeWorkout()
        if (existing) return existing
        const d = get().data
        const at = nowIso()
        const id = newId('wo-')
        let entries: WorkoutEntry[] = []
        let templateId: string | undefined
        let programId: string | undefined
        let programDayId: string | undefined
        // Vorlage: Satzzahl, Zielbereich und Pause kommen aus der Vorlage (Kopie, Historie bleibt stabil)
        const fromTemplate = (t: Template) =>
          t.entries
            .map((te): WorkoutEntry | null => {
              const e = buildEntry(d, te.exerciseId, { targetSets: te.sets, skipArchived: true, target: targetOf(te) })
              if (!e) return null
              return {
                ...e,
                ...(te.repMin !== undefined && te.repMax !== undefined ? { repMin: te.repMin, repMax: te.repMax } : {}),
                ...(te.restSec !== undefined ? { restSec: te.restSec } : {}),
              }
            })
            .filter((e): e is WorkoutEntry => !!e)
        if (opts && 'programId' in opts) {
          const p = d.programs.find((x) => x.id === opts.programId)
          const day = p?.days.find((x) => x.id === opts.dayId)
          const t = day && d.templates.find((x) => x.id === day.templateId)
          if (p && day && t) {
            programId = p.id
            programDayId = day.id
            templateId = t.id
            entries = fromTemplate(t)
          }
        } else if (opts && 'templateId' in opts && opts.templateId) {
          const t = d.templates.find((x) => x.id === opts.templateId)
          if (t) {
            templateId = t.id
            entries = fromTemplate(t)
          }
        } else if (opts && 'exerciseIds' in opts) {
          entries = opts.exerciseIds.map((eid) => buildEntry(d, eid)).filter((e): e is WorkoutEntry => !!e)
        } else if (opts && 'repeatLast' in opts) {
          const last = d.workouts
            .filter((w) => w.status === 'done' && w.finishedAt)
            .sort((a, b) => (a.finishedAt! < b.finishedAt! ? 1 : -1))[0]
          if (last) {
            templateId = last.templateId
            entries = last.entries.map((e) => buildEntry(d, e.exerciseId, { skipArchived: true })).filter((e): e is WorkoutEntry => !!e)
          }
        }
        const workout: Workout = { id, startedAt: at, status: 'active', templateId, programId, programDayId, entries, updatedAt: at }
        update((x) => ({ ...x, workouts: [...x.workouts, workout], timer: null }))
        return workout
      },

      addExerciseToWorkout(exerciseId) {
        const d = get().data
        const active = get().activeWorkout()
        if (!active || active.entries.some((e) => e.exerciseId === exerciseId)) return
        const entry = buildEntry(d, exerciseId, { excludeWorkoutId: active.id })
        if (!entry) return
        updateActive((w) => ({ ...w, entries: [...w.entries, entry] }))
      },

      replaceExerciseInWorkout(oldId, newId) {
        const d = get().data
        const active = get().activeWorkout()
        const old = active?.entries.find((e) => e.exerciseId === oldId)
        if (!active || !old || old.sets.some((s) => s.done) || active.entries.some((e) => e.exerciseId === newId)) return false
        const built = buildEntry(d, newId, {
          targetSets: old.sets.length,
          excludeWorkoutId: active.id,
          target: targetOf({ sets: old.sets.length, repMin: old.repMin, repMax: old.repMax }),
        })
        if (!built) return false
        // Zielbereich bleibt (gleiche Aufgabe), die Pause kommt von der neuen Übung
        const entry: WorkoutEntry = { ...built, ...(old.repMin !== undefined && old.repMax !== undefined ? { repMin: old.repMin, repMax: old.repMax } : {}) }
        updateActive((w) => ({ ...w, entries: w.entries.map((e) => (e.exerciseId === oldId ? entry : e)) }))
        return true
      },

      replaceExerciseInTemplate(templateId, oldId, newId) {
        const t = get().data.templates.find((x) => x.id === templateId)
        if (!t || !t.entries.some((e) => e.exerciseId === oldId)) return
        const entries = t.entries.some((e) => e.exerciseId === newId)
          ? t.entries.filter((e) => e.exerciseId !== oldId)
          : t.entries.map((e) => {
              if (e.exerciseId !== oldId) return e
              // Pause gehörte zur alten Übung; die neue nimmt ihre eigene
              const { restSec: _rest, ...kept } = e
              return { ...kept, exerciseId: newId }
            })
        get().updateTemplate(templateId, { entries })
      },

      removeExerciseFromWorkout(exerciseId) {
        updateActive((w) => ({ ...w, entries: w.entries.filter((e) => e.exerciseId !== exerciseId) }))
      },

      moveWorkoutEntry(exerciseId, direction) {
        updateActive((w) => {
          const i = w.entries.findIndex((e) => e.exerciseId === exerciseId)
          const j = i + direction
          if (i < 0 || j < 0 || j >= w.entries.length) return w
          const entries = [...w.entries]
          ;[entries[i], entries[j]] = [entries[j], entries[i]]
          return { ...w, entries }
        })
      },

      moveWorkoutEntryToEnd(exerciseId, end) {
        updateActive((w) => {
          const entry = w.entries.find((e) => e.exerciseId === exerciseId)
          if (!entry) return w
          const rest = w.entries.filter((e) => e.exerciseId !== exerciseId)
          return { ...w, entries: end === 'top' ? [entry, ...rest] : [...rest, entry] }
        })
      },

      sortWorkoutNoWeightFirst() {
        const byId = new Map(get().data.exercises.map((e) => [e.id, e]))
        updateActive((w) => ({ ...w, entries: noWeightFirst(w.entries, (e) => !!byId.get(e.exerciseId)?.noWeight) }))
      },

      addSet(exerciseId) {
        updateEntry(exerciseId, (e) => {
          const prev = e.sets[e.sets.length - 1]
          const s: WorkoutSet = {
            id: newId('set-'),
            weightKg: prev ? prev.weightKg : null,
            reps: prev ? prev.reps : null,
            done: false,
          }
          return { ...e, sets: [...e.sets, s] }
        })
      },

      updateSet(exerciseId, setId, patch) {
        updateEntry(exerciseId, (e) => ({
          ...e,
          sets: e.sets.map((s) => (s.id === setId ? { ...s, ...patch } : s)),
        }))
      },

      deleteSet(exerciseId, setId) {
        const active = get().activeWorkout()
        const entry = active?.entries.find((e) => e.exerciseId === exerciseId)
        const index = entry?.sets.findIndex((s) => s.id === setId) ?? -1
        if (!entry || index < 0) return null
        const removed = entry.sets[index]
        updateEntry(exerciseId, (e) => ({ ...e, sets: e.sets.filter((s) => s.id !== setId) }))
        return { set: removed, index }
      },

      restoreSet(exerciseId, set, index) {
        updateEntry(exerciseId, (e) => {
          if (e.sets.some((s) => s.id === set.id)) return e
          const sets = [...e.sets]
          sets.splice(Math.min(index, sets.length), 0, set)
          return { ...e, sets }
        })
      },

      setSetDone(exerciseId, setId, done) {
        const active = get().activeWorkout()
        const s = active?.entries.find((e) => e.exerciseId === exerciseId)?.sets.find((x) => x.id === setId)
        if (!s) return false
        if (done && (s.reps === null || s.reps < 1)) return false
        updateEntry(exerciseId, (e) => ({
          ...e,
          sets: e.sets.map((x) => (x.id === setId ? { ...x, done, doneAt: done ? nowIso() : undefined } : x)),
        }))
        return true
      },

      setEntryNote(exerciseId, note) {
        updateEntry(exerciseId, (e) => ({ ...e, note: note.trim() ? note : undefined }))
      },

      applyLastValues(exerciseId) {
        const active = get().activeWorkout()
        if (!active) return
        const last = lastValuesFor(get().data.workouts, exerciseId, active.id)
        if (!last) return
        updateEntry(exerciseId, (e) => ({
          ...e,
          coach: undefined,
          sets: e.sets.map((s, i) => {
            if (s.done) return s
            const src = last.sets[i] ?? last.sets[last.sets.length - 1]
            return { ...s, weightKg: src.weightKg, reps: src.reps }
          }),
        }))
      },

      setEntryRating(exerciseId, rating) {
        updateEntry(exerciseId, (e) => ({ ...e, rating }))
      },

      startHold(exerciseId, nowMs = Date.now()) {
        const ex = get().data.exercises.find((e) => e.id === exerciseId)
        if (!ex) return
        updateEntry(exerciseId, (e) => startHold(e, holdSecFor(ex), nowMs))
      },
      pauseHold(exerciseId, nowMs = Date.now()) {
        updateEntry(exerciseId, (e) => pauseHold(e, nowMs))
      },
      resumeHold(exerciseId, nowMs = Date.now()) {
        updateEntry(exerciseId, (e) => resumeHold(e, nowMs))
      },
      skipHoldPhase(exerciseId, nowMs = Date.now()) {
        const d = get().data
        const ex = d.exercises.find((e) => e.id === exerciseId)
        if (!ex) return 0
        let events = 0
        updateEntry(exerciseId, (e) => {
          const r = advanceHold(resumeHold(e, nowMs), holdSecFor(ex), restSecFor(ex, d.settings, e), nowMs, nowIso(), true)
          events = r.events
          return r.entry
        })
        return events
      },
      stopHold(exerciseId) {
        updateEntry(exerciseId, (e) => (e.hold ? { ...e, hold: undefined } : e))
      },
      advanceHold(exerciseId, nowMs = Date.now()) {
        const d = get().data
        const ex = d.exercises.find((e) => e.id === exerciseId)
        const entry = get().activeWorkout()?.entries.find((e) => e.exerciseId === exerciseId)
        if (!ex || !entry?.hold || entry.hold.pausedRemainingSec !== undefined) return 0
        if (new Date(entry.hold.endsAt!).getTime() > nowMs) return 0
        const r = advanceHold(entry, holdSecFor(ex), restSecFor(ex, d.settings, entry), nowMs, nowIso())
        updateEntry(exerciseId, () => r.entry)
        return r.events
      },

      finishWorkout() {
        const active = get().activeWorkout()
        if (!active) return null
        const at = nowIso()
        const finished: Workout = {
          ...active,
          status: 'done',
          finishedAt: at,
          updatedAt: at,
          entries: active.entries
            .map((e) => ({ ...e, hold: undefined, sets: e.sets.filter((s) => s.done) }))
            .filter((e) => e.sets.length > 0),
        }
        update((d) => ({
          ...d,
          workouts: d.workouts.map((w) => (w.id === active.id ? finished : w)),
          timer: null,
          meta: { ...d.meta, workoutsSinceBackup: d.meta.workoutsSinceBackup + 1 },
        }))
        return finished
      },

      discardWorkout() {
        update((d) => ({ ...d, workouts: d.workouts.filter((w) => w.status !== 'active'), timer: null }))
      },

      updateWorkout(id, updater) {
        update((d) => ({
          ...d,
          workouts: d.workouts.map((w) => (w.id === id ? { ...updater(w), updatedAt: nowIso() } : w)),
        }))
      },

      deleteWorkout(id) {
        update((d) => ({ ...d, workouts: d.workouts.filter((w) => w.id !== id) }))
      },

      startTimer(durationSec, exerciseId) {
        const start = Date.now()
        update((d) => ({
          ...d,
          timer: {
            startedAt: new Date(start).toISOString(),
            endsAt: new Date(start + durationSec * 1000).toISOString(),
            durationSec,
            exerciseId,
            signalled: false,
          },
        }))
      },

      addTimerSeconds(sec) {
        update((d) => {
          if (!d.timer) return d
          const base = Math.max(Date.now(), new Date(d.timer.endsAt).getTime())
          return {
            ...d,
            timer: { ...d.timer, endsAt: new Date(base + sec * 1000).toISOString(), durationSec: d.timer.durationSec + sec, signalled: false },
          }
        })
      },

      restartTimer() {
        const t = get().data.timer
        if (t) get().startTimer(t.durationSec, t.exerciseId)
      },

      stopTimer() {
        update((d) => ({ ...d, timer: null }))
      },

      markTimerSignalled() {
        update((d) => (d.timer ? { ...d, timer: { ...d.timer, signalled: true } } : d))
      },

      updateSettings(patch) {
        update((d) => ({ ...d, settings: { ...d.settings, ...patch } }))
      },

      saveTemplate(name, entries) {
        const at = nowIso()
        const t: Template = { id: newId('tpl-'), name: name.trim() || 'Vorlage', entries, createdAt: at, updatedAt: at }
        update((d) => ({ ...d, templates: [...d.templates, t] }))
        return t
      },

      updateTemplate(id, patch) {
        const at = nowIso()
        update((d) => {
          const t = d.templates.find((x) => x.id === id)
          // Tages-Vorlage umbenannt → Name des Programm-Tags zieht mit
          const renamed = t?.programId && patch.name !== undefined && patch.name !== t.name ? patch.name : null
          return {
            ...d,
            templates: d.templates.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: at } : x)),
            programs: renamed
              ? d.programs.map((p) =>
                  p.id === t!.programId ? { ...p, days: p.days.map((day) => (day.templateId === id ? { ...day, name: renamed } : day)), updatedAt: at } : p,
                )
              : d.programs,
          }
        })
      },

      deleteTemplate(id) {
        update((d) => ({ ...d, templates: d.templates.filter((t) => t.id !== id) }))
      },

      createTemplate(name) {
        return get().saveTemplate(name, [])
      },

      duplicateTemplate(id) {
        const r = duplicateTemplateData(get().data, id, nowIso())
        if (!r) return null
        update(() => r.data)
        return r.template
      },

      installProgram(builtinId, opts) {
        const def = builtinProgram(builtinId)
        if (!def) return null
        const r = installProgramData(get().data, def, opts, nowIso())
        update(() => ({ ...r.data, settings: { ...r.data.settings, activeProgramId: r.program.id } }))
        return r.program
      },

      importProgram(build, activate) {
        const r = build(get().data, nowIso())
        update(() => (activate ? { ...r.data, settings: { ...r.data.settings, activeProgramId: r.program.id } } : r.data))
        return r.program
      },

      createProgram(name) {
        const r = createEmptyProgram(get().data, name, nowIso())
        update(() => r.data)
        return r.program
      },

      updateProgram(id, patch) {
        const at = nowIso()
        update((d) => {
          const p = d.programs.find((x) => x.id === id)
          if (!p) return d
          const renamed = new Map((patch.days ?? []).filter((day) => p.days.find((o) => o.id === day.id)?.name !== day.name).map((day) => [day.templateId, day.name]))
          return {
            ...d,
            programs: d.programs.map((x) => (x.id === id ? { ...x, ...patch, name: (patch.name ?? x.name).trim() || x.name, updatedAt: at } : x)),
            templates: renamed.size ? d.templates.map((t) => (renamed.has(t.id) ? { ...t, name: renamed.get(t.id)!, updatedAt: at } : t)) : d.templates,
          }
        })
      },

      addProgramDay(programId, name) {
        const p = get().data.programs.find((x) => x.id === programId)
        if (!p) return null
        const at = nowIso()
        const dayName = name.trim() || `Tag ${p.days.length + 1}`
        const t: Template = { id: newId('tpl-'), name: dayName, entries: [], programId, createdAt: at, updatedAt: at }
        const day: ProgramDay = { id: newId('day-'), name: dayName, templateId: t.id }
        update((d) => ({
          ...d,
          templates: [...d.templates, t],
          programs: d.programs.map((x) => (x.id === programId ? { ...x, days: [...x.days, day], updatedAt: at } : x)),
        }))
        return day
      },

      removeProgramDay(programId, dayId) {
        const p = get().data.programs.find((x) => x.id === programId)
        const day = p?.days.find((x) => x.id === dayId)
        if (!p || !day) return
        const at = nowIso()
        update((d) => ({
          ...d,
          templates: d.templates.filter((t) => t.id !== day.templateId),
          programs: d.programs.map((x) => (x.id === programId ? { ...x, days: x.days.filter((y) => y.id !== dayId), updatedAt: at } : x)),
        }))
      },

      duplicateProgram(id) {
        const r = duplicateProgramData(get().data, id, nowIso())
        if (!r) return null
        update(() => r.data)
        return r.program
      },

      deleteProgram(id) {
        update((d) => deleteProgramData(d, id))
      },

      setActiveProgram(id) {
        update((d) => ({ ...d, settings: { ...d.settings, activeProgramId: id } }))
      },

      addRestriction(input) {
        if (input.bodyParts.length === 0 && input.muscles.length === 0) return null
        const at = nowIso()
        const r: Restriction = {
          id: newId('rs-'),
          bodyParts: input.bodyParts,
          muscles: input.muscles,
          note: input.note?.trim() || undefined,
          until: input.until || undefined,
          createdAt: at,
          updatedAt: at,
        }
        update((d) => ({ ...d, restrictions: [...d.restrictions, r] }))
        return r
      },

      addBodyWeight(date, weightKg) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !(weightKg > 20 && weightKg < 400)) return false
        const at = nowIso()
        update((d) => {
          const same = d.bodyLog.find((b) => b.date === date)
          const bodyLog = same
            ? d.bodyLog.map((b) => (b.id === same.id ? { ...b, weightKg, updatedAt: at } : b))
            : [...d.bodyLog, { id: newId('bw-'), date, weightKg, createdAt: at, updatedAt: at }]
          return { ...d, bodyLog: bodyLog.sort((a, b) => (a.date < b.date ? -1 : 1)) }
        })
        return true
      },

      removeBodyWeight(id) {
        update((d) => ({ ...d, bodyLog: d.bodyLog.filter((b) => b.id !== id) }))
      },

      endRestriction(id) {
        const y = new Date()
        y.setDate(y.getDate() - 1)
        const until = dayKey(y)
        update((d) => ({ ...d, restrictions: d.restrictions.map((r) => (r.id === id ? { ...r, until, updatedAt: nowIso() } : r)) }))
      },

      removeRestriction(id) {
        update((d) => ({ ...d, restrictions: d.restrictions.filter((r) => r.id !== id) }))
      },

      markBackupDone() {
        update((d) => ({ ...d, meta: { ...d.meta, lastBackupAt: nowIso(), workoutsSinceBackup: 0 } }))
      },

      importBackup(backup, mode) {
        const result = applyImport(get().data, backup, mode)
        update(() => result.data)
        return result
      },

      markHintSeen(id) {
        update((d) => (d.meta.hintsSeen.includes(id) ? d : { ...d, meta: { ...d.meta, hintsSeen: [...d.meta.hintsSeen, id] } }))
      },

      replaceData(data) {
        update(() => data)
      },
    }
  })

  return store
}

/** Store der laufenden App (IndexedDB). */
export const appStore = createAppStore(idbStorage)

export function useAppStore<T>(selector: (s: AppStore) => T): T {
  return useStore(appStore, selector)
}
