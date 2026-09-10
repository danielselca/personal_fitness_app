import { useRef, useState } from 'react'
import { BackupReminder } from '../components/BackupReminder.tsx'
import { ConfirmDialog } from '../components/Sheet.tsx'
import { Toggle } from '../components/Toggle.tsx'
import { backupFileName, buildBackup, summarizeBackup, validateBackup, type ImportResult } from '../domain/backup.ts'
import type { Backup } from '../domain/types.ts'
import { downloadJson, readFileText } from '../lib/download.ts'
import { formatDateTime, formatNumber, parseWeight } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'

const canVibrate = typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
const canWakeLock = typeof navigator !== 'undefined' && 'wakeLock' in navigator

export function MoreScreen() {
  return (
    <>
      <BackupSection />
      <SettingsSection />
      <HintsSection />
      <div className="card">
        <strong>Version</strong>
        <p className="muted num" style={{ margin: '4px 0 0' }}>{__APP_VERSION__}</p>
      </div>
    </>
  )
}

function SettingsSection() {
  const settings = useAppStore((s) => s.data.settings)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const [stepText, setStepText] = useState(formatNumber(settings.weightStep))
  const [restText, setRestText] = useState(String(settings.defaultRestSec))

  return (
    <>
      <h2 className="section-title">Einstellungen</h2>
      <div className="card">
        <label className="field">
          <span>Standardpause (Sekunden)</span>
          <input
            className="input input-num"
            inputMode="numeric"
            value={restText}
            onChange={(e) => setRestText(e.target.value)}
            onBlur={() => {
              const n = Number(restText)
              if (Number.isInteger(n) && n >= 5 && n <= 900) updateSettings({ defaultRestSec: n })
              else setRestText(String(settings.defaultRestSec))
            }}
          />
        </label>
        <label className="field">
          <span>Gewichtsschritt für +/− (kg)</span>
          <input
            className="input input-num"
            inputMode="decimal"
            value={stepText}
            onChange={(e) => setStepText(e.target.value)}
            onBlur={() => {
              const n = parseWeight(stepText)
              if (n !== null && !Number.isNaN(n) && n > 0) updateSettings({ weightStep: n })
              else setStepText(formatNumber(settings.weightStep))
            }}
          />
        </label>
        <Toggle label="Pausentimer automatisch starten" hint="Beim Abhaken eines Satzes" checked={settings.autoStartTimer} onChange={(v) => updateSettings({ autoStartTimer: v })} />
        <Toggle label="Ton am Ende der Pause" hint="Nur, solange die App im Vordergrund ist" checked={settings.sound} onChange={(v) => updateSettings({ sound: v })} />
        {canVibrate ? (
          <Toggle label="Vibration am Ende der Pause" checked={settings.vibration} onChange={(v) => updateSettings({ vibration: v })} />
        ) : (
          <p className="muted" style={{ fontSize: 13, margin: '6px 0' }}>
            Vibration: auf diesem Gerät nicht verfügbar (iPhone/Safari bietet keine Vibrations-Schnittstelle).
          </p>
        )}
        <Toggle
          label="Bildschirm während des Trainings anlassen"
          hint={canWakeLock ? 'Damit Timer und Ton zuverlässig laufen' : 'Auf diesem Gerät nicht unterstützt'}
          checked={settings.keepScreenOn}
          disabled={!canWakeLock}
          onChange={(v) => updateSettings({ keepScreenOn: v })}
        />
      </div>
    </>
  )
}

type ImportStage =
  | { kind: 'idle' }
  | { kind: 'error'; errors: string[] }
  | { kind: 'preview'; backup: Backup; warnings: string[] }
  | { kind: 'confirm-replace'; backup: Backup }
  | { kind: 'done'; result: ImportResult; mode: 'merge' | 'replace' }

