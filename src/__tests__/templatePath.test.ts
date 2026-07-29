import { describe, expect, test } from 'vitest'
import { query } from '../server/cloudnet'

describe('query', () => {
  test('encodes spaces and special characters in a path', () => {
    expect(query({ path: 'plugins/My Plugin/config.yml' })).toBe(
      '?path=plugins%2FMy+Plugin%2Fconfig.yml'
    )
  })

  test('omits absent values rather than sending empty ones', () => {
    expect(query({ path: 'a', deep: undefined })).toBe('?path=a')
  })

  test('serialises booleans and keeps an intentionally empty value', () => {
    expect(query({ directory: '', deep: true })).toBe('?directory=&deep=true')
  })
})
