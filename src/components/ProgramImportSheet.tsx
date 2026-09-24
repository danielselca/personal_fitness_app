import { useMemo, useState } from 'react'
import { importProgram as importProgramData, matchExercise, parseProgramText, type ExerciseMatch, type ImportProgram } from '../domain/programJson.ts'
import { GOAL_LABEL } from '../domain/programs.ts'
import { activeRestrictions, dayKey, exerciseHits, hitsFor } from '../domain/restrictions.ts'
import { libraryEntry } from '../domain/library.ts'
import type { Program } from '../domain/types.ts'
import { useAppStore } from '../store/appStore.ts'
import { Sheet } from './Sheet.tsx'
import { Toggle } from './Toggle.tsx'

const KIND_LABEL: Record<ExerciseMatch['kind'], string> = { eigene: 'deine Übung', bibliothek: 'aus der Bibliothek', neu: 'neu' }
const KIND_COUNT: Record<ExerciseMatch['kind'], [string, string]> = { eigene: ['deine Übung', 'deine Übungen'], bibliothek: ['aus der Bibliothek', 'aus der Bibliothek'], neu: ['neue Übung', 'neue Übungen'] }

/**
 * Programmvorschlag von Claude übernehmen: Antwort einfügen → prüfen → Vorschau mit Zuordnung
 * jeder Übung → als eigenes Programm anlegen (wahlweise aktiv).
 */