export function BackupSection() {
  const data = useAppStore((s) => s.data)
  const markBackupDone = useAppStore((s) => s.markBackupDone)
  const importBackup = useAppStore((s) => s.importBackup)
  const fileRef = useRef<HTMLInputElement>(null)
  const [stage, setStage] = useState<ImportStage>({ kind: 'idle' })
  const [exported, setExported] = useState<string | null>(null)

  const doExport = () => {
    const backup = buildBackup(data, __APP_VERSION__)
    const name = backupFileName()
    downloadJson(name, backup)
    markBackupDone()
    setExported(name)
  }

  const onFile = async (file: File | undefined) => {
    if (!file) return
    setExported(null)
    let parsed: unknown
    try {
      parsed = JSON.parse(await readFileText(file))
    } catch {
      setStage({ kind: 'error', errors: ['Die Datei ist kein gültiges JSON.'] })
      return
    }
    const v = validateBackup(parsed)
    if (!v.ok) setStage({ kind: 'error', errors: v.errors })
    else setStage({ kind: 'preview', backup: v.backup, warnings: v.warnings })
    if (fileRef.current) fileRef.current.value = ''
  }

  const runImport = (backup: Backup, mode: 'merge' | 'replace') => {
    if (mode === 'replace') {
      // Vorher automatische Sicherung des aktuellen Stands (F13)
      downloadJson(backupFileName().replace('.json', '-vor-import.json'), buildBackup(data, __APP_VERSION__))
    }
    const result = importBackup(backup, mode)
    if (mode === 'replace') markBackupDone()
    setStage({ kind: 'done', result, mode })
  }

  const preview = stage.kind === 'preview' || stage.kind === 'confirm-replace' ? summarizeBackup(stage.backup) : null

  return (
    <>
      <BackupReminder onExport={doExport} />
      <h2 className="section-title">Sicherung</h2>
      <div className="card">
        <p className="muted" style={{ marginTop: 0 }}>
          Alle Daten liegen nur auf diesem Gerät. Exportiere regelmäßig eine Datei, zum Beispiel nach iCloud Drive. Beim Gerätewechsel importierst du sie auf dem neuen Gerät.
        </p>
        <p className="muted" style={{ fontSize: 14 }}>
          Letzte Sicherung: {data.meta.lastBackupAt ? formatDateTime(data.meta.lastBackupAt) : 'noch nie'}
          {data.meta.workoutsSinceBackup > 0 && ` · ${data.meta.workoutsSinceBackup} Training(s) seitdem`}
        </p>
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={doExport}>
            Exportieren
          </button>
          <button type="button" className="btn" onClick={() => fileRef.current?.click()}>
            Importieren
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            hidden
            aria-label="Sicherungsdatei wählen"
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
        </div>
        {exported && (
          <p className="ok" role="status" style={{ marginBottom: 0 }}>
            Exportiert: {exported}
          </p>
        )}

        {stage.kind === 'error' && (
          <div role="alert" style={{ marginTop: 12 }}>
            <p className="error" style={{ margin: '0 0 4px' }}>Import nicht möglich, Daten unverändert.</p>
            <ul className="muted" style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
              {stage.errors.map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
            <button type="button" className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => setStage({ kind: 'idle' })}>
              OK
            </button>
          </div>
        )}

        {(stage.kind === 'preview' || stage.kind === 'confirm-replace') && preview && (
          <div style={{ marginTop: 12 }} data-testid="import-preview">
            <p style={{ margin: '0 0 4px' }}>
              <strong>Datei geprüft.</strong> Exportiert am {formatDateTime(preview.exportedAt)}.
            </p>
            <p className="muted" style={{ margin: '0 0 8px', fontSize: 15 }}>
              {preview.exercises} Übungen · {preview.templates} Vorlagen · {preview.workouts} Trainings
            </p>
            {stage.kind === 'preview' && stage.warnings.length > 0 && (
              <p className="muted" style={{ fontSize: 14 }}>{stage.warnings.join(' ')}</p>
            )}
            <div className="btn-row">
              <button type="button" className="btn btn-primary" onClick={() => runImport(stage.backup, 'merge')}>
                Zusammenführen
              </button>
              <button type="button" className="btn" onClick={() => setStage({ kind: 'confirm-replace', backup: stage.backup })}>
                Alles ersetzen
              </button>
            </div>
            <button type="button" className="btn btn-sm" style={{ marginTop: 8 }} onClick={() => setStage({ kind: 'idle' })}>
              Abbrechen
            </button>
          </div>
        )}

        {stage.kind === 'done' && (
          <p className="ok" role="status" style={{ marginTop: 12, marginBottom: 0 }}>
            {stage.mode === 'replace'
              ? `Alle Daten ersetzt: ${stage.result.added.exercises} Übungen, ${stage.result.added.templates} Vorlagen, ${stage.result.added.workouts} Trainings.`
              : `Zusammengeführt: ${stage.result.added.workouts} Trainings neu, ${stage.result.updated.workouts} aktualisiert; ${stage.result.added.exercises} Übungen neu, ${stage.result.updated.exercises} aktualisiert.`}
            {stage.result.skippedActiveWorkout && ' Ein laufendes Training aus der Datei wurde übersprungen, weil hier bereits eines läuft.'}
          </p>
        )}
      </div>

      {stage.kind === 'confirm-replace' && (
        <ConfirmDialog
          title="Alle Daten ersetzen?"
          text={
            <>
              Alle vorhandenen Übungen, Vorlagen und Trainings auf diesem Gerät werden durch die Datei ersetzt. Vorher wird automatisch eine Sicherung des aktuellen Stands heruntergeladen.
            </>
          }
          confirmLabel="Ersetzen"
          danger
          onConfirm={() => runImport(stage.backup, 'replace')}
          onCancel={() => setStage({ kind: 'preview', backup: stage.backup, warnings: [] })}
        />
      )}
    </>
  )
}

