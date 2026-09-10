import { useState } from 'react'
import type { Template, TemplateEntry } from '../domain/types.ts'
import { useAppStore } from '../store/appStore.ts'
import { ConfirmDialog, Sheet } from './Sheet.tsx'

/** Vorlage bearbeiten (F14): Name, Reihenfolge, Satzanzahl je Übung, Übung entfernen, Vorlage löschen. */
export function TemplateEditor({ template, onClose }: { template: Template; onClose: () => void }) {
  const exercises = useAppStore((s) => s.data.exercises)
  const updateTemplate = useAppStore((s) => s.updateTemplate)
  const deleteTemplate = useAppStore((s) => s.deleteTemplate)
  const [name, setName] = useState(template.name)
  const [entries, setEntries] = useState<TemplateEntry[]>(template.entries)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const nameOf = (id: string) => exercises.find((e) => e.id === id)?.name ?? 'Unbekannt'

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= entries.length) return
    const next = [...entries]
    ;[next[i], next[j]] = [next[j], next[i]]
    setEntries(next)
  }

  return (
    <Sheet
      title="Vorlage bearbeiten"
      onClose={onClose}
      footer={
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!name.trim() || entries.length === 0}
          onClick={() => {
            updateTemplate(template.id, { name: name.trim(), entries })
            onClose()
          }}
        >
          Speichern
        </button>
      }
    >
      <label className="field">
        <span>Name</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} aria-label="Vorlagenname" />
      </label>
      <ul className="list">
        {entries.map((en, i) => (
          <li key={en.exerciseId} className="card template-row">
            <span className="row-main">
              <span className="row-title ellipsis" style={{ display: 'block' }}>{nameOf(en.exerciseId)}</span>
              <span className="row-sub input-inline">
                Sätze
                <input
                  className="input input-num"
                  style={{ width: 56, minHeight: 36, padding: 2, fontSize: 17 }}
                  inputMode="numeric"
                  aria-label={`Sätze für ${nameOf(en.exerciseId)}`}
                  value={en.sets}
                  onChange={(e) => {
                    const n = Number(e.target.value)
                    if (Number.isInteger(n) && n >= 1 && n <= 20) setEntries(entries.map((x, k) => (k === i ? { ...x, sets: n } : x)))
                  }}
                />
              </span>
            </span>
            <button type="button" className="btn btn-icon btn-sm" aria-label={`${nameOf(en.exerciseId)} nach oben`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
            <button type="button" className="btn btn-icon btn-sm" aria-label={`${nameOf(en.exerciseId)} nach unten`} disabled={i === entries.length - 1} onClick={() => move(i, 1)}>↓</button>
            <button type="button" className="btn btn-icon btn-sm" aria-label={`${nameOf(en.exerciseId)} entfernen`} onClick={() => setEntries(entries.filter((_, k) => k !== i))}>✕</button>
          </li>
        ))}
      </ul>
      <button type="button" className="btn btn-block" style={{ marginTop: 16, color: 'var(--danger)' }} onClick={() => setConfirmDelete(true)}>
        Vorlage löschen
      </button>
      {confirmDelete && (
        <ConfirmDialog
          title="Vorlage löschen?"
          text="Bisherige Trainings bleiben erhalten."
          confirmLabel="Löschen"
          danger
          onConfirm={() => {
            deleteTemplate(template.id)
            onClose()
          }}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </Sheet>
  )
}

/** Name für eine neue Vorlage abfragen und speichern. */
export function SaveTemplateSheet({ suggestedName, entries, onClose }: { suggestedName: string; entries: TemplateEntry[]; onClose: (savedName: string | null) => void }) {
  const saveTemplate = useAppStore((s) => s.saveTemplate)
  const [name, setName] = useState(suggestedName)
  return (
    <Sheet
      title="Als Vorlage speichern"
      onClose={() => onClose(null)}
      footer={
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={!name.trim() || entries.length === 0}
          onClick={() => {
            const t = saveTemplate(name, entries)
            onClose(t.name)
          }}
        >
          Speichern
        </button>
      }
    >
      <label className="field">
        <span>Name der Vorlage</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} autoFocus aria-label="Vorlagenname" />
      </label>
      <p className="muted" style={{ fontSize: 14 }}>{entries.length} Übungen mit der jeweiligen Satzanzahl werden übernommen.</p>
    </Sheet>
  )
}
