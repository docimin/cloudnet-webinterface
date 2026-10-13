import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import {
  ACCENT_PRESETS,
  contrast,
  formatHsl,
  type Hsl,
  hexToHsl,
  PALETTES,
  parseHsl,
  WORST_SURFACE
} from '@/lib/appearance'

const css = fs
  .readFileSync(path.join(__dirname, '../../css/globals.css'), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')

// every flat rule, keyed by selector with quotes normalised to double quotes
const rules = new Map<string, Record<string, string>>()
for (const [, head, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
  const selectors = head.split(';').pop() ?? ''
  const declarations = Object.fromEntries(
    [...body.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(([, name, value]) => [
      name,
      value.trim()
    ])
  )
  for (const selector of selectors.split(',')) {
    const key = selector.trim().replace(/'/g, '"')
    rules.set(key, { ...rules.get(key), ...declarations })
  }
}

const rule = (selector: string) => {
  const found = rules.get(selector)
  if (!found) throw new Error(`no rule for ${selector}`)
  return found
}

type Mode = 'light' | 'dark'
const MODES: Mode[] = ['light', 'dark']
const COMBINATIONS = PALETTES.flatMap((palette) =>
  MODES.map((mode) => [palette, mode] as const)
)

const HSL = /^-?[\d.]+ [\d.]+% [\d.]+%$/
const colourTokens = Object.keys(rule(':root'))
  .filter((name) => HSL.test(rule(':root')[name]) && name !== 'scrim')
  .sort()

function tokens(palette: string, mode: Mode, ...layers: string[]) {
  const dark = mode === 'dark'
  const merged: Record<string, string> = {
    ...rule(':root'),
    ...(dark ? rule('.dark') : {})
  }
  if (palette !== 'default') {
    Object.assign(merged, rule(`[data-palette="${palette}"]`))
    if (dark) Object.assign(merged, rule(`[data-palette="${palette}"].dark`))
  }
  for (const layer of layers) {
    Object.assign(merged, rule(layer))
    if (dark) Object.assign(merged, rule(`${layer}.dark`))
  }
  return merged
}

const ratio = (t: Record<string, string>, a: string, b: string) =>
  contrast(parseHsl(t[a]), parseHsl(t[b]))

const STATUS = [
  'status-running',
  'status-starting',
  'status-stopped',
  'status-error',
  'status-draining'
]
const TEXT: [string, string][] = [
  ['foreground', 'background'],
  ['card-foreground', 'card'],
  ['popover-foreground', 'popover'],
  ['muted-foreground', 'background'],
  ['muted-foreground', 'card'],
  ['muted-foreground', 'muted'],
  ['primary-foreground', 'primary'],
  ['destructive-foreground', 'destructive'],
  ['console-foreground', 'console'],
  ['log-info', 'console'],
  ['log-warn', 'console'],
  ['log-error', 'console'],
  ...['destructive', 'load-high', 'load-critical', ...STATUS].flatMap(
    (token): [string, string][] => [
      [token, 'background'],
      [token, 'card']
    ]
  )
]
// an accent is drawn on the page, on cards and on muted rows and nav items
const ACCENT_SURFACES = ['background', 'card', 'muted']
const UI: [string, string][] = [
  ...['primary', 'ring'].flatMap((token) =>
    ACCENT_SURFACES.map((surface): [string, string] => [token, surface])
  ),
  ['accent-bar', 'card'],
  ['accent-bar', 'muted']
]

const threshold = (a: string, b: string) =>
  TEXT.some(([x, y]) => x === a && y === b) ? 4.5 : 3

// today's light muted text, load-high, status and destructive colours fall
// short of 4.5:1, the dark destructive red too, and the sky accent bar of 3:1
// on the light surfaces; they are kept so the default look does not change, and
// the colour-blind set and the accent presets are the way out
const EXEMPT = new Set([
  'default light accent-bar/card',
  'default light accent-bar/muted',
  'default light muted-foreground/muted',
  'default light load-high/background',
  'default light load-high/card',
  'default light status-running/background',
  'default light status-running/card',
  'default light status-starting/background',
  'default light status-starting/card',
  'default light status-error/background',
  'default light status-error/card',
  'default light status-draining/background',
  'default light status-draining/card',
  'default light destructive/background',
  'default light destructive/card',
  'default light destructive-foreground/destructive',
  'default dark destructive/background',
  'default dark destructive/card'
])

describe.each(PALETTES)('palette %s', (palette) => {
  test.each(MODES)('%s mode meets the contrast thresholds', (mode) => {
    const t = tokens(palette, mode)
    const failures = [
      ...TEXT.filter(([a, b]) => ratio(t, a, b) < 4.5),
      ...UI.filter(([a, b]) => ratio(t, a, b) < 3)
    ]
      .map(([a, b]) => `${palette} ${mode} ${a}/${b}`)
      .filter((pair) => !EXEMPT.has(pair))
    expect(failures).toEqual([])
  })

  if (palette !== 'default') {
    test('light and dark define every colour token', () => {
      expect(Object.keys(rule(`[data-palette="${palette}"]`)).sort()).toEqual(
        colourTokens
      )
      expect(
        Object.keys(rule(`[data-palette="${palette}"].dark`)).sort()
      ).toEqual(colourTokens)
    })
  }
})

test('the default exemptions are still needed', () => {
  for (const entry of EXEMPT) {
    const [, mode, pair] = entry.split(' ')
    const [a, b] = pair.split('/')
    expect(ratio(tokens('default', mode as Mode), a, b)).toBeLessThan(
      threshold(a, b)
    )
  }
})

// hover:bg-destructive/90 is composited over the surface the button sits on
const HOVER_EXEMPT = new Set(['default light'])
const HOVER_ALPHA = 0.9

function channels([h, s, l]: Hsl) {
  const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
  const k = (n: number) => (n + h / 30) % 12
  return [0, 8, 4].map(
    (n) => l / 100 - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1))
  )
}

function hoverRatio(t: Record<string, string>, surface: string) {
  const under = channels(parseHsl(t[surface]))
  const hex = channels(parseHsl(t.destructive))
    .map((c, i) => HOVER_ALPHA * c + (1 - HOVER_ALPHA) * under[i])
    .map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, '0')
    )
    .join('')
  return contrast(parseHsl(t['destructive-foreground']), hexToHsl(`#${hex}`))
}

