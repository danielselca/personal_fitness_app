import { useState } from 'react'
import type { Template, TemplateEntry } from '../domain/types.ts'
import { useAppStore } from '../store/appStore.ts'
import { ExercisePicker } from './ExercisePicker.tsx'
import { ConfirmDialog, Sheet } from './Sheet.tsx'
import { SwapSheet } from './SwapSheet.tsx'

/** Zahl aus einem Eingabefeld: leer → undefined, sonst ganze Zahl (ungültig → NaN). */
const parseInt0 = (v: string): number | undefined => (v.trim() === '' ? undefined : /^\d+$/.test(v.trim()) ? Number(v) : Number.NaN)

/** Eingaben einer Zeile als Text, damit Felder auch leer sein dürfen. */
interface Row {
  exerciseId: string
  sets: string
  repMin: string
  repMax: string
  restSec: string
  note?: string
}

const toRow = (e: TemplateEntry): Row => ({
  exerciseId: e.exerciseId,
  sets: String(e.sets),
  repMin: e.repMin?.toString() ?? '',
  repMax: e.repMax?.toString() ?? '',
  restSec: e.restSec?.toString() ?? '',
  note: e.note,
})

/** Zeilen prüfen und in Vorlagen-Einträge umwandeln; Fehlertext bei ungültigen Angaben. */
function toEntries(rows: Row[], nameOf: (id: string) => string): { entries: TemplateEntry[] } | { error: string } {
  const entries: TemplateEntry[] = []
  for (const r of rows) {
    const n = nameOf(r.exerciseId)
    const sets = parseInt0(r.sets)
    if (sets === undefined || !(sets >= 1 && sets <= 20)) return { error: `${n}: Sätze zwischen 1 und 20.` }
    const lo = parseInt0(r.repMin)
    const hi = parseInt0(r.repMax)
    if ((lo === undefined) !== (hi === undefined)) return { error: `${n}: Wdh. von und bis angeben (oder beide leer).` }
    if (lo !== undefined && hi !== undefined && !(lo >= 1 && hi <= 100 && lo <= hi)) return { error: `${n}: Wdh. von–bis ungültig (z. B. 8–12).` }
    const rest = parseInt0(r.restSec)
    if (rest !== undefined && !(rest >= 5 && rest <= 900)) return { error: `${n}: Pause zwischen 5 und 900 s.` }
    entries.push({
      exerciseId: r.exerciseId,
      sets,
      ...(lo !== undefined && hi !== undefined ? { repMin: lo, repMax: hi } : {}),
      ...(rest !== undefined ? { restSec: rest } : {}),
      ...(r.note ? { note: r.note } : {}),
    })
  }
  return { entries }
}

/**
 * Vorlage bearbeiten (F14): Name, Übungen hinzufügen/entfernen/sortieren, je Übung Sätze,
 * Wdh.-Bereich und Pause; duplizieren; löschen (Programm-Tage werden im Programm entfernt).
 */
