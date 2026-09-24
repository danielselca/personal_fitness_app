import { useState } from 'react'
import { adoptExercise } from '../domain/adopt.ts'
import { GOAL_LABEL, GOAL_REPS, PROGRAM_SETS, physioEntries } from '../domain/programs.ts'
import type { ProgramGoal } from '../domain/types.ts'
import type { ProgramDefinition } from '../programs/builtin.ts'
import { useAppStore } from '../store/appStore.ts'
import { Sheet } from './Sheet.tsx'
import { Toggle } from './Toggle.tsx'

/** Mitgeliefertes Programm übernehmen: Ziel, Physio-Block, Vorschau der Tage. */
export function InstallProgramSheet({ def, onDone, onClose }: { def: ProgramDefinition; onDone: () => void; onClose: () => void }) {
  const data = useAppStore((s) => s.data)
  const install = useAppStore((s) => s.installProgram)
  const [goal, setGoal] = useState<ProgramGoal>('muskelaufbau')
  const [physio, setPhysio] = useState(false)
  const physioNames = physioEntries(data).map((e) => data.exercises.find((x) => x.id === e.exerciseId)?.name ?? '')
  const [lo, hi] = GOAL_REPS[goal]

  const dayNames = (day: ProgramDefinition['days'][number]) => {
    const source = day.fromTemplate ? data.templates.find((t) => t.id === day.fromTemplate) : undefined
    if (source) return `deine Vorlage „${source.name}“`
    // Namen so, wie sie nach dem Übernehmen heißen: deine Übung, falls vorhanden
    return day.exercises
      .map((id) => {
        const r = adoptExercise(data.exercises, id, '', { useNameMatch: true })
        return r.status === 'unknown' ? id : r.exercise.name
      })
      .join(', ')
  }

  return (
    <Sheet
      title={`${def.name} übernehmen`}
      onClose={onClose}
      footer={
        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => {
            if (install(def.id, { goal, physioBlock: physio })) onDone()
          }}
        >
          Übernehmen und aktivieren
        </button>
      }
    >
      <p className="muted" style={{ marginTop: 0, fontSize: 14 }}>{def.description}</p>
      <div className="field">
        <span>Ziel</span>
        <div className="segment" role="radiogroup" aria-label="Ziel" style={{ marginBottom: 0 }}>
          {(['muskelaufbau', 'fitness'] as const).map((g) => (
            <button key={g} type="button" role="radio" aria-checked={goal === g} className={goal === g ? 'on' : ''} onClick={() => setGoal(g)}>
              {GOAL_LABEL[g]}
            </button>
          ))}
        </div>
      </div>
      <p className="muted" style={{ fontSize: 14, marginTop: -6 }}>
        Je Übung {PROGRAM_SETS} Sätze mit {lo}–{hi} Wiederholungen. Alles lässt sich danach ändern.
      </p>
      {physioNames.length > 0 && (
        <div className="card" style={{ padding: '4px 12px', marginBottom: 16 }}>
          <Toggle label="Deine Physio-Übungen vorne" hint={`${physioNames.join(', ')} als Block am Anfang jedes Tages`} checked={physio} onChange={setPhysio} />
        </div>
      )}
      <h3 className="detail-sub" style={{ marginTop: 0 }}>Tage</h3>
      <ul className="program-days" style={{ marginTop: 6 }}>
        {def.days.map((day) => (
          <li key={day.name}>
            <b>{day.name}:</b> {dayNames(day)}
          </li>
        ))}
      </ul>
      <p className="muted" style={{ fontSize: 13 }}>
        Übungen, die du schon hast (z. B. Lat-Zug, Rudern), werden verwendet – dein Verlauf läuft weiter.
      </p>
    </Sheet>
  )
}
