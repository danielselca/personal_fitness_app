import { useState } from 'react'
import { GOAL_LABEL } from '../domain/programs.ts'
import { dayKey } from '../domain/restrictions.ts'
import { LEVEL_LABEL } from '../domain/taxonomy.ts'
import type { Profile } from '../domain/types.ts'
import { formatDate, formatKg, parseWeight } from '../lib/format.ts'
import { useAppStore } from '../store/appStore.ts'
import { WeightChart } from './WeightChart.tsx'

const DEFAULT_PROFILE: Profile = { goal: 'muskelaufbau', experience: 'einsteiger' }

/** Mehr → Profil: Ziel, Erfahrung, Körpergewicht mit Verlauf (optional). */
export function ProfileSection() {
  const settings = useAppStore((s) => s.data.settings)
  const bodyLog = useAppStore((s) => s.data.bodyLog)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const addBodyWeight = useAppStore((s) => s.addBodyWeight)
  const removeBodyWeight = useAppStore((s) => s.removeBodyWeight)
  const [weight, setWeight] = useState('')
  const [error, setError] = useState<string | null>(null)
  const profile = settings.profile ?? DEFAULT_PROFILE
  const setProfile = (patch: Partial<Profile>) => updateSettings({ profile: { ...profile, ...patch } })
  const last = bodyLog[bodyLog.length - 1]

  const save = () => {
    const kg = parseWeight(weight)
    if (kg === null || Number.isNaN(kg) || !addBodyWeight(dayKey(), kg)) return setError('Bitte ein Gewicht zwischen 20 und 400 kg eingeben.')
    setError(null)
    setWeight('')
  }

  return (
    <>
      <h2 className="section-title">Profil</h2>
      <div className="card">
        <div className="field">
          <span>Ziel</span>
          <div className="segment" role="radiogroup" aria-label="Ziel" style={{ marginBottom: 0 }}>
            {(['muskelaufbau', 'fitness'] as const).map((g) => (
              <button key={g} type="button" role="radio" aria-checked={profile.goal === g} className={profile.goal === g ? 'on' : ''} onClick={() => setProfile({ goal: g })}>
                {GOAL_LABEL[g]}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <span>Erfahrung</span>
          <div className="segment" role="radiogroup" aria-label="Erfahrung" style={{ marginBottom: 0 }}>
            {(['einsteiger', 'fortgeschritten'] as const).map((l) => (
              <button key={l} type="button" role="radio" aria-checked={profile.experience === l} className={profile.experience === l ? 'on' : ''} onClick={() => setProfile({ experience: l })}>
                {LEVEL_LABEL[l]}
              </button>
            ))}
          </div>
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <span>Körpergewicht (optional)</span>
          <div className="input-inline">
            <input
              className="input input-num"
              inputMode="decimal"
              aria-label="Körpergewicht heute"
              placeholder={last ? formatKg(last.weightKg) : 'kg'}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && save()}
            />
            <button type="button" className="btn" onClick={save} disabled={!weight.trim()}>
              Eintragen
            </button>
          </div>
          {error && <p className="error" role="alert">{error}</p>}
        </div>
        {bodyLog.length > 0 && (
          <>
            {bodyLog.length > 1 && (
              <div style={{ marginTop: 12 }}>
                <WeightChart mode="body" points={bodyLog.map((b) => ({ workoutId: b.id, date: `${b.date}T12:00:00`, maxWeightKg: b.weightKg, reps: null, sets: [] }))} />
              </div>
            )}
            <ul className="list" aria-label="Körpergewicht-Einträge" style={{ marginTop: 8 }}>
              {[...bodyLog].reverse().slice(0, 5).map((b) => (
                <li key={b.id} className="restrict-row">
                  <span className="row-main">
                    {formatKg(b.weightKg)} <span className="muted">· {formatDate(`${b.date}T12:00:00`)}</span>
                  </span>
                  <button type="button" className="btn btn-sm" aria-label={`Eintrag vom ${formatDate(`${b.date}T12:00:00`)} löschen`} onClick={() => removeBodyWeight(b.id)}>
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
