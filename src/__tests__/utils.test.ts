import { formatBytes } from '../components/formatBytes'
import { formatDate } from '../components/formatDate'

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