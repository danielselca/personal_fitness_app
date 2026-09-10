export function TrainingScreen() {
  return (
    <>
      <button type="button" className="btn btn-primary btn-block" disabled>
        Training starten
      </button>
      <p className="muted" style={{ textAlign: 'center', marginTop: 12 }}>
        Kommt in Schritt 4 (aktives Training).
      </p>

      <h2 className="section-title">Diese Woche</h2>
      <div className="card empty">
        <strong>Noch kein Training</strong>
        Dein erstes Training erscheint hier, sobald du eines abgeschlossen hast.
      </div>
    </>
  )
}
