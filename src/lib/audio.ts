/**
 * Kurzer Signalton per Web Audio (F9). Muss durch eine Nutzeraktion freigeschaltet werden;
 * spielt nur, solange die Seite im Vordergrund läuft (siehe SPEC „Grenzen von Ton und Vibration“).
 */
let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return null
  if (!ctx) ctx = new Ctor()
  return ctx
}

/** Bei der ersten Berührung aufrufen, damit iOS spätere Töne erlaubt. */
export function unlockAudio(): void {
  const c = getContext()
  if (!c) return
  if (c.state === 'suspended') void c.resume()
  // Stiller Puffer, um den Kanal zu öffnen
  const buf = c.createBuffer(1, 1, 22050)
  const src = c.createBufferSource()
  src.buffer = buf
  src.connect(c.destination)
  src.start(0)
}

export function playTimerSound(): void {
  const c = getContext()
  if (!c) return
  if (c.state === 'suspended') void c.resume()
  const t0 = c.currentTime
  const tones = [880, 880, 1175]
  tones.forEach((freq, i) => {
    const osc = c.createOscillator()
    const gain = c.createGain()
    osc.type = 'sine'
    osc.frequency.value = freq
    const start = t0 + i * 0.22
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.5, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.18)
    osc.connect(gain).connect(c.destination)
    osc.start(start)
    osc.stop(start + 0.2)
  })
}

export function vibrateTimer(): boolean {
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return false
  try {
    return navigator.vibrate([200, 100, 200, 100, 400])
  } catch {
    return false
  }
}
