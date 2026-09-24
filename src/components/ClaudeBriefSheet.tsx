import { useMemo, useRef, useState } from 'react'
import { BRIEF_MAX_CHARS, buildBrief, QUESTION_MAX_CHARS } from '../domain/briefing.ts'
import { copyText } from '../lib/download.ts'
import { useAppStore } from '../store/appStore.ts'
import { Sheet } from './Sheet.tsx'
import { Toggle } from './Toggle.tsx'

/**
 * „Mit Claude besprechen“: Brief über dein Training als Text – teilen (iPhone: Teilen-Menü →
 * Claude-App) oder kopieren. Der Text verlässt die App nur durch dich.
 */
export default function ClaudeBriefSheet({ onClose, onImport }: { onClose: () => void; onImport: () => void }) {
  const data = useAppStore((s) => s.data)
  const [question, setQuestion] = useState('')
  const [bodyWeight, setBodyWeight] = useState(false)
  const [status, setStatus] = useState<'idle' | 'copied' | 'shared' | 'manual'>('idle')
  const manualRef = useRef<HTMLTextAreaElement>(null)
  const now = useMemo(() => new Date(), [])
  const text = useMemo(() => buildBrief(data, { now, question, includeBodyWeight: bodyWeight }), [data, now, question, bodyWeight])
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const copy = async () => {
    if (await copyText(text)) setStatus('copied')
    else {
      setStatus('manual')
      setTimeout(() => manualRef.current?.select(), 0)
    }
  }
  const share = async () => {
    try {
      await navigator.share({ title: 'Mein Training', text })
      setStatus('shared')
    } catch (e) {
      // Abbrechen im Teilen-Menü ist kein Fehler; sonst auf Kopieren ausweichen
      if ((e as Error)?.name !== 'AbortError') await copy()
    }
  }

  return (
    <Sheet
      title="Mit Claude besprechen"
      onClose={onClose}
      footer={
        <div className="btn-row" style={{ width: '100%' }}>
          {canShare && (
            <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={share}>Teilen …</button>
          )}
          <button type="button" className={`btn ${canShare ? '' : 'btn-primary'}`} style={{ flex: 1 }} onClick={copy}>Kopieren</button>
        </div>
      }
    >
      <p className="muted" style={{ marginTop: 0 }}>
        Die App schreibt einen Brief über dein Training: Profil, Programm, geschonte Bereiche, die letzten 8 Wochen, deine Übungen und die Befunde des Coachs. Teile ihn mit der Claude-App oder kopiere ihn in einen Chat.
      </p>
      <label className="field">
        <span>Deine Frage (optional)</span>
        <textarea
          className="input"
          rows={3}
          maxLength={QUESTION_MAX_CHARS}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="z. B. Soll ich auf 4 Trainings pro Woche gehen?"
          aria-label="Deine Frage"
        />
      </label>
      <Toggle label="Körpergewicht mitschicken" hint="Letzter Eintrag aus Mehr → Profil" checked={bodyWeight} onChange={setBodyWeight} />
      <details className="form-section">
        <summary>
          Vorschau ({text.length.toLocaleString('de-DE')} von höchstens {BRIEF_MAX_CHARS.toLocaleString('de-DE')} Zeichen)
        </summary>
        <pre className="brief-preview" aria-label="Vorschau des Briefs">{text}</pre>
      </details>
      {status === 'copied' && <p className="ok" role="status">Kopiert. Jetzt in der Claude-App einfügen.</p>}
      {status === 'shared' && <p className="ok" role="status">Geteilt.</p>}
      {status === 'manual' && (
        <div role="status">
          <p className="muted">Kopieren ging nicht automatisch – Text markieren und kopieren:</p>
          <textarea ref={manualRef} className="input brief-manual" readOnly value={text} aria-label="Brief zum Kopieren" rows={8} />
        </div>
      )}
      <p className="muted" style={{ fontSize: 13 }}>
        Der Text verlässt die App nur, wenn du ihn teilst oder kopierst. Er enthält keinen Namen und keine Notizen aus Trainings; die Notiz zu geschonten Bereichen geht mit.
      </p>
      <div className="brief-return">
        <strong>Claude hat ein Programm vorgeschlagen?</strong>
        <button type="button" className="btn btn-sm" onClick={onImport}>Programm übernehmen …</button>
      </div>
    </Sheet>
  )
}
