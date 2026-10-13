import { beforeEach, describe, expect, test } from 'vitest'
import {
  ACCENT_STYLE_ID,
  accentStylesheet,
  accentTokens,
  appearanceAttributes,
  applyAppearance,
  BUILT_IN,
  contrast,
  formatHsl,
  type HexColour,
  hexToHsl,
  isHex,
  parseHostDefaults,
  parseHsl,
  parseOverrides,
  resolveAppearance,
  WORST_SURFACE
} from '@/lib/appearance'

describe('hex colours', () => {
  test('accepts six-digit hex in either case and nothing else', () => {
    expect(isHex('#3b82f6')).toBe(true)
    expect(isHex('#3B82F6')).toBe(true)
    for (const bad of [
      '3b82f6',
      '#3b82f',
      '#3b82f6a',
      '#fff',
      '#zzzzzz',
      'red',
      '',
      '#3b82f6;}'
    ]) {
      expect(isHex(bad)).toBe(false)
    }
  })

  test('converts to hsl', () => {
    expect(formatHsl(hexToHsl('#ffffff'))).toBe('0 0% 100%')
    expect(formatHsl(hexToHsl('#000000'))).toBe('0 0% 0%')
    expect(formatHsl(hexToHsl('#3b82f6'))).toBe('217 91.2% 59.8%')
    expect(formatHsl(hexToHsl('#ef4444'))).toBe('0 84.2% 60.2%')
  })

  test('round-trips through the token format', () => {
    expect(formatHsl(parseHsl('240 5.9% 10%'))).toBe('240 5.9% 10%')
  })
})

describe('contrast', () => {
  test('matches the WCAG reference values', () => {
    expect(contrast([0, 0, 100], [0, 0, 0])).toBeCloseTo(21, 5)
    expect(contrast([0, 0, 100], [0, 0, 100])).toBeCloseTo(1, 5)
    // #767676 on white is the classic 4.54:1 grey
    expect(contrast(hexToHsl('#767676'), [0, 0, 100])).toBeCloseTo(4.54, 2)
  })
})

describe('overrides from the cookie', () => {
  test('keeps valid fields and drops the rest one by one', () => {
    expect(
      parseOverrides(
        JSON.stringify({
          palette: 'nord',
          accent: '#3B82F6',
          radius: 'huge',
          status: 42
        })
      )
    ).toEqual({ palette: 'nord', accent: '#3b82f6' })
  })

  test('treats missing, malformed or non-object cookies as no overrides', () => {
    for (const raw of [undefined, '', 'not json', '"nord"', '[]', 'null']) {
      expect(parseOverrides(raw)).toEqual({})
    }
  })

  test('never lets a forged accent through', () => {
    expect(
      parseOverrides(JSON.stringify({ accent: 'red;}body{display:none' }))
    ).toEqual({})
  })
})

describe('host defaults', () => {
  test('reads the four variables', () => {
    expect(
      parseHostDefaults({
        THEME_PALETTE: 'gruvbox',
        THEME_ACCENT: 'teal',
        THEME_RADIUS: 'none',
        THEME_STATUS_COLORS: 'color-blind'
      })
    ).toEqual({
      palette: 'gruvbox',
      accent: 'teal',
      radius: 'none',
      status: 'color-blind'
    })
  })

  test('ignores unset and empty variables', () => {
    expect(parseHostDefaults({ THEME_PALETTE: '' })).toEqual({})
    expect(parseHostDefaults({})).toEqual({})
  })

  test('throws with the variable name and the valid values on a typo', () => {
    expect(() => parseHostDefaults({ THEME_PALETTE: 'nrod' })).toThrow(
      /THEME_PALETTE="nrod".*catppuccin/
    )
    expect(() => parseHostDefaults({ THEME_ACCENT: 'reddish' })).toThrow(
      /THEME_ACCENT/
    )
  })
})

describe('resolution', () => {
  test('person beats host beats built-in, field by field', () => {
    expect(
      resolveAppearance(
        { palette: 'nord', radius: 'large' },
        { palette: 'gruvbox' }
      )
    ).toEqual({ ...BUILT_IN, palette: 'gruvbox', radius: 'large' })
  })

  test('a person choosing the palette accent beats a custom host accent', () => {
    expect(
      resolveAppearance({ accent: '#ff5500' }, { accent: 'palette' }).accent
    ).toBe('palette')
  })

  test('with nothing set the look is the built-in one', () => {
    expect(resolveAppearance({}, {})).toEqual(BUILT_IN)
  })
})

