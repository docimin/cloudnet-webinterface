import { describe, expect, test } from 'vitest'
import { EDITOR_MAX_BYTES, fileKind, language } from '../lib/fileKind'

describe('fileKind', () => {
  test('treats known config and text extensions as editable', () => {
    for (const name of [
      'server.properties',
      'config.yml',
      'bukkit.yaml',
      'ops.json',
      'notes.txt',
      'start.sh',
      'pom.xml',
      'app.toml',
      'server.conf'
    ]) {
      expect(fileKind(name, 100)).toBe('text')
    }
  })

  test('treats unknown and archive extensions as binary', () => {
    for (const name of [
      'EssentialsX.jar',
      'region.mca',
      'icon.png',
      'world.zip'
    ]) {
      expect(fileKind(name, 100)).toBe('binary')
    }
  })

  test('refuses text files above the editor ceiling', () => {
    expect(fileKind('huge.yml', EDITOR_MAX_BYTES + 1)).toBe('too-large')
    expect(fileKind('huge.yml', EDITOR_MAX_BYTES)).toBe('text')
  })

  test('a binary file stays binary regardless of size', () => {
    expect(fileKind('big.jar', EDITOR_MAX_BYTES + 1)).toBe('binary')
  })

  test('extension matching is case-insensitive', () => {
    expect(fileKind('CONFIG.YML', 10)).toBe('text')
  })

  test('a file with no extension is treated as text', () => {
    expect(fileKind('README', 10)).toBe('text')
  })

  test('dotfiles are text, not an extension named after themselves', () => {
    expect(fileKind('.gitignore', 10)).toBe('text')
    expect(fileKind('.env', 10)).toBe('text')
    expect(fileKind('.config.yml', 10)).toBe('text')
  })

  test('maps extensions to a highlighting language', () => {
    expect(language('config.yml')).toBe('yaml')
    expect(language('ops.json')).toBe('json')
    expect(language('server.properties')).toBe('properties')
    expect(language('mystery.xyz')).toBe('text')
    expect(language('.gitignore')).toBe('text')
  })
})
