import { describe, expect, test } from 'vitest'
import { isSafeSegment, isSafeTemplatePath } from '../lib/templatePath'
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

describe('isSafeTemplatePath', () => {
  test('accepts the paths the file browser actually produces', () => {
    for (const path of [
      '',
      'server.properties',
      'plugins/foo.jar',
      'a/b/c.yml',
      'plugins/My Plugin/config.yml',
      '.gitignore',
      'world/region/r.0.0.mca',
      'a..b/c',
      '...',
      'plugins/My%20Plugin/config.yml'
    ]) {
      expect(isSafeTemplatePath(path)).toBe(true)
    }
  })

  test('rejects absolute paths', () => {
    expect(isSafeTemplatePath('/etc/passwd')).toBe(false)
    expect(isSafeTemplatePath('\\etc\\passwd')).toBe(false)
    expect(isSafeTemplatePath('C:/Windows/System32')).toBe(false)
    expect(isSafeTemplatePath('c:file')).toBe(false)
  })

  test('rejects dot and dot-dot segments', () => {
    expect(isSafeTemplatePath('..')).toBe(false)
    expect(isSafeTemplatePath('.')).toBe(false)
    expect(isSafeTemplatePath('../../../etc/passwd')).toBe(false)
    expect(isSafeTemplatePath('plugins/../../secrets')).toBe(false)
    expect(isSafeTemplatePath('plugins/./foo.jar')).toBe(false)
    expect(isSafeTemplatePath('plugins/foo/..')).toBe(false)
  })

  test('rejects backslashes anywhere', () => {
    expect(isSafeTemplatePath('plugins\\foo.jar')).toBe(false)
    expect(isSafeTemplatePath('..\\..\\etc')).toBe(false)
  })

  test('rejects NUL, CR and LF', () => {
    expect(isSafeTemplatePath('foo\0.jar')).toBe(false)
    expect(isSafeTemplatePath('foo\r\nX-Injected: 1')).toBe(false)
    expect(isSafeTemplatePath('foo\n')).toBe(false)
  })

  test('rejects the percent-encoded forms of all of that', () => {
    expect(isSafeTemplatePath('%2e%2e%2fetc%2fpasswd')).toBe(false)
    expect(isSafeTemplatePath('..%2f..%2fetc')).toBe(false)
    expect(isSafeTemplatePath('plugins%2F%2E%2E%2Fsecrets')).toBe(false)
    expect(isSafeTemplatePath('%2Fetc%2Fpasswd')).toBe(false)
    expect(isSafeTemplatePath('plugins%5Cfoo.jar')).toBe(false)
    expect(isSafeTemplatePath('foo%00.jar')).toBe(false)
    expect(isSafeTemplatePath('foo%0d%0aX-Injected:%201')).toBe(false)
    expect(isSafeTemplatePath('%43%3a%2fWindows')).toBe(false)
  })

  test('rejects a malformed percent sequence rather than passing it through', () => {
    expect(isSafeTemplatePath('%')).toBe(false)
    expect(isSafeTemplatePath('foo%zz')).toBe(false)
    expect(isSafeTemplatePath('foo%2')).toBe(false)
    expect(isSafeTemplatePath('%c0%af')).toBe(false)
  })

  // CloudNet decodes the query string once, so after one decode this is a
  // literal file name rather than a traversal
  test('a doubly encoded sequence stays a name', () => {
    expect(isSafeTemplatePath('%252e%252e%252f')).toBe(true)
  })
})

describe('isSafeSegment', () => {
  test('accepts a plain storage, prefix or template name', () => {
    for (const segment of ['local', 'Lobby', 'global', 'my-template_1']) {
      expect(isSafeSegment(segment)).toBe(true)
    }
  })

  test('rejects an empty segment', () => {
    expect(isSafeSegment('')).toBe(false)
  })

  test('rejects a segment holding a separator, raw or encoded', () => {
    expect(isSafeSegment('a/b')).toBe(false)
    expect(isSafeSegment('a%2Fb')).toBe(false)
    expect(isSafeSegment('a\\b')).toBe(false)
    expect(isSafeSegment('y%2F..%2Fetc')).toBe(false)
  })

  test('rejects dot segments and control characters', () => {
    expect(isSafeSegment('.')).toBe(false)
    expect(isSafeSegment('..')).toBe(false)
    expect(isSafeSegment('%2e%2e')).toBe(false)
    expect(isSafeSegment('a\0b')).toBe(false)
    expect(isSafeSegment('a\rb')).toBe(false)
  })

  test('caps the length', () => {
    expect(isSafeSegment('a'.repeat(255))).toBe(true)
    expect(isSafeSegment('a'.repeat(256))).toBe(false)
  })
})
