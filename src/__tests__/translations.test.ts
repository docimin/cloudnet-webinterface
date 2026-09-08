import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'

const ROOT = path.join(__dirname, '../..')
const LOCALES = ['en', 'de', 'nl'] as const

const messages = Object.fromEntries(
  LOCALES.map((l) => [
    l,
    JSON.parse(
      fs.readFileSync(path.join(ROOT, 'messages', `${l}.json`), 'utf8')
    )
  ])
)

function sourceFiles(dir: string, acc: string[] = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.name === 'node_modules') continue
    if (entry.isDirectory()) sourceFiles(full, acc)
    else if (/\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name))
      acc.push(full)
  }
  return acc
}

function referencedIds() {
  const ids = new Map<string, string>()
  // t(someVariable) hides the key from the scanner, so the whole namespace has
  // to be present instead
  const dynamicNamespaces = new Map<string, string>()
  for (const file of sourceFiles(path.join(ROOT, 'src'))) {
    const source = fs.readFileSync(file, 'utf8')
    const namespaces: Record<string, string> = {}
    for (const m of source.matchAll(
      /(?:const|let)\s+(\w+)\s*=\s*(?:await\s+)?(?:use|get)Translations\(\s*(?:'([^']*)')?\s*\)/g
    )) {
      namespaces[m[1]] = m[2] ?? ''
    }
    for (const [variable, namespace] of Object.entries(namespaces)) {
      const calls = new RegExp(`\\b${variable}(?:\\.obj)?\\(\\s*'([^']+)'`, 'g')
      for (const m of source.matchAll(calls)) {
        ids.set(namespace ? `${namespace}.${m[1]}` : m[1], file)
      }
      if (!namespace) continue
      const dynamic = new RegExp(
        `\\b${variable}(?:\\.obj)?\\(\\s*[A-Za-z_$]`,
        'g'
      )
      if (dynamic.test(source)) dynamicNamespaces.set(namespace, file)
    }
  }
  return { ids, dynamicNamespaces }
}

const lookup = (obj: unknown, id: string) =>
  id
    .split('.')
    .reduce<unknown>(
      (o, k) => (o == null ? undefined : (o as Record<string, unknown>)[k]),
      obj
    )

const flatten = (obj: unknown, prefix = '', acc: string[] = []) => {
  if (obj == null || typeof obj !== 'object') return acc
  for (const [key, value] of Object.entries(obj)) {
    const id = prefix ? `${prefix}.${key}` : key
    if (value && typeof value === 'object') flatten(value, id, acc)
    else acc.push(id)
  }
  return acc
}

// gt-tanstack-start 11 throws on an unknown dictionary id where gt-next 6 degraded
// quietly, so a typo'd key is a crashed page rather than odd-looking copy.
describe('translation keys', () => {
  const { ids, dynamicNamespaces } = referencedIds()

  test('every referenced id exists in every locale', () => {
    const missing: string[] = []
    for (const [id, file] of ids) {
      for (const locale of LOCALES) {
        if (lookup(messages[locale], id) === undefined) {
          missing.push(`${locale}: ${id} (${path.relative(ROOT, file)})`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  test('every namespace read through a variable is complete', () => {
    const missing: string[] = []
    for (const [namespace, file] of dynamicNamespaces) {
      const where = path.relative(ROOT, file)
      const entries = LOCALES.map((locale) =>
        lookup(messages[locale], namespace)
      )
      const keys = new Set(entries.flatMap((entry) => flatten(entry)))

      LOCALES.forEach((locale, index) => {
        const entry = entries[index]
        if (entry == null || typeof entry !== 'object') {
          missing.push(`${locale}: ${namespace} (${where})`)
          return
        }
        for (const key of keys) {
          if (lookup(entry, key) === undefined) {
            missing.push(`${locale}: ${namespace}.${key} (${where})`)
          }
        }
      })
    }
    expect(missing).toEqual([])
  })

  test('finds a meaningful number of ids', () => {
    expect(ids.size).toBeGreaterThan(50)
    expect(dynamicNamespaces.size).toBeGreaterThan(0)
  })
})
