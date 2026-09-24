import { useState } from 'react'
import type { MediaInfo } from '../domain/media.ts'

/**
 * Bewegungsgrafik: Phasen als gestapelte Bilder, weich überblendet (CSS-Animation); bei
 * „Bewegung reduzieren“ nebeneinander. `thumb` zeigt nur die erste Phase und lädt erst beim
 * Scrollen. Ohne Netz und ohne Cache erscheint ein ruhiger Platzhalter.
 */
export function ExerciseMedia({
  media,
  name,
  size = 'large',
  credit = size === 'large',
}: {
  media: MediaInfo
  name: string
  size?: 'large' | 'small' | 'thumb'
  credit?: boolean
}) {
  const [failed, setFailed] = useState(false)
  const onError = () => setFailed(true)

  if (size === 'thumb') {
    return (
      <span className="media-thumb" aria-hidden="true">
        {!failed && <img src={media.frames[0]} alt="" loading="lazy" decoding="async" onError={onError} />}
      </span>
    )
  }
  const frames = media.frames.length
  return (
    <figure className={`media media-${size} media-${frames}`} style={{ ['--frames' as string]: frames }}>
      {failed ? (
        <div className="media-missing" role="img" aria-label={`Grafik zu ${name} offline nicht verfügbar`}>
          Grafik offline nicht verfügbar
        </div>
      ) : (
        <div className="media-stage" role="img" aria-label={`Bewegungsablauf ${name} (${frames} Phasen)`}>
          {media.frames.map((src, i) => (
            <img key={src} src={src} alt="" decoding="async" onError={onError} className="media-frame" style={{ animationDelay: `${(i * MEDIA_PHASE_SEC).toFixed(2)}s` }} />
          ))}
        </div>
      )}
      {credit && <figcaption className="media-credit">Grafik: {media.credit}</figcaption>}
    </figure>
  )
}

/** Sichtbare Zeit je Phase in Sekunden (Durchlauf = Phasen × diese Zeit). */
const MEDIA_PHASE_SEC = 0.9
