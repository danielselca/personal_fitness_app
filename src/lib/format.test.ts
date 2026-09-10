import { describe, expect, it } from 'vitest'
import { formatKg, formatNumber, parseReps, parseWeight } from './format.ts'

describe('formatKg', () => {
  it('formatiert deutsch mit Komma', () => {
    expect(formatKg(12.5)).toBe('12,5 kg')
    expect(formatKg(45)).toBe('45 kg')
    expect(formatKg(1280)).toBe('1.280 kg')
  })
  it('zeigt Strich ohne Gewicht', () => {
    expect(formatKg(null)).toBe('– kg')
    expect(formatKg(undefined)).toBe('– kg')
  })
})

describe('formatNumber', () => {
  it('ohne Einheit', () => {
    expect(formatNumber(47.5)).toBe('47,5')
  })
})

describe('parseWeight (AK8)', () => {
  it('akzeptiert Komma und Punkt', () => {
    expect(parseWeight('12,5')).toBe(12.5)
    expect(parseWeight('12.5')).toBe(12.5)
    expect(parseWeight(' 45 ')).toBe(45)
    expect(parseWeight('45 kg')).toBe(45)
  })
  it('leer bedeutet kein Gewicht', () => {
    expect(parseWeight('')).toBeNull()
    expect(parseWeight('   ')).toBeNull()
  })
  it('lehnt Unsinn ab', () => {
    expect(parseWeight('abc')).toBeNaN()
    expect(parseWeight('-5')).toBeNaN()
    expect(parseWeight('1,234')).toBeNaN()
  })
})

describe('parseReps', () => {
  it('ganze Zahl ab 1', () => {
    expect(parseReps('10')).toBe(10)
    expect(parseReps('0')).toBeNaN()
    expect(parseReps('2.5')).toBeNaN()
    expect(parseReps('')).toBeNull()
  })
})
