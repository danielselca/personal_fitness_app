export function MoreScreen() {
  return (
    <>
      <div className="card">
        <strong>Einstellungen</strong>
        <p className="muted" style={{ margin: '4px 0 0' }}>
          Pausendauer, Timer-Signal, Sicherung (Export/Import) – kommt in den Schritten 5 und 8.
        </p>
      </div>
      <div className="card">
        <strong>Version</strong>
        <p className="muted num" style={{ margin: '4px 0 0' }}>{__APP_VERSION__}</p>
      </div>
    </>
  )
}