export function TemplateEditor({
  template,
  onClose,
  onOpenTemplate,
  discardOnCancel,
}: {
  template: Template
  onClose: () => void
  onOpenTemplate?: (t: Template) => void
  /** Gerade angelegte Vorlage: Schließen ohne Speichern verwirft sie wieder. */
  discardOnCancel?: boolean
}) {
  const exercises = useAppStore((s) => s.data.exercises)
  const settings = useAppStore((s) => s.data.settings)
  const updateTemplate = useAppStore((s) => s.updateTemplate)
  const deleteTemplate = useAppStore((s) => s.deleteTemplate)
  const duplicateTemplate = useAppStore((s) => s.duplicateTemplate)
  const [name, setName] = useState(template.name)
  const [rows, setRows] = useState<Row[]>(template.entries.map(toRow))
  const [error, setError] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)
  const [swapId, setSwapId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const exById = new Map(exercises.map((e) => [e.id, e]))
  const nameOf = (id: string) => exById.get(id)?.name ?? 'Unbekannt'

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= rows.length) return
    const next = [...rows]
    ;[next[i], next[j]] = [next[j], next[i]]
    setRows(next)
  }
  const setField = (i: number, key: 'sets' | 'repMin' | 'repMax' | 'restSec', v: string) => {
    setError(null)
    setRows(rows.map((r, k) => (k === i ? { ...r, [key]: v.replace(/[^0-9]/g, '') } : r)))
  }
  const cancel = () => {
    if (discardOnCancel) deleteTemplate(template.id)
    onClose()
  }
  /** Speichern; liefert false bei ungültigen Angaben. */
  const save = (): boolean => {
    const r = toEntries(rows, nameOf)
    if ('error' in r) {
      setError(r.error)
      return false
    }
    updateTemplate(template.id, { name: name.trim(), entries: r.entries })
    return true
  }

  return (
    <Sheet
      title={template.programId ? 'Tag bearbeiten' : discardOnCancel ? 'Neue Vorlage' : 'Vorlage bearbeiten'}
      onClose={cancel}
      footer={
        <button type="button" className="btn btn-primary btn-block" disabled={!name.trim()} onClick={() => save() && onClose()}>
          Speichern
        </button>
      }
    >
      <label className="field">
        <span>Name</span>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} aria-label="Vorlagenname" />
      </label>
      {error && <p className="error" role="alert">{error}</p>}
      {rows.length === 0 && <p className="muted">Noch keine Übungen. Füge unten welche hinzu.</p>}
      <ul className="list">
        {rows.map((r, i) => {
          const n = nameOf(r.exerciseId)
          const ex = exById.get(r.exerciseId)
          const hold = ex?.mode === 'hold'
          return (
            <li key={r.exerciseId} className="card tpl-entry" aria-label={n}>
              <div className="tpl-entry-head">
                <span className="row-title tpl-entry-name">{n}</span>
                <button type="button" className="btn btn-icon btn-sm" aria-label={`${n} nach oben`} disabled={i === 0} onClick={() => move(i, -1)}>↑</button>
                <button type="button" className="btn btn-icon btn-sm" aria-label={`${n} nach unten`} disabled={i === rows.length - 1} onClick={() => move(i, 1)}>↓</button>
                <button type="button" className="btn btn-icon btn-sm" aria-label={`${n} tauschen`} onClick={() => setSwapId(r.exerciseId)}>⇄</button>
                <button type="button" className="btn btn-icon btn-sm" aria-label={`${n} entfernen`} onClick={() => setRows(rows.filter((_, k) => k !== i))}>✕</button>
              </div>
              <div className="tpl-fields">
                <label className="tpl-field">
                  <span>Sätze</span>
                  <input className="input input-num" inputMode="numeric" aria-label={`Sätze für ${n}`} value={r.sets} onChange={(e) => setField(i, 'sets', e.target.value)} />
                </label>
                {!hold && (
                  <div className="tpl-field">
                    <span id={`reps-${r.exerciseId}`}>Wdh. von–bis</span>
                    <span className="tpl-range">
                      <input className="input input-num" inputMode="numeric" aria-label={`Wdh. von für ${n}`} placeholder="–" value={r.repMin} onChange={(e) => setField(i, 'repMin', e.target.value)} />
                      <span aria-hidden="true">–</span>
                      <input className="input input-num" inputMode="numeric" aria-label={`Wdh. bis für ${n}`} placeholder="–" value={r.repMax} onChange={(e) => setField(i, 'repMax', e.target.value)} />
                    </span>
                  </div>
                )}
                <label className="tpl-field">
                  <span>Pause (s)</span>
                  <input
                    className="input input-num"
                    inputMode="numeric"
                    aria-label={`Pause für ${n}`}
                    placeholder={String(ex?.defaultRestSec ?? settings.defaultRestSec)}
                    value={r.restSec}
                    onChange={(e) => setField(i, 'restSec', e.target.value)}
                  />
                </label>
              </div>
            </li>
          )
        })}
      </ul>
      <button type="button" className="btn btn-block" style={{ marginTop: 12 }} onClick={() => setPicking(true)}>
        + Übung
      </button>
      <div className="btn-row" style={{ marginTop: 16 }}>
        {onOpenTemplate && (
          <button
            type="button"
            className="btn"
            disabled={!name.trim()}
            onClick={() => {
              if (!save()) return
              const copy = duplicateTemplate(template.id)
              if (copy) onOpenTemplate(copy)
            }}
          >
            Vorlage duplizieren
          </button>
        )}
        {!template.programId && (
          <button type="button" className="btn" style={{ color: 'var(--danger)' }} onClick={() => setConfirmDelete(true)}>
            Vorlage löschen
          </button>
        )}
      </div>
      {picking && (
        <ExercisePicker
          excludeIds={rows.map((r) => r.exerciseId)}
          onAdd={(ids) => {
            setRows([...rows, ...ids.map((id) => ({ exerciseId: id, sets: '3', repMin: '', repMax: '', restSec: '' }))])
            setPicking(false)
          }}
          onClose={() => setPicking(false)}
        />
      )}
      {swapId && (
        <SwapSheet
          exerciseId={swapId}
          excludeIds={rows.map((r) => r.exerciseId)}
          onPick={(newId) => {
            // Sätze und Wdh.-Bereich bleiben, die Pause gehörte zur alten Übung
            setRows(rows.map((r) => (r.exerciseId === swapId ? { ...r, exerciseId: newId, restSec: '' } : r)))
            setSwapId(null)
          }}
          onClose={() => setSwapId(null)}
        />
      )}
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