function HintsSection() {
  const [open, setOpen] = useState<string | null>(null)
  const items: { id: string; title: string; text: string }[] = [
    {
      id: 'install',
      title: 'Auf dem iPhone installieren',
      text: 'In Safari öffnen, Teilen-Symbol tippen, „Zum Home-Bildschirm“. Die installierte App und der Safari-Tab haben getrennte Speicher: immer denselben Weg benutzen. Safari darf Website-Daten nach 7 Tagen ohne Nutzung löschen, die installierte App ist davon ausgenommen.',
    },
    {
      id: 'storage',
      title: 'Wo liegen meine Daten?',
      text: 'Nur in diesem Browser auf diesem Gerät. Kein Server, kein Konto. Wird die App gelöscht, sind die Daten weg. Deshalb regelmäßig exportieren und die Datei in iCloud Drive oder Dateien ablegen.',
    },
    {
      id: 'signal',
      title: 'Ton und Vibration am Ende der Pause',
      text: 'Ein Signal ist nur möglich, solange die App im Vordergrund ist und der Bildschirm an ist. Bei gesperrtem Bildschirm oder im Hintergrund hält iOS die App an. Deshalb bleibt der Bildschirm während des Trainings standardmäßig an. Die Restzeit stimmt nach der Rückkehr trotzdem, weil der Endzeitpunkt gespeichert wird. Vibration gibt es auf dem iPhone in Safari nicht.',
    },
  ]
  return (
    <>
      <h2 className="section-title">Hinweise</h2>
      <div className="list">
        {items.map((it) => (
          <div className="card" key={it.id}>
            <button type="button" className="card-tap row" aria-expanded={open === it.id} onClick={() => setOpen(open === it.id ? null : it.id)}>
              <span className="row-title">{it.title}</span>
              <span className="muted" aria-hidden="true">{open === it.id ? '−' : '+'}</span>
            </button>
            {open === it.id && <p className="muted" style={{ margin: '8px 0 0', fontSize: 15 }}>{it.text}</p>}
          </div>
        ))}
      </div>
    </>
  )
}

