import { useEffect, useState } from 'react'
import { useAppStore } from '../store/appStore.ts'

export type EffectiveTheme = 'light' | 'dark'

const THEME_COLOR: Record<EffectiveTheme, string> = { light: '#f3f2ef', dark: '#101010' }

function systemTheme(): EffectiveTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Wendet die Theme-Einstellung an (`data-theme` am <html>, Statusleistenfarbe) und liefert
 * das tatsächlich sichtbare Erscheinungsbild. 'system' folgt dem Gerät live.
 */
export function useTheme(): EffectiveTheme {
  const setting = useAppStore((s) => s.data.settings.theme)
  const [system, setSystem] = useState<EffectiveTheme>(systemTheme)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => setSystem(mq.matches ? 'dark' : 'light')
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])

  const effective: EffectiveTheme = setting === 'system' ? system : setting

  useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    if (setting === 'system') delete root.dataset.theme
    else root.dataset.theme = setting
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', THEME_COLOR[effective])
  }, [setting, effective])

  return effective
}
