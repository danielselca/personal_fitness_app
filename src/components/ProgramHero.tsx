import { useState } from 'react'
import { nextProgramDay, recommendProgram } from '../domain/programs.ts'
import type { AppData, Program } from '../domain/types.ts'
import { count } from '../lib/format.ts'
import { Sheet } from './Sheet.tsx'

/**
 * Programm auf der Startseite: großer Knopf für den nächsten Tag, Wochenstand, anderen Tag wählen.
 * Ohne aktives Programm eine kleine Karte, die zu den Programmen führt.
 */
export function ProgramHero({
  data,
  thisWeek,
  onStart,
  onOpenPrograms,
}: {
  data: AppData
  thisWeek: number
  onStart: (programId: string, dayId: string) => void
  onOpenPrograms: () => void
}) {
  const [choosing, setChoosing] = useState(false)
  const program = data.programs.find((p) => p.id === data.settings.activeProgramId)
  if (!program) {
    const rec = recommendProgram(data.settings.weeklyGoal)
    return (
      <button type="button" className="card card-tap program-teaser" onClick={onOpenPrograms}>
        <span className="row-main">
          <span className="row-title" style={{ display: 'block' }}>Programme</span>
          <span className="row-sub" style={{ display: 'block' }}>
            {data.programs.length > 0 ? `${count(data.programs.length, 'eigenes Programm', 'eigene Programme')} · ` : ''}
            {rec.name} empfohlen für {data.settings.weeklyGoal}× pro Woche
          </span>
        </span>
        <span className="muted" aria-hidden="true">›</span>
      </button>
    )
  }
  const next = nextProgramDay(program, data.workouts)
  const template = next && data.templates.find((t) => t.id === next.templateId)
  return (
    <section className="card program-hero" aria-label={`Programm ${program.name}`}>
      <div className="program-hero-top">
        <span className="row-main">
          <span className="eyebrow" style={{ display: 'block' }}>Programm</span>
          <span className="program-hero-name">{program.name}</span>
        </span>
        <button type="button" className="btn btn-sm" onClick={onOpenPrograms}>Programme</button>
      </div>
      {next ? (
        <>
          <button type="button" className="btn btn-primary btn-block program-next" onClick={() => onStart(program.id, next.id)}>
            <span className="ellipsis">Nächstes: {next.name}</span>
            <span aria-hidden="true"> ▶</span>
          </button>
          <div className="program-hero-meta">
            <span>
              <strong>{thisWeek}/{data.settings.weeklyGoal}</strong> diese Woche
            </span>
            {template && <span>{count(template.entries.length, 'Übung', 'Übungen')}</span>}
            {program.days.length > 1 && (
              <button type="button" className="btn btn-sm btn-link" onClick={() => setChoosing(true)}>
                Anderen Tag wählen
              </button>
            )}
          </div>
        </>
      ) : (
        <p className="muted" style={{ margin: '8px 0 0' }}>Dieses Programm hat noch keine Tage. Über „Programme“ bearbeiten.</p>
      )}
      {choosing && <DayChooser data={data} program={program} nextId={next?.id} onStart={(dayId) => onStart(program.id, dayId)} onClose={() => setChoosing(false)} />}
    </section>
  )
}

function DayChooser({ data, program, nextId, onStart, onClose }: { data: AppData; program: Program; nextId?: string; onStart: (dayId: string) => void; onClose: () => void }) {
  const nameOf = (id: string) => data.exercises.find((e) => e.id === id)?.name ?? 'Unbekannt'
  return (
    <Sheet title="Tag wählen" onClose={onClose}>
      <ul className="list">
        {program.days.map((day) => {
          const t = data.templates.find((x) => x.id === day.templateId)
          return (
            <li key={day.id}>
              <button type="button" className="card card-tap row" aria-label={`${day.name} starten`} onClick={() => onStart(day.id)}>
                <span className="row-main">
                  <span className="row-title" style={{ display: 'block' }}>
                    {day.name}
                    {day.id === nextId && <span className="badge" style={{ marginLeft: 8 }}>Nächstes</span>}
                  </span>
                  <span className="row-sub ellipsis" style={{ display: 'block' }}>{t ? t.entries.map((e) => nameOf(e.exerciseId)).join(', ') || 'keine Übungen' : ''}</span>
                </span>
                <span className="play-btn" aria-hidden="true">▶</span>
              </button>
            </li>
          )
        })}
      </ul>
    </Sheet>
  )
}