test.each(COMBINATIONS)(
  'the destructive button hover on %s in %s mode',
  (palette, mode) => {
    const t = tokens(palette, mode)
    const lowest = Math.min(
      ...['background', 'card'].map((surface) => hoverRatio(t, surface))
    )
    if (HOVER_EXEMPT.has(`${palette} ${mode}`)) {
      expect(lowest).toBeLessThan(4.5)
    } else {
      expect(lowest).toBeGreaterThanOrEqual(4.5)
    }
  }
)

describe.each(ACCENT_PRESETS)('accent %s', (accent) => {
  test.each(COMBINATIONS)('on %s in %s mode', (palette, mode) => {
    const t = tokens(palette, mode, `[data-accent="${accent}"]`)
    expect(ratio(t, 'primary-foreground', 'primary')).toBeGreaterThanOrEqual(
      4.5
    )
    for (const surface of ACCENT_SURFACES) {
      expect(ratio(t, 'primary', surface)).toBeGreaterThanOrEqual(3)
      expect(ratio(t, 'ring', surface)).toBeGreaterThanOrEqual(3)
    }
  })
})

test.each(COMBINATIONS)(
  'the colour-blind status set on %s in %s mode',
  (palette, mode) => {
    const t = tokens(palette, mode, '[data-status="color-blind"]')
    for (const status of STATUS) {
      expect(ratio(t, status, 'background')).toBeGreaterThanOrEqual(4.5)
      expect(ratio(t, status, 'card')).toBeGreaterThanOrEqual(4.5)
    }
  }
)

test('the custom accent worst cases match the palettes', () => {
  // contrast against black grows with luminance
  const brightness = (token: string) => contrast(parseHsl(token), [0, 0, 0])
  const surfaces = (mode: Mode) =>
    PALETTES.flatMap((palette) => {
      const t = tokens(palette, mode)
      return ACCENT_SURFACES.map((surface) => t[surface])
    })
  const light = surfaces('light').sort(
    (a, b) => brightness(a) - brightness(b)
  )[0]
  const dark = surfaces('dark').sort((a, b) => brightness(b) - brightness(a))[0]
  expect({
    light: formatHsl(parseHsl(light)),
    dark: formatHsl(parseHsl(dark))
  }).toEqual(WORST_SURFACE)
})

test('radius steps exist and the derived radii never go negative', () => {
  expect(rule('[data-radius="none"]').radius).toBe('0rem')
  expect(rule('[data-radius="small"]').radius).toBe('0.25rem')
  expect(rule('[data-radius="medium"]').radius).toBe('0.5rem')
  expect(rule('[data-radius="large"]').radius).toBe('0.75rem')
  expect(css).toContain('--radius-md: max(0px, calc(var(--radius) - 2px));')
  expect(css).toContain('--radius-sm: max(0px, calc(var(--radius) - 4px));')
})

test('the defaults are reachable by attribute for nested previews', () => {
  const colours = (selector: string) =>
    Object.fromEntries(colourTokens.map((name) => [name, rule(selector)[name]]))
  expect(colours('[data-palette="default"]')).toEqual(colours(':root'))
  expect(colours('[data-palette="default"].dark')).toEqual(colours('.dark'))
  // radius is its own layer: a nested default preview must not reset it
  expect(rule('[data-palette="default"]').radius).toBeUndefined()
})
