import { lazy, Suspense, useState } from 'react'
import { InstallProgramSheet } from '../components/InstallProgramSheet.tsx'
import { ProgramEditor } from '../components/ProgramEditor.tsx'
import { GOAL_LABEL, recommendProgram } from '../domain/programs.ts'
import { BUILTIN_PROGRAMS, type ProgramDefinition } from '../programs/builtin.ts'
import { count } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'

/**
 * Programme: deine Programme (aktivieren, bearbeiten, duplizieren), Vorschläge der App zum
 * Übernehmen und ein leeres eigenes Programm. Programme sind ein Angebot – freies Training bleibt.
 */
// Import-Blatt erst beim Öffnen laden
const ProgramImportSheet = lazy(() => import('../components/ProgramImportSheet.tsx'))

export function ProgramsView({ onBack }: { onBack: () => void }) {
  const data = useAppStore((s) => s.data)
  const setActive = useAppStore((s) => s.setActiveProgram)
  const duplicate = useAppStore((s) => s.duplicateProgram)
  const createProgram = useAppStore((s) => s.createProgram)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const [installing, setInstalling] = useState<ProgramDefinition | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [importing, setImporting] = useState(false)
  const activeId = data.settings.activeProgramId
  const weekly = data.settings.weeklyGoal
  const rec = recommendProgram(weekly)

  return (
    <>
      <button type="button" className="btn btn-sm" onClick={onBack} style={{ marginBottom: 12 }}>
        ‹ Training
      </button>

      <div className="field">
        <span>Trainings pro Woche (Ziel)</span>
        <div className="segment" role="radiogroup" aria-label="Trainings pro Woche" style={{ marginBottom: 0 }}>
          {[2, 3, 4, 5, 6].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={weekly === n} className={weekly === n ? 'on' : ''} onClick={() => updateSettings({ weeklyGoal: n })}>
              {n}×
            </button>
          ))}
        </div>
      </div>

      <h2 className="section-title">Deine Programme</h2>
      {data.programs.length === 0 && <p className="muted" style={{ marginTop: 0 }}>Noch keins. Übernimm unten einen Vorschlag oder lege ein eigenes an.</p>}
      <ul className="list">
        {data.programs.map((p) => {
          const active = p.id === activeId
          return (
            <li key={p.id} className="card program-card" aria-label={p.name}>
              <div className="program-card-head">
                <span className="row-title">{p.name}</span>
                {active && <span className="badge">Aktiv</span>}
              </div>
              <span className="row-sub">
                {[GOAL_LABEL[p.goal], `${p.sessionsPerWeek}× pro Woche`, count(p.days.length, 'Tag', 'Tage')].join(' · ')}
              </span>
              <div className="btn-row">
                {active ? (
                  <button type="button" className="btn btn-sm" onClick={() => setActive(undefined)}>Pausieren</button>
                ) : (
                  <button type="button" className="btn btn-sm btn-primary" onClick={() => setActive(p.id)}>Aktivieren</button>
                )}
                <button type="button" className="btn btn-sm" onClick={() => setEditing(p.id)}>Bearbeiten</button>
                <button
                  type="button"
                  className="btn btn-sm"
                  onClick={() => {
                    const copy = duplicate(p.id)
                    if (copy) setEditing(copy.id)
                  }}
                >
                  Duplizieren
                </button>
              </div>
            </li>
          )
        })}
      </ul>
      <button
        type="button"
        className="btn btn-block"
        style={{ marginTop: 12 }}
        onClick={() => {
          const p = createProgram('Mein Programm')
          setEditing(p.id)
        }}
      >
        + Eigenes Programm
      </button>
      <button type="button" className="btn btn-block" style={{ marginTop: 8 }} onClick={() => setImporting(true)}>
        Programm von Claude einfügen …
      </button>

      <h2 className="section-title">Vorschläge</h2>
      <ul className="list">
        {BUILTIN_PROGRAMS.map((def) => (
          <li key={def.id} className="card program-card" aria-label={`Vorschlag ${def.name}`}>
            <div className="program-card-head">
              <span className="row-title">{def.name}</span>
              {def.id === rec.id && <span className="badge badge-accent">Empfohlen für {weekly}×</span>}
            </div>
            <span className="row-sub">{def.description}</span>
            <span className="row-sub">{count(def.days.length, 'Tag', 'Tage')}: {def.days.map((d) => d.name).join(' · ')}</span>
            <div className="btn-row">
              <button type="button" className="btn btn-sm" onClick={() => setInstalling(def)}>Übernehmen …</button>
            </div>
          </li>
        ))}
      </ul>
      <p className="muted" style={{ fontSize: 13 }}>
        Übernommene Programme sind deine Kopie: Tage und Übungen frei änderbar. Die Vorschläge bleiben unverändert und lassen sich jederzeit erneut übernehmen.
      </p>

      {installing && <InstallProgramSheet def={installing} onClose={() => setInstalling(null)} onDone={onBack} />}
      {importing && (
        <Suspense fallback={null}>
          <ProgramImportSheet onClose={() => setImporting(false)} />
        </Suspense>
      )}
      {editing && <ProgramEditor programId={editing} onClose={() => setEditing(null)} />}
    </>
  )
}
