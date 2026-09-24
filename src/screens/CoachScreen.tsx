import { useMemo } from 'react'
import { exerciseTrends, recentRecords, weekStatus, type TrendKind } from '../domain/coach/consistency.ts'
import { nextProgramDay } from '../domain/programs.ts'
import { activeRestrictions, dayKey, restrictionLabel } from '../domain/restrictions.ts'
import { finishedWorkouts } from '../domain/stats.ts'
import { formatRelativeDay } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'
import { useNav } from '../store/navStore.ts'

const TREND_ICON: Record<TrendKind, string> = { gesteigert: '↑', gleich: '→', weniger: '↓', stagniert: '⏸' }
const TREND_LABEL: Record<TrendKind, string> = { gesteigert: 'gesteigert', gleich: 'gleich', weniger: 'weniger', stagniert: 'steht' }

/**
 * Coach I: Wochenziel und Serie, nächstes Programm-Training, Fortschritt je Übung, letzte
 * Bestwerte und geschonte Bereiche. Jede Aussage mit Begründung; Faustregeln sind gekennzeichnet.
 */
export default function CoachScreen() {
  const data = useAppStore((s) => s.data)
  const setTab = useNav((s) => s.setTab)
  const now = useMemo(() => new Date(), [])
  const week = weekStatus(data.workouts, now, data.settings.weeklyGoal)
  const trends = useMemo(() => exerciseTrends(data.workouts, data.exercises).slice(0, 8), [data.workouts, data.exercises])
  const records = useMemo(() => recentRecords(data.workouts, data.exercises).slice(0, 5), [data.workouts, data.exercises])
  const restricted = activeRestrictions(data.restrictions, dayKey(now))
  const program = data.programs.find((p) => p.id === data.settings.activeProgramId)
  const next = program ? nextProgramDay(program, data.workouts) : null
  const hasWorkouts = finishedWorkouts(data.workouts).length > 0
  const pct = Math.min(1, week.thisWeek / week.goal)
  const R = 34
  const C = 2 * Math.PI * R

  return (
    <>
      <section className="card coach-week" aria-label="Diese Woche">
        <svg className="coach-ring" viewBox="0 0 80 80" role="img" aria-label={`${week.thisWeek} von ${week.goal} Trainings diese Woche`}>
          <circle cx="40" cy="40" r={R} className="coach-ring-bg" />
          <circle cx="40" cy="40" r={R} className="coach-ring-fg" strokeDasharray={`${C * pct} ${C}`} transform="rotate(-90 40 40)" />
          <text x="40" y="46" textAnchor="middle" className="coach-ring-text">{week.thisWeek}/{week.goal}</text>
        </svg>
        <div className="row-main">
          <strong style={{ display: 'block' }}>Diese Woche</strong>
          <span className="row-sub" style={{ display: 'block' }}>
            {week.thisWeek >= week.goal ? 'Wochenziel erreicht.' : `Noch ${week.goal - week.thisWeek} bis zum Wochenziel.`}
          </span>
          <span className="row-sub" style={{ display: 'block' }}>
            {week.streak > 0 ? `Serie: ${week.streak} ${week.streak === 1 ? 'Woche' : 'Wochen'} in Folge Ziel erreicht` : 'Noch keine Serie – jede Woche mit Ziel zählt.'}
          </span>
        </div>
      </section>

      {next && (
        <button type="button" className="card card-tap row" style={{ marginTop: 12 }} onClick={() => setTab('training')}>
          <span className="row-main">
            <span className="row-title" style={{ display: 'block' }}>Nächstes: {next.name}</span>
            <span className="row-sub">{program!.name} – zum Training</span>
          </span>
          <span className="muted" aria-hidden="true">›</span>
        </button>
      )}

      <h2 className="section-title">Fortschritt</h2>
      {!hasWorkouts || trends.length === 0 ? (
        <div className="card empty">
          <strong>Noch zu wenig Daten</strong>
          Ab zwei Einheiten je Übung siehst du hier, was gesteigert wurde und was steht.
        </div>
      ) : (
        <ul className="list" aria-label="Fortschritt je Übung">
          {trends.map((t) => (
            <li key={t.exercise.id} className="card trend-row" data-kind={t.kind}>
              <span className="trend-icon" aria-label={TREND_LABEL[t.kind]}>{TREND_ICON[t.kind]}</span>
              <span className="row-main">
                <span className="row-title ellipsis" style={{ display: 'block' }}>{t.exercise.name}</span>
                <span className="row-sub">{t.text} · {formatRelativeDay(t.date)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
      {trends.some((t) => t.kind === 'stagniert') && (
        <p className="muted" style={{ fontSize: 13 }}>
          ⏸ = seit 3 Einheiten unverändert (Faustregel). Ideen: Wdh.-Bereich wechseln, Übung tauschen oder eine leichtere Woche einlegen.
        </p>
      )}

      {records.length > 0 && (
        <>
          <h2 className="section-title">Letzte Bestwerte</h2>
          <ul className="list" aria-label="Letzte Bestwerte">
            {records.map((r) => (
              <li key={`${r.exerciseId}-${r.date}`} className="card">
                <span className="row-title" style={{ display: 'block' }}>🏆 {r.name}</span>
                <span className="row-sub">{r.text} · {formatRelativeDay(r.date)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {restricted.length > 0 && (
        <>
          <h2 className="section-title">Geschont</h2>
          <button type="button" className="card card-tap row" onClick={() => setTab('more')}>
            <span className="row-main">
              {restricted.map((r) => (
                <span key={r.id} className="row-sub" style={{ display: 'block' }}>{restrictionLabel(r)}</span>
              ))}
              <span className="row-sub" style={{ display: 'block' }}>Keine Steigerung für betroffene Übungen. Ändern unter Mehr.</span>
            </span>
            <span className="muted" aria-hidden="true">›</span>
          </button>
        </>
      )}

      <p className="muted" style={{ fontSize: 13, marginTop: 16 }}>
        Der Coach arbeitet mit Faustregeln aus der Trainingswissenschaft (u. a. ACSM) und ersetzt keine ärztliche oder physiotherapeutische Beratung.
      </p>
    </>
  )
}
