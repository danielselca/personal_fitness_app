import { ATTRIBUTION_URL, LICENSE_URL } from '../domain/media.ts'
import { MEDIA_SOURCES } from '../domain/media-sources.ts'

/** Mehr → „Quellen & Lizenzen“ der Bewegungsgrafiken (CC BY-SA 4.0 verlangt Namensnennung). */
export function LicensesSection() {
  return (
    <>
      <h2 className="section-title">Quellen & Lizenzen</h2>
      <div className="card licenses">
        <p style={{ marginTop: 0 }}>Bewegungsgrafiken:</p>
        <ul>
          <li>
            <a href={MEDIA_SOURCES['workout-guide'].url} target="_blank" rel="noreferrer">Workout Guide</a> von Bryl Lim, teils nach Everkinetic
          </li>
          <li>
            <a href={MEDIA_SOURCES.everkinetic.url} target="_blank" rel="noreferrer">Everkinetic</a>
          </li>
        </ul>
        <p>
          Lizenz: <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.de" target="_blank" rel="noreferrer">CC BY-SA 4.0</a>. Für die App verkleinert (Koordinaten gerundet),
          bei Everkinetic Hintergrund entfernt; die veränderten Grafiken stehen ebenfalls unter CC BY-SA 4.0.
        </p>
        <p style={{ marginBottom: 0 }}>
          <a href={LICENSE_URL} target="_blank" rel="noreferrer">Lizenzhinweis</a> · <a href={ATTRIBUTION_URL} target="_blank" rel="noreferrer">Urheber je Grafik</a>
        </p>
        <p className="muted" style={{ marginBottom: 0, fontSize: 13 }}>Übungstexte (Ausführung, typische Fehler) sind eigene Texte dieser App.</p>
      </div>
    </>
  )
}
