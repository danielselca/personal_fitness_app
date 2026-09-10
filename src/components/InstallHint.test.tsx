// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSeedData } from '../domain/seed.ts'
import { appStore } from '../store/appStore.ts'
import { InstallHint } from './InstallHint.tsx'

beforeEach(() => appStore.setState({ data: createSeedData(), hydrated: true, loadError: null }))
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('Installationshinweis (A-4)', () => {
  it('erscheint auf dem iPhone im Browser und nur einmal', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Safari/604.1')
    const { rerender } = render(<InstallHint />)
    expect(screen.getByTestId('install-hint').textContent).toMatch(/Zum Home-Bildschirm/)
    fireEvent.click(screen.getByRole('button', { name: 'Hinweis verstanden' }))
    rerender(<InstallHint />)
    expect(screen.queryByTestId('install-hint')).toBeNull()
    expect(appStore.getState().data.meta.hintsSeen).toContain('install-ios')
  })

  it('erscheint nicht auf anderen Geräten oder in der installierten App', () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (Linux; Android 14) Chrome/120')
    render(<InstallHint />)
    expect(screen.queryByTestId('install-hint')).toBeNull()
    cleanup()
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Safari/604.1')
    Object.defineProperty(navigator, 'standalone', { value: true, configurable: true })
    render(<InstallHint />)
    expect(screen.queryByTestId('install-hint')).toBeNull()
    Object.defineProperty(navigator, 'standalone', { value: undefined, configurable: true })
  })
})
