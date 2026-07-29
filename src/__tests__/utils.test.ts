import { formatBytes } from '../components/formatBytes'
import { formatDate } from '../components/formatDate'
import { cn } from '../lib/utils'

describe('formatBytes', () => {
  test('formats bytes correctly', () => {
    expect(formatBytes(0)).toBe('0 Bytes')
    expect(formatBytes(1024)).toBe('1 KB')
    expect(formatBytes(1048576)).toBe('1 MB')
    expect(formatBytes(1073741824)).toBe('1 GB')
  })

  test('handles decimals correctly', () => {
    expect(formatBytes(1536, 1)).toBe('1.5 KB')
    expect(formatBytes(1536, 0)).toBe('2 KB')
  })

  test('handles negative numbers', () => {
    expect(formatBytes(-100)).toBe('0 Bytes')
  })
})

describe('formatDate', () => {
  test('formats date correctly', () => {
    const testDate = new Date('2023-12-25T15:30:00')
    expect(formatDate(testDate)).toBe('25.12.2023 @ 15:30')
  })

  test('pads single digits correctly', () => {
    const testDate = new Date('2023-01-05T09:05:00')
    expect(formatDate(testDate)).toBe('05.01.2023 @ 09:05')
  })
})

describe('cn', () => {
  test('keeps custom text sizes from eating the text colour', () => {
    expect(cn('text-muted-foreground', 'text-caption')).toBe(
      'text-muted-foreground text-caption'
    )
    expect(cn('text-muted-foreground', 'text-status-code')).toBe(
      'text-muted-foreground text-status-code'
    )
  })

  test('still treats them as font sizes', () => {
    expect(cn('text-xs', 'text-caption')).toBe('text-caption')
    expect(cn('text-caption', 'text-status-code')).toBe('text-status-code')
  })

  test('still merges plain conflicts', () => {
    expect(cn('text-red-500', 'text-muted-foreground')).toBe(
      'text-muted-foreground'
    )
  })
})