describe('custom accent', () => {
  const surface = {
    light: parseHsl(WORST_SURFACE.light),
    dark: parseHsl(WORST_SURFACE.dark)
  }

  // what the browser paints: the HSL token rounded to 8-bit sRGB
  const painted = ([h, s, l]: readonly [number, number, number]) => {
    const k = (n: number) => (n + h / 30) % 12
    const a = (s / 100) * Math.min(l / 100, 1 - l / 100)
    const channel = (n: number) => {
      const value =
        l / 100 - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
      const byte = Math.round(value * 255) / 255
      return byte <= 0.04045 ? byte / 12.92 : ((byte + 0.055) / 1.055) ** 2.4
    }
    return 0.2126 * channel(0) + 0.7152 * channel(8) + 0.0722 * channel(4)
  }
  const paintedContrast = (
    a: readonly [number, number, number],
    b: readonly [number, number, number]
  ) => {
    const [high, low] = [painted(a), painted(b)].sort((x, y) => y - x)
    return (high + 0.05) / (low + 0.05)
  }

  const assertReadable = (hex: HexColour) => {
    const tokens = accentTokens(hex)
    for (const mode of ['light', 'dark'] as const) {
      const primary = parseHsl(tokens[mode].primary)
      expect(contrast(primary, surface[mode])).toBeGreaterThanOrEqual(3)
      expect(paintedContrast(primary, surface[mode])).toBeGreaterThanOrEqual(3)
      expect(
        contrast(parseHsl(tokens[mode]['primary-foreground']), primary)
      ).toBeGreaterThanOrEqual(4.5)
      expect(tokens[mode].ring).toBe(tokens[mode].primary)
      expect(tokens[mode]['accent-bar']).toBe(tokens[mode].primary)
    }
  }

  test('the extremes clear the worst surface and keep their text readable', () => {
    for (const hex of ['#000000', '#ffffff', '#ffff00', '#00ffff'] as const) {
      assertReadable(hex)
    }
  })

  test('every colour clears the worst surface and keeps its text readable', () => {
    let seed = 1
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }
    for (let i = 0; i < 2000; i++) {
      const value = Math.floor(random() * 0x1000000)
      assertReadable(`#${value.toString(16).padStart(6, '0')}`)
    }
  })

  test('keeps the hue', () => {
    expect(parseHsl(accentTokens('#ffff00').light.primary)[0]).toBe(60)
  })

  test('the stylesheet carries only computed numbers and no quotes', () => {
    const css = accentStylesheet('#3b82f6')
    expect(css).not.toContain('#')
    expect(css).not.toMatch(/["'<&]/)
    expect(css).toMatch(
      /^\[data-accent=custom\] \{ --primary: \d+ [\d.]+% [\d.]+%;/
    )
    expect(css).toContain('[data-accent=custom].dark {')
  })
})

describe('html attributes', () => {
  const root = document.documentElement

  beforeEach(() => {
    document.head.innerHTML = `<style id="${ACCENT_STYLE_ID}"></style>`
    for (const name of [
      'data-palette',
      'data-accent',
      'data-radius',
      'data-status'
    ]) {
      root.removeAttribute(name)
    }
  })

  test('the built-in look sets no attributes', () => {
    expect(
      Object.values(appearanceAttributes(BUILT_IN)).every(
        (value) => value === undefined
      )
    ).toBe(true)
  })

  test('a hex accent is marked custom', () => {
    expect(
      appearanceAttributes({ ...BUILT_IN, accent: '#3b82f6' })['data-accent']
    ).toBe('custom')
  })

  test('applying sets and clears attributes and the accent stylesheet', () => {
    applyAppearance(root, {
      palette: 'nord',
      accent: '#3b82f6',
      radius: 'large',
      status: 'color-blind'
    })
    expect(root.getAttribute('data-palette')).toBe('nord')
    expect(root.getAttribute('data-accent')).toBe('custom')
    expect(root.getAttribute('data-radius')).toBe('large')
    expect(root.getAttribute('data-status')).toBe('color-blind')
    expect(document.getElementById(ACCENT_STYLE_ID)?.textContent).toContain(
      '--primary'
    )

    applyAppearance(root, BUILT_IN)
    for (const name of [
      'data-palette',
      'data-accent',
      'data-radius',
      'data-status'
    ]) {
      expect(root.hasAttribute(name)).toBe(false)
    }
    expect(document.getElementById(ACCENT_STYLE_ID)?.textContent).toBe('')
  })

  test('applying without the accent stylesheet in the document throws', () => {
    document.head.innerHTML = ''
    expect(() => applyAppearance(root, BUILT_IN)).toThrow(/appearance-accent/)
  })
})
