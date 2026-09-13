import { createStore, type StoreApi } from 'zustand/vanilla'
import { useStore } from 'zustand'
import { applyImport, type ImportMode, type ImportResult } from '../domain/backup.ts'
import { newId, nowIso } from '../domain/ids.ts'
import { migrateAppData } from '../domain/migrate.ts'
import { noWeightFirst } from '../domain/progress.ts'
import { createSeedData } from '../domain/seed.ts'
import { lastValuesFor, normalizeName, suggestSets } from '../domain/suggestions.ts'
import type { AppData, Backup, Exercise, Settings, Template, TemplateEntry, Workout, WorkoutEntry, WorkoutSet } from '../domain/types.ts'
import { idbStorage, type DataStorage } from './persistence.ts'

export type ExerciseInput = Omit<Exercise, 'id' | 'createdAt' | 'updatedAt' | 'archived' | 'aliases'> & {
  aliases?: string[]
}

export type StartOptions = { templateId?: string } | { exerciseIds: string[] } | { repeatLast: true } | undefined

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

  // Aktives Training
  activeWorkout(): Workout | null
  startWorkout(opts?: StartOptions): Workout
  addExerciseToWorkout(exerciseId: string): void
  removeExerciseFromWorkout(exerciseId: string): void
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

    const buildEntry = (d: AppData, exerciseId: string, targetSets?: number, excludeWorkoutId?: string): WorkoutEntry | null => {
      const ex = d.exercises.find((e) => e.id === exerciseId)
      if (!ex) return null
      const last = lastValuesFor(d.workouts, exerciseId, excludeWorkoutId)
      return { exerciseId, sets: suggestSets(ex, last, targetSets).sets }
    }

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
        if (opts && 'templateId' in opts && opts.templateId) {
          const t = d.templates.find((x) => x.id === opts.templateId)
          if (t) {
            templateId = t.id
            entries = t.entries.map((te) => buildEntry(d, te.exerciseId, te.sets)).filter((e): e is WorkoutEntry => !!e)
          }
        } else if (opts && 'exerciseIds' in opts) {
          entries = opts.exerciseIds.map((eid) => buildEntry(d, eid)).filter((e): e is WorkoutEntry => !!e)
        } else if (opts && 'repeatLast' in opts) {
          const last = d.workouts
            .filter((w) => w.status === 'done' && w.finishedAt)
            .sort((a, b) => (a.finishedAt! < b.finishedAt! ? 1 : -1))[0]
          if (last) {
            templateId = last.templateId
            entries = last.entries.map((e) => buildEntry(d, e.exerciseId)).filter((e): e is WorkoutEntry => !!e)
          }
        }
        const workout: Workout = { id, startedAt: at, status: 'active', templateId, entries, updatedAt: at }
        update((x) => ({ ...x, workouts: [...x.workouts, workout], timer: null }))
        return workout
      },

      addExerciseToWorkout(exerciseId) {
        const d = get().data
        const active = get().activeWorkout()
        if (!active || active.entries.some((e) => e.exerciseId === exerciseId)) return
        const entry = buildEntry(d, exerciseId, undefined, active.id)
        if (!entry) return
        updateActive((w) => ({ ...w, entries: [...w.entries, entry] }))
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
            .map((e) => ({ ...e, sets: e.sets.filter((s) => s.done) }))
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
        update((d) => ({
          ...d,
          templates: d.templates.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: nowIso() } : t)),
        }))
      },

      deleteTemplate(id) {
        update((d) => ({ ...d, templates: d.templates.filter((t) => t.id !== id) }))
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