export default function ProgramImportSheet({ onClose, onDone }: { onClose: () => void; onDone?: (p: Program) => void }) {
  const data = useAppStore((s) => s.data)
  const importProgram = useAppStore((s) => s.importProgram)
  const [text, setText] = useState('')
  const [errors, setErrors] = useState<string[]>([])
  const [parsed, setParsed] = useState<ImportProgram | null>(null)
  const [activate, setActivate] = useState(true)
  const [done, setDone] = useState<Program | null>(null)
  const canPaste = typeof navigator !== 'undefined' && typeof navigator.clipboard?.readText === 'function'
  const active = useMemo(() => activeRestrictions(data.restrictions, dayKey()), [data.restrictions])

  const check = (value = text) => {
    const r = parseProgramText(value)
    if (r.ok) {
      setParsed(r.program)
      setErrors([])
    } else {
      setParsed(null)
      setErrors(r.errors)
    }
  }
  const paste = async () => {
    try {
      const t = await navigator.clipboard.readText()
      setText(t)
      check(t)
    } catch {
      setErrors(['Zwischenablage nicht lesbar – bitte mit langem Tippen einfügen.'])
    }
  }
  /** Geschonte Bereiche, die eine Übung belastet (eigene Übung oder Bibliothekseintrag). */
  const hits = (m: ExerciseMatch) => {
    if (m.kind === 'eigene') {
      const ex = data.exercises.find((e) => e.id === m.exerciseId)
      return ex ? exerciseHits(ex, active) : []
    }
    const lib = m.kind === 'bibliothek' ? libraryEntry(m.libraryId) : undefined
    return lib ? hitsFor(lib, active) : []
  }

  if (done) {
    return (
      <Sheet
        title="Programm übernommen"
        onClose={onClose}
        footer={
          <button type="button" className="btn btn-primary btn-block" onClick={() => (onDone ? onDone(done) : onClose())}>
            {onDone ? 'Zu den Programmen' : 'Fertig'}
          </button>
        }
      >
        <p className="ok" role="status" style={{ marginTop: 0 }}>
          „{done.name}“ ist jetzt eines deiner Programme{activate ? ' und aktiv' : ''}.
        </p>
        <p className="muted">Wie jedes Programm kannst du es unter Training → Programme bearbeiten, duplizieren oder löschen.</p>
      </Sheet>
    )
  }

  if (parsed) {
    const matches = parsed.days.map((d) => d.exercises.map((ie) => matchExercise(data.exercises, ie)))
    const counts = matches.flat().reduce<Record<string, number>>((c, m) => ({ ...c, [m.kind]: (c[m.kind] ?? 0) + 1 }), {})
    return (
      <Sheet
        title="Programm prüfen"
        onClose={onClose}
        footer={
          <div className="btn-row" style={{ width: '100%' }}>
            <button type="button" className="btn" onClick={() => setParsed(null)}>Zurück</button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                const p = importProgram((d, at) => importProgramData(d, parsed, at), activate)
                setDone(p)
              }}
            >
              Übernehmen
            </button>
          </div>
        }
      >
        <div className="card" style={{ marginBottom: 12 }}>
          <strong style={{ display: 'block', fontSize: 17 }}>{parsed.name}</strong>
          <span className="row-sub">
            {parsed.days.length} {parsed.days.length === 1 ? 'Tag' : 'Tage'} · {parsed.sessionsPerWeek}× pro Woche{parsed.goal ? ` · ${GOAL_LABEL[parsed.goal]}` : ''}
          </span>
          <span className="row-sub" style={{ display: 'block' }}>
            {(['eigene', 'bibliothek', 'neu'] as const).filter((k) => counts[k]).map((k) => `${counts[k]} ${KIND_COUNT[k][counts[k] === 1 ? 0 : 1]}`).join(' · ')}
          </span>
        </div>
        {parsed.days.map((day, di) => (
          <section key={di} className="import-day" aria-label={`Tag ${day.name}`}>
            <h3>{day.name}</h3>
            <ul className="import-list">
              {day.exercises.map((ie, ei) => {
                const m = matches[di][ei]
                const warn = hits(m)
                // Deine vorhandene Halteübung behält ihre Haltedauer
                const own = m.kind === 'eigene' ? data.exercises.find((e) => e.id === m.exerciseId) : undefined
                const holdSec = own ? (own.mode === 'hold' ? (own.holdSec ?? 60) : undefined) : ie.holdSec
                return (
                  <li key={ei}>
                    <span className="row-main">
                      <span className="row-title" style={{ display: 'block' }}>{m.name}</span>
                      <span className="row-sub">
                        {ie.sets} × {holdSec ? `${holdSec} s` : ie.repMin !== undefined ? `${ie.repMin === ie.repMax ? ie.repMin : `${ie.repMin}–${ie.repMax}`} Wdh.` : 'Wdh. frei'}
                        {ie.restSec !== undefined ? ` · Pause ${ie.restSec} s` : ''}
                        {ie.note ? ` · ${ie.note}` : ''}
                      </span>
                      {warn.length > 0 && <span className="import-warn">⚠ belastet {warn.join(', ')} (geschont)</span>}
                    </span>
                    <span className="badge import-kind" data-kind={m.kind}>{KIND_LABEL[m.kind]}</span>
                  </li>
                )
              })}
            </ul>
          </section>
        ))}
        {counts.neu > 0 && (
          <p className="muted" style={{ fontSize: 13 }}>
            „Neu“: Diese Übungen gibt es weder bei dir noch in der Bibliothek; sie werden als eigene Übung angelegt. Unter Übungen kannst du sie später einem Bibliothekseintrag zuordnen.
          </p>
        )}
        <Toggle label="Als aktives Programm setzen" hint="„Nächstes Training“ auf der Startseite folgt diesem Programm" checked={activate} onChange={setActivate} />
      </Sheet>
    )
  }

  return (
    <Sheet
      title="Programm von Claude übernehmen"
      onClose={onClose}
      footer={
        <button type="button" className="btn btn-primary btn-block" disabled={!text.trim()} onClick={() => check()}>
          Prüfen
        </button>
      }
    >
      <p className="muted" style={{ marginTop: 0 }}>
        Kopiere Claudes ganze Antwort und füge sie hier ein. Die App sucht den Programm-Block (JSON) heraus und zeigt dir vor dem Übernehmen, welche Übungen sie zuordnet.
      </p>
      <label className="field">
        <span>Antwort von Claude einfügen</span>
        <textarea
          className="input import-text"
          rows={8}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setErrors([])
          }}
          aria-label="Antwort von Claude"
          placeholder={'… ```json\n{ "format": "fitness-app-programm/v1", … }\n```'}
        />
      </label>
      {canPaste && (
        <button type="button" className="btn btn-sm" onClick={paste}>Aus Zwischenablage einfügen</button>
      )}
      {errors.length > 0 && (
        <div role="alert" className="import-errors">
          {errors.map((e) => (
            <p key={e} className="error">{e}</p>
          ))}
        </div>
      )}
    </Sheet>
  )
}
