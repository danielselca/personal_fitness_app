import { useState } from 'react'
import { backupFileName, buildBackup } from '../domain/backup.ts'
import { downloadJson } from '../lib/download.ts'
import { appStore, useAppStore } from '../store/appStore.ts'

/** Speichern ist fehlgeschlagen: sichtbar machen, erneut versuchen oder als Datei sichern. */
export function SaveErrorBanner() {
  const saveError = useAppStore((s) => s.saveError)
  const retrySave = useAppStore((s) => s.retrySave)
  const [busy, setBusy] = useState(false)
  if (!saveError) return null

  const retry = async () => {
    setBusy(true)
    await retrySave()
    setBusy(false)
  }
  const exportNow = () => {
    const data = appStore.getState().data
    downloadJson(backupFileName(), buildBackup(data, __APP_VERSION__))
  }

  return (
    <div className="banner banner-danger" role="alert" data-testid="save-error">
      <span className="banner-text">
        <strong>Nicht gespeichert</strong>
      </span>
      <button type="button" className="btn btn-sm" onClick={retry} disabled={busy}>
        Erneut
      </button>
      <button type="button" className="btn btn-sm" onClick={exportNow}>
        Backup
      </button>
    </div>
  )
}
