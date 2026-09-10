import { useAppStore } from '../store/appStore.ts'

export const BACKUP_REMINDER_THRESHOLD = 3

/** Dezente Erinnerung, wenn seit der letzten Sicherung ≥ 3 Trainings abgeschlossen wurden (F15). */
export function BackupReminder({ onExport, onDismiss }: { onExport: () => void; onDismiss?: () => void }) {
  const since = useAppStore((s) => s.data.meta.workoutsSinceBackup)
  const last = useAppStore((s) => s.data.meta.lastBackupAt)
  if (since < BACKUP_REMINDER_THRESHOLD) return null
  return (
    <div className="banner banner-warn" role="status" data-testid="backup-reminder">
      <span className="banner-text">
        <strong>{since} Trainings</strong> seit der letzten Sicherung{last ? '' : ' (noch nie gesichert)'}. Jetzt exportieren?
      </span>
      <button type="button" className="btn btn-sm" onClick={onExport}>
        Sichern
      </button>
      {onDismiss && (
        <button type="button" className="btn btn-sm btn-icon" aria-label="Hinweis schließen" onClick={onDismiss}>
          ✕
        </button>
      )}
    </div>
  )
}
