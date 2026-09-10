import { useMemo, useState } from 'react'
import { BarChart } from '../components/BarChart.tsx'
import { WeightChart } from '../components/WeightChart.tsx'
import { finishedWorkouts, weightProgression, workoutVolume, workoutsPerWeek } from '../domain/stats.ts'
import { formatDate, formatKg, formatNumber, formatVolume } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'

/** Statistik (F11, AK17–AK19): Trainings pro Woche, Volumen je Training, Gewichtsverlauf je Übung. */
export function StatsView() {
  const workouts = useAppStore((s) => s.data.workouts)
  const exercises = useAppStore((s) => s.data.exercises)
  const finished = useMemo(() => finishedWorkouts(workouts), [workouts])
  const weekly = useMemo(() => workoutsPerWeek(workouts, new Date(), 12), [workouts])
  const exercisesWithHistory = useMemo(() => {
    const ids = new Set<string>()
    for (const w of finished) for (const e of w.entries) if (e.sets.some((s) => s.done)) ids.add(e.exerciseId)
    return exercises.filter((e) => ids.has(e.id)).sort((a, b) => a.name.localeCompare(b.name, 'de'))
  }, [finished, exercises])
  const [selected, setSelected] = useState<string>('')
  const selectedId = selected || exercisesWithHistory[0]?.id || ''
  const progression = useMemo(() => (selectedId ? weightProgression(workouts, selectedId) : []), [workouts, selectedId])

  if (finished.length === 0) {
    return (
      <div className="card empty" data-testid="stats-empty">
        <strong>Noch keine Statistik</strong>
        Sobald du ein Training abgeschlossen hast, siehst du hier Trainings pro Woche, Volumen und den Gewichtsverlauf je Übung. Starte dein erstes Training im Tab „Training“.
      </div>
    )
  }

  const volumeBars = finished
    .slice(0, 20)
    .reverse()
    .map((w) => ({ key: w.id, label: formatDate(w.finishedAt!).slice(-10, -5), value: workoutVolume(w) }))
  const total = weekly.reduce((a, b) => a + b.count, 0)

  return (
    <>
      <h2 className="section-title">Trainings pro Woche</h2>
      <div className="card" data-testid="stats-weekly">
        <BarChart
          label="Trainings pro Woche, letzte 12 Wochen"
          bars={weekly.map((w) => ({ key: w.key, label: `KW ${w.key.slice(-2)}`, value: w.count }))}
          formatValue={(v) => String(v)}
          height={130}
        />
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>{total} Trainings in 12 Wochen · aktuelle Woche: {weekly[11].count}</p>
      </div>

      <h2 className="section-title">Volumen je Training</h2>
      <div className="card" data-testid="stats-volume">
        <BarChart label="Volumen je Training" bars={volumeBars} formatValue={(v) => (v >= 1000 ? `${formatNumber(Math.round(v / 100) / 10)}k` : String(Math.round(v)))} />
        <p className="muted" style={{ margin: 0, fontSize: 13 }}>Summe aus kg × Wdh. der abgehakten Sätze, letzte {volumeBars.length} Trainings. Zuletzt: {formatVolume(volumeBars[volumeBars.length - 1].value)}</p>
      </div>

      <h2 className="section-title">Gewichtsverlauf je Übung</h2>
      <div className="card" data-testid="stats-exercise">
        {exercisesWithHistory.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>Noch keine Sätze mit Gewicht abgehakt.</p>
        ) : (
          <>
            <label className="field">
              <span>Übung</span>
              <select className="input" value={selectedId} onChange={(e) => setSelected(e.target.value)} aria-label="Übung wählen">
                {exercisesWithHistory.map((e) => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </label>
            <WeightChart points={progression} />
            <table className="table" style={{ marginTop: 8 }}>
              <thead><tr><th>Datum</th><th>Max.</th><th>Sätze</th></tr></thead>
              <tbody>
                {[...progression].reverse().map((p) => (
                  <tr key={p.workoutId}>
                    <td>{formatDate(p.date)}</td>
                    <td className="num">{p.maxWeightKg === null ? '–' : `${p.reps} × ${formatKg(p.maxWeightKg)}`}</td>
                    <td className="num muted">{p.sets.map((s) => `${s.reps}×${s.weightKg === null ? '–' : formatNumber(s.weightKg)}`).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  )
}
