import { z } from 'zod'

export const PALETTES = [
  'default',
  'catppuccin',
  'nord',
  'gruvbox',
  'rose-pine',
  'tokyo-night'
] as const
export const ACCENT_PRESETS = [
  'blue',
  'violet',
  'green',
  'orange',
  'pink',
  'red',
  'amber',
  'teal'
] as const
export const RADII = ['none', 'small', 'medium', 'large'] as const
export const STATUS_SETS = ['palette', 'color-blind'] as const

export type Palette = (typeof PALETTES)[number]
export type AccentPreset = (typeof ACCENT_PRESETS)[number]
export type HexColour = `#${string}`
export type Accent = 'palette' | AccentPreset | HexColour
export type Radius = (typeof RADII)[number]
export type StatusSet = (typeof STATUS_SETS)[number]

export type Appearance = {
  palette: Palette
  accent: Accent
  radius: Radius
  status: StatusSet
}

export type Overrides = Partial<Appearance>

export const BUILT_IN: Appearance = {
  palette: 'default',
  accent: 'palette',
  radius: 'medium',
  status: 'palette'
}

export const PALETTE_NAMES: Record<Exclude<Palette, 'default'>, string> = {
  catppuccin: 'Catppuccin',
  nord: 'Nord',
  gruvbox: 'Gruvbox',
  'rose-pine': 'Rosé Pine',
  'tokyo-night': 'Tokyo Night'
}

const HEX = /^#[0-9a-f]{6}$/i

export const isHex = (value: string): value is HexColour => HEX.test(value)

const FIELDS = {
  palette: z.enum(PALETTES),
  accent: z.union([
    z.literal('palette'),
    z.enum(ACCENT_PRESETS),
    z
      .string()
      .regex(HEX)
      .transform((value) => value.toLowerCase() as HexColour)
  ]),
  radius: z.enum(RADII),
  status: z.enum(STATUS_SETS)
}

const KEYS = Object.keys(FIELDS) as (keyof Appearance)[]

export const overridesSchema = z.object({
  palette: FIELDS.palette.optional(),
  accent: FIELDS.accent.optional(),
  radius: FIELDS.radius.optional(),
  status: FIELDS.status.optional()
})

// the cookie comes back from the browser, so any field can be stale or forged;
// a bad field falls back to the host default instead of breaking the page
export function parseOverrides(raw: string | undefined): Overrides {
  if (!raw) return {}
  let data: unknown
  try {
    data = JSON.parse(raw)
  } catch {
    return {}
  }
  if (!data || typeof data !== 'object') return {}
  const record = data as Record<string, unknown>
  const out: Record<string, unknown> = {}
  for (const key of KEYS) {
    const parsed = FIELDS[key].safeParse(record[key])
    if (parsed.success) out[key] = parsed.data
  }
  return out as Overrides
}

const HOST_VARIABLES: Record<keyof Appearance, string> = {
  palette: 'THEME_PALETTE',
  accent: 'THEME_ACCENT',
  radius: 'THEME_RADIUS',
  status: 'THEME_STATUS_COLORS'
}

const ALLOWED: Record<keyof Appearance, string> = {
  palette: PALETTES.join(', '),
  accent: [
    'palette',
    ...ACCENT_PRESETS,
    'or a six-digit hex colour like #3b82f6'
  ].join(', '),
  radius: RADII.join(', '),
  status: STATUS_SETS.join(', ')
}

// a typo here is the host's own configuration, so it fails loudly on the first
// request instead of quietly showing the built-in look
export function parseHostDefaults(
  env: Record<string, string | undefined>
): Overrides {
  const out: Record<string, unknown> = {}
  for (const key of KEYS) {
    const name = HOST_VARIABLES[key]
    const value = env[name]
    if (value === undefined || value === '') continue
    const parsed = FIELDS[key].safeParse(value)
    if (!parsed.success) {
      throw new Error(
        `${name}="${value}" is not valid. Use one of: ${ALLOWED[key]}`
      )
    }
    out[key] = parsed.data
  }
  return out as Overrides
}

export function resolveAppearance(
  host: Overrides,
  user: Overrides
): Appearance {
  const out: Record<string, unknown> = { ...BUILT_IN }
  for (const layer of [host, user]) {
    for (const key of KEYS) {
      if (layer[key] !== undefined) out[key] = layer[key]
    }
  }
  return out as Appearance
}

export type Hsl = readonly [number, number, number]

