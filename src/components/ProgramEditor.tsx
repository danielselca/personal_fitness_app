import { useState } from 'react'
import { GOAL_LABEL } from '../domain/programs.ts'
import type { ProgramDay, Template } from '../domain/types.ts'
import { useAppStore } from '../store/appStore.ts'
import { ConfirmDialog, Sheet } from './Sheet.tsx'
import { TemplateEditor } from './TemplateEditor.tsx'

/**
 * Eigenes Programm bearbeiten: Name, Ziel, Trainings pro Woche, Tage umbenennen/sortieren/
 * hinzufügen/entfernen, Übungen je Tag über den Vorlagen-Editor. Änderungen gelten sofort.
 */
export function ProgramEditor({ programId, onClose }: { programId: string; onClose: () => void }) {
  const program = useAppStore((s) => s.data.programs.find((p) => p.id === programId))
  const templates = useAppStore((s) => s.data.templates)
  const exercises = useAppStore((s) => s.data.exercises)
  const updateProgram = useAppStore((s) => s.updateProgram)
  const addDay = useAppStore((s) => s.addProgramDay)
  const removeDay = useAppStore((s) => s.removeProgramDay)
  const deleteProgram = useAppStore((s) => s.deleteProgram)
  const [name, setName] = useState(program?.name ?? '')
  const [dayNames, setDayNames] = useState<Record<string, string>>({})
  const [editDay, setEditDay] = useState<Template | null>(null)
  const [removeDayId, setRemoveDayId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  if (!program) return null

  const nameOf = (id: string) => exercises.find((e) => e.id === id)?.name ?? 'Unbekannt'
  const commitName = () => {
    if (name.trim() && name.trim() !== program.name) updateProgram(program.id, { name })
  }
  const commitDay = (day: ProgramDay) => {
    const n = dayNames[day.id]?.trim()
    if (!n || n === day.name) return
    updateProgram(program.id, { days: program.days.map((d) => (d.id === day.id ? { ...d, name: n } : d)) })
  }
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= program.days.length) return
    const days = [...program.days]
    ;[days[i], days[j]] = [days[j], days[i]]
    updateProgram(program.id, { days })
  }
  const close = () => {
    commitName()
    program.days.forEach(commitDay)
    onClose()
  }

  return (
    <Sheet
      title="Programm bearbeiten"
      onClose={close}
      footer={
        <button type="button" className="btn btn-primary btn-block" onClick={close}>
          Fertig
        </button>
      }
    >
      <label className="field">
        <span>Name</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} onBlur={commitName} aria-label="Programmname" />
      </label>
      <div className="field">
        <span>Ziel</span>
        <div className="segment" role="radiogroup" aria-label="Ziel" style={{ marginBottom: 0 }}>
          {(['muskelaufbau', 'fitness'] as const).map((g) => (
            <button key={g} type="button" role="radio" aria-checked={program.goal === g} className={program.goal === g ? 'on' : ''} onClick={() => updateProgram(program.id, { goal: g })}>
              {GOAL_LABEL[g]}
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <span>Trainings pro Woche</span>
        <div className="segment" role="radiogroup" aria-label="Trainings pro Woche" style={{ marginBottom: 0 }}>
          {[2, 3, 4, 5, 6].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={program.sessionsPerWeek === n} className={program.sessionsPerWeek === n ? 'on' : ''} onClick={() => updateProgram(program.id, { sessionsPerWeek: n })}>
              {n}×
            </button>
          ))}
        </div>
      </div>

      <h3 className="detail-sub">Tage</h3>
      {program.days.length === 0 && <p className="muted">Noch keine Tage.</p>}
      <ul className="list" style={{ marginTop: 8 }}>
        {program.days.map((day, i) => {
          const t = templates.find((x) => x.id === day.templateId)
          return (
            <li key={day.id} className="card" style={{ padding: '10px 12px' }}>
              <div className="day-row">
                <input
                  className="input"
                  aria-label={`Name von Tag ${i + 1}`}
                  value={dayNames[day.id] ?? day.name}
                  onChange={(e) => setDayNames({ ...dayNames, [day.id]: e.target.value })}
                  onBlur={() => commitDay(day)}
                />
                <button type="button" className="btn btn-icon btn-sm" aria-label={`${day.name} nach oben`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button type="button" className="btn btn-icon btn-sm" aria-label={`${day.name} nach unten`} disabled={i === program.days.length - 1} onClick={() => move(i, 1)}>↓</button>
                <button type="button" className="btn btn-icon btn-sm" aria-label={`${day.name} entfernen`} onClick={() => setRemoveDayId(day.id)}>✕</button>
              </div>
              <p className="row-sub" style={{ margin: '6px 0' }}>{t && t.entries.length > 0 ? t.entries.map((e) => nameOf(e.exerciseId)).join(', ') : 'Keine Übungen'}</p>
              {t && (
                <button type="button" className="btn btn-sm" aria-label={`Übungen von ${day.name} bearbeiten`} onClick={() => setEditDay(t)}>
                  Übungen bearbeiten
                </button>
              )}
            </li>
          )
        })}
      </ul>
      <button type="button" className="btn btn-block" style={{ marginTop: 12 }} onClick={() => addDay(program.id, '')}>
        + Tag
      </button>
      <button type="button" className="btn btn-block" style={{ marginTop: 16, color: 'var(--danger)' }} onClick={() => setConfirmDelete(true)}>
        Programm löschen
      </button>

      {editDay && <TemplateEditor template={editDay} onClose={() => setEditDay(null)} />}
      {removeDayId && (
        <ConfirmDialog
          title="Tag entfernen?"
          text="Der Tag und seine Übungsliste werden gelöscht. Bisherige Trainings bleiben erhalten."
          confirmLabel="Entfernen"
          danger
          onConfirm={() => {
            removeDay(program.id, removeDayId)
            setRemoveDayId(null)
          }}
          onCancel={() => setRemoveDayId(null)}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Programm löschen?"
          text="Das Programm und seine Tage werden gelöscht. Bisherige Trainings bleiben erhalten. Mitgelieferte Programme kannst du jederzeit neu übernehmen."
          confirmLabel="Löschen"
          danger
          onConfirm={() => {
            deleteProgram(program.id)
            onClose()
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </Sheet>
  )
}
