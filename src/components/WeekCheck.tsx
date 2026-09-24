import { ratioText } from '../domain/coach/balance.ts'
import { FREQUENCY_TARGET } from '../domain/coach/frequency.ts'
import { OVERALL_LABEL, type Light, type LightLevel, type Suggestion, type WeekCheck as Check } from '../domain/coach/hints.ts'
import { formatMmSs, formatNumber } from '../lib/format.ts'
import { useNav } from '../store/navStore.ts'

const LEVEL_LABEL: Record<LightLevel, string> = { gruen: 'grün', gelb: 'gelb', rot: 'rot', grau: 'keine Daten' }

/**
 * Wochencheck (Coach II): Ampeln mit Begründung, Details zum Aufklappen und bis zu drei
 * Vorschläge für die nächste Woche. Ein Tipp auf einen Vorschlag öffnet Vorlage oder Übung.
 */
export function WeekCheck({ check, offset, onOffset }: { check: Check; offset: 0 | -1; onOffset: (o: 0 | -1) => void }) {
  const go = useNav((s) => s.go)
  const open = (s: Suggestion) => {
    if (!s.target) return
    if (s.target.kind === 'template') go('training', s.target)
    else go('exercises', s.target)
  }

  return (
    <section className="card week-check" aria-label="Wochencheck">
      <div className="row" style={{ alignItems: 'baseline' }}>
        <h2 className="wc-title">Wochencheck {check.range.label}</h2>
        {check.overall && check.workouts > 0 && (
          <span className="wc-overall" data-overall={check.overall}>Gesamt: {OVERALL_LABEL[check.overall]}</span>
        )}
      </div>
      <div className="segment" role="radiogroup" aria-label="Woche wählen">
        <button type="button" role="radio" aria-checked={offset === 0} className={offset === 0 ? 'on' : ''} onClick={() => onOffset(0)}>Diese Woche</button>
        <button type="button" role="radio" aria-checked={offset === -1} className={offset === -1 ? 'on' : ''} onClick={() => onOffset(-1)}>Letzte Woche</button>
      </div>

      {check.workouts === 0 ? (
        <p className="muted" style={{ margin: 0 }}>
          {offset === 0 ? 'Nach dem ersten Training dieser Woche erscheint hier dein Wochencheck.' : 'Letzte Woche wurde nicht trainiert.'}
        </p>
      ) : (
        <>
          <ul className="wc-lights" aria-label="Ampeln">
            {check.lights.map((l) => (
              <li key={l.key}>
                <LightRow light={l} check={check} />
              </li>
            ))}
          </ul>
          {check.restricted.map((r) => (
            <p key={r} className="wc-note">Geschont: {r} – nicht bewertet</p>
          ))}
          {check.unassigned.length > 0 && (
            <p className="wc-note">
              {check.unassigned.length === 1 ? '1 Übung' : `${check.unassigned.length} Übungen`} ohne Muskelzuordnung ({check.unassigned.map((e) => e.name).join(', ')}) – unter Übungen zuordnen, dann zählen sie mit.
            </p>
          )}
          {check.suggestions.length > 0 && (
            <>
              <h3 className="wc-sub">Nächste Woche</h3>
              <ol className="wc-suggestions" aria-label="Vorschläge für nächste Woche">
                {check.suggestions.map((s) => (
                  <li key={s.text}>
                    {s.target ? (
                      <button type="button" className="wc-suggestion card-tap" onClick={() => open(s)}>
                        <span className="row-main">
                          <strong style={{ display: 'block' }}>{s.text}</strong>
                          <span className="row-sub">{s.why}</span>
                        </span>
                        <span className="muted" aria-hidden="true">›</span>
                      </button>
                    ) : (
                      <div className="wc-suggestion">
                        <span className="row-main">
                          <strong style={{ display: 'block' }}>{s.text}</strong>
                          <span className="row-sub">{s.why}</span>
                        </span>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            </>
          )}
        </>
      )}
    </section>
  )
}

function LightRow({ light, check }: { light: Light; check: Check }) {
  const head = (
    <>
      <span className="wc-dot" data-level={light.level} role="img" aria-label={LEVEL_LABEL[light.level]} />
      <span className="row-main">
        <strong style={{ display: 'block' }}>{light.label}</strong>
        <span className="row-sub">{light.text}</span>
      </span>
    </>
  )
  const details = light.key === 'volumen' ? <VolumeDetails check={check} /> : light.key === 'dichte' && check.rest.count > 0 ? <RestDetails check={check} /> : null
  if (!details) return <div className="wc-light">{head}</div>
  return (
    <details className="wc-details">
      <summary className="wc-light">{head}</summary>
      {details}
    </details>
  )
}

function VolumeDetails({ check }: { check: Check }) {
  const { target, balance } = check
  const scale = Math.max(target.max * 1.25, ...check.volumes.map((v) => v.sets))
  const pct = (n: number) => `${(n / scale) * 100}%`
  return (
    <div className="wc-more">
      <ul className="vol-bars" aria-label="Sätze je Muskelgruppe">
        {check.volumes.map((v) => (
          <li key={v.id} data-status={v.status}>
            <span className="vol-label">{v.label}</span>
            <span className="vol-track" aria-hidden="true">
              <span className="vol-zone" style={{ left: pct(target.min), width: pct(target.max - target.min) }} />
              <span className="vol-fill" style={{ width: pct(v.sets) }} />
            </span>
            <span className="vol-num">{v.status === 'geschont' ? 'geschont' : formatNumber(v.sets)}</span>
          </li>
        ))}
      </ul>
      <p className="muted wc-fine">
        Ziel {target.min}–{target.max} harte Sätze je Gruppe und Woche (Faustregel; Hauptmuskel 1, mitbeteiligt ½ Satz). Grüner Bereich = Ziel.
      </p>
      <p className="wc-fine">
        Häufigkeit: {check.frequencies.map((f) => `${f.label} ${f.restricted ? 'geschont' : `${f.days}×`}`).join(' · ')} (Faustregel ≥ {FREQUENCY_TARGET}×)
      </p>
      <p className="wc-fine">
        Drücken : Ziehen = {balance.ratio === null ? (balance.push ? 'nur Drücken' : '–') : balance.push === 0 ? 'kein Drücken' : ratioText(balance.ratio)} ({balance.push} : {balance.pull} Sätze) · Oberkörper : Unterkörper = {balance.upper} : {balance.lower}
      </p>
    </div>
  )
}

function RestDetails({ check }: { check: Check }) {
  const r = check.rest
  return (
    <p className="wc-more wc-fine">
      {r.count} Pausen gemessen (Zeit zwischen zwei abgehakten Sätzen, über 10 min zählt nicht). Ø {formatMmSs(r.avgSec)} statt geplant {formatMmSs(r.targetSec)}
      {r.tooLong ? ' – längere Pausen verlängern das Training, sind für schwere Sätze aber in Ordnung.' : '.'}
    </p>
  )
}