export function parseHsl(token: string): Hsl {
  const match = /^(-?[\d.]+) ([\d.]+)% ([\d.]+)%$/.exec(token.trim())
  if (!match) throw new Error(`not an HSL token: ${token}`)
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

const tenth = (value: number) => String(Math.round(value * 10) / 10)

export const formatHsl = ([h, s, l]: Hsl) =>
  `${Math.round(h) % 360} ${tenth(s)}% ${tenth(l)}%`

export function hexToHsl(hex: string): Hsl {
  if (!isHex(hex)) throw new Error(`not a hex colour: ${hex}`)
  const [r, g, b] = [1, 3, 5].map(
    (index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255
  )
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l * 100]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  const h =
    max === r
      ? (g - b) / d + (g < b ? 6 : 0)
      : max === g
        ? (b - r) / d + 2
        : (r - g) / d + 4
  return [h * 60, s * 100, l * 100]
}

function hslToRgb([h, s, l]: Hsl): [number, number, number] {
  const saturation = s / 100
  const lightness = l / 100
  const k = (n: number) => (n + h / 30) % 12
  const a = saturation * Math.min(lightness, 1 - lightness)
  const f = (n: number) =>
    lightness - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return [f(0), f(8), f(4)]
}

function luminance(colour: Hsl) {
  const [r, g, b] = hslToRgb(colour).map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  )
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrast(a: Hsl, b: Hsl) {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (high + 0.05) / (low + 0.05)
}

// the darkest light and the lightest dark surface an accent is drawn on (page,
// card and muted) across all palettes; a colour that clears these clears every
// one of them (checked against globals.css)
export const WORST_SURFACE = {
  light: '223 15.9% 82.7%',
  dark: '220 16.8% 31.6%'
} as const

// a little above the 3:1 requirement because browsers round the HSL token to
// 8-bit sRGB, which can shave a few thousandths off the ratio
const ACCENT_CONTRAST = 3.02

const WHITE: Hsl = [0, 0, 100]
const BLACK: Hsl = [0, 0, 0]

export type AccentTokens = Record<
  'primary' | 'primary-foreground' | 'ring' | 'accent-bar',
  string
>

// keeps hue and saturation and walks lightness in tenths, so the value that
// passes is exactly the value that gets printed; black and white always clear
// both worst-case surfaces, so the walk ends before leaving 0..100
function clear(colour: Hsl, against: Hsl, darker: boolean): Hsl {
  const [h, s] = colour
  let tenths = Math.round(colour[2] * 10)
  while (contrast([h, s, tenths / 10], against) < ACCENT_CONTRAST) {
    tenths += darker ? -5 : 5
  }
  return [h, s, tenths / 10]
}

export function accentTokens(
  hex: HexColour
): Record<'light' | 'dark', AccentTokens> {
  const base = parseHsl(formatHsl(hexToHsl(hex)))
  const tokens = (mode: 'light' | 'dark'): AccentTokens => {
    const colour = clear(base, parseHsl(WORST_SURFACE[mode]), mode === 'light')
    // one of pure white and pure black always reaches 4.58:1
    const text =
      contrast(WHITE, colour) >= contrast(BLACK, colour) ? WHITE : BLACK
    const value = formatHsl(colour)
    return {
      primary: value,
      'primary-foreground': formatHsl(text),
      ring: value,
      'accent-bar': value
    }
  }
  return { light: tokens('light'), dark: tokens('dark') }
}

// built only from numbers computed above, never from the raw input, so nothing
// a cookie holds can break out of the rule or end the <style> element
export function accentStylesheet(hex: HexColour) {
  const { light, dark } = accentTokens(hex)
  const body = (tokens: AccentTokens) =>
    Object.entries(tokens)
      .map(([name, value]) => `--${name}: ${value};`)
      .join(' ')
  return `[data-accent=custom] { ${body(light)} } [data-accent=custom].dark { ${body(dark)} }`
}

export const ACCENT_STYLE_ID = 'appearance-accent'

export function appearanceAttributes(appearance: Appearance) {
  const { palette, accent, radius, status } = appearance
  return {
    'data-palette': palette === BUILT_IN.palette ? undefined : palette,
    'data-accent':
      accent === BUILT_IN.accent
        ? undefined
        : isHex(accent)
          ? 'custom'
          : accent,
    'data-radius': radius === BUILT_IN.radius ? undefined : radius,
    'data-status': status === BUILT_IN.status ? undefined : status
  }
}

// React owns <html> and the accent <style>, so this only sets what the next
// render sets anyway; it never adds or removes a node React is tracking
export function applyAppearance(root: HTMLElement, appearance: Appearance) {
  for (const [name, value] of Object.entries(
    appearanceAttributes(appearance)
  )) {
    if (value === undefined) root.removeAttribute(name)
    else root.setAttribute(name, value)
  }
  const style = root.ownerDocument.getElementById(ACCENT_STYLE_ID)
  if (!style) {
    throw new Error(`#${ACCENT_STYLE_ID} is missing from the document`)
  }
  style.textContent = isHex(appearance.accent)
    ? accentStylesheet(appearance.accent)
    : ''
}
