import * as Sentry from '@sentry/tanstackstart-react'
import { useTranslations } from 'gt-tanstack-start'
import { useTheme } from 'next-themes'
import { type ReactNode, useEffect, useId, useRef, useState } from 'react'
import { toast } from 'sonner'
import { type Status, StatusIndicator } from '@/components/status'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ACCENT_PRESETS,
  type Accent,
  type Appearance,
  applyAppearance,
  type HexColour,
  isHex,
  type Overrides,
  PALETTE_NAMES,
  PALETTES,
  RADII,
  resolveAppearance,
  STATUS_SETS
} from '@/lib/appearance'
import { cn } from '@/lib/utils'
import { AppearancePreview } from './appearancePreview'
import { Scope } from './scope'

const STATUSES: Status[] = [
  'running',
  'starting',
  'stopped',
  'error',
  'draining'
]

const MODE_LABEL = {
  light: 'themeLight',
  dark: 'themeDark',
  system: 'themeSystem'
} as const

const ACCENT_LABEL = {
  blue: 'accentBlue',
  violet: 'accentViolet',
  green: 'accentGreen',
  orange: 'accentOrange',
  pink: 'accentPink',
  red: 'accentRed',
  amber: 'accentAmber',
  teal: 'accentTeal'
} as const

const RADIUS_LABEL = {
  none: 'radiusNone',
  small: 'radiusSmall',
  medium: 'radiusMedium',
  large: 'radiusLarge'
} as const

const STATUS_LABEL = {
  palette: 'statusPalette',
  'color-blind': 'statusColorBlind'
} as const

const DEFAULT_HEX = '#3b82f6'

const hexFor = (accent: Accent) => (isHex(accent) ? accent : DEFAULT_HEX)

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Option({
  label,
  selected,
  isDefault,
  onSelect,
  children
}: {
  label: string
  selected: boolean
  isDefault: boolean
  onSelect: () => void
  children?: ReactNode
}) {
  const appearanceT = useTranslations('Appearance')
  const markerId = useId()

  return (
    <button
      type="button"
      aria-label={label}
      aria-describedby={isDefault ? markerId : undefined}
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border p-2 text-sm transition-colors hover:bg-accent',
        selected && 'ring-2 ring-ring'
      )}
    >
      {children}
      <span>{label}</span>
      {isDefault && (
        <span id={markerId} className="text-xs text-muted-foreground">
          {appearanceT('instanceDefault')}
        </span>
      )}
    </button>
  )
}

export function AppearanceSettings({
  host,
  user,
  save,
  reset
}: {
  host: Overrides
  user: Overrides
  save: (next: Overrides) => Promise<unknown>
  reset: () => Promise<unknown>
}) {
  const appearanceT = useTranslations('Appearance')
  const mainT = useTranslations('Main')
  const statusT = useTranslations('Status')
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [overrides, setOverrides] = useState<Overrides>(user)
  const [hex, setHex] = useState<string>(() =>
    hexFor(resolveAppearance(host, user).accent)
  )
  const hexErrorId = useId()
  // next-themes only knows the theme in the browser, so anything that depends
  // on it waits for the first client render or it would not match the server
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const current = resolveAppearance(host, overrides)
  const instance = resolveAppearance(host, {})
  const dark = mounted && resolvedTheme === 'dark'
  const mode = mounted ? theme : undefined

  const confirmed = useRef({ id: 0, overrides: user })
  const latestCommit = useRef(0)
  const pending = useRef(0)

  // the page lays itself out twice, so a save made in the other instance only
  // reaches this one through the loader. A result that arrives while a commit
  // is in flight predates that choice and must not overwrite it
  const userKey = JSON.stringify(user)
  useEffect(() => {
    if (pending.current > 0) return
    const saved: Overrides = JSON.parse(userKey)
    confirmed.current = { id: latestCommit.current, overrides: saved }
    setOverrides(saved)
  }, [userKey])

  const commit = async (next: Overrides, persist: () => Promise<unknown>) => {
    const id = ++latestCommit.current
    pending.current++
    applyAppearance(document.documentElement, resolveAppearance(host, next))
    setOverrides(next)
    try {
      await persist()
      // saves can resolve out of order, and an older one must not rewind this
      if (id >= confirmed.current.id)
        confirmed.current = { id, overrides: next }
      return true
    } catch (error) {
      Sentry.captureException(error)
      // an older failure must not undo what a newer click already put on screen
      if (id === latestCommit.current) {
        applyAppearance(
          document.documentElement,
          resolveAppearance(host, confirmed.current.overrides)
        )
        setOverrides(confirmed.current.overrides)
      }
      toast.error(appearanceT('saveFailed'))
      return false
    } finally {
      pending.current--
    }
  }

  const resetAll = async () => {
    if (await commit({}, reset)) setHex(hexFor(instance.accent))
  }

  const choose = <K extends keyof Appearance>(key: K, value: Appearance[K]) => {
    if (value === current[key]) return
    const next: Overrides = { ...overrides }
    // following the instance default means no override, so a later change by
    // the host still reaches this person
    if (value === instance[key]) delete next[key]
    else next[key] = value
    return commit(next, () => save(next))
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="flex flex-col gap-8 lg:col-span-2">
        <p className="text-sm text-muted-foreground">
          {appearanceT('description')}
        </p>

        <Section title={appearanceT('mode')}>
          <div className="flex flex-wrap gap-2">
            {(['light', 'dark', 'system'] as const).map((option) => (
              <Button
                key={option}
                variant={mode === option ? 'default' : 'outline'}
                aria-pressed={mode === option}
                onClick={() => setTheme(option)}
              >
                {mainT(MODE_LABEL[option])}
              </Button>
            ))}
          </div>
        </Section>

        <Section title={appearanceT('accent')}>
          <div className="flex flex-wrap gap-2">
            <Option
              label={appearanceT('accentPalette')}
              selected={current.accent === 'palette'}
              isDefault={instance.accent === 'palette'}
              onSelect={() => choose('accent', 'palette')}
            >
              <Scope
                palette={current.palette}
                dark={dark}
                className="size-8 rounded-full bg-primary"
              />
            </Option>
            {ACCENT_PRESETS.map((preset) => (
              <Option
                key={preset}
                label={appearanceT(ACCENT_LABEL[preset])}
                selected={current.accent === preset}
                isDefault={instance.accent === preset}
                onSelect={() => choose('accent', preset)}
              >
                <Scope
                  palette={current.palette}
                  dark={dark}
                  accent={preset}
                  className="size-8 rounded-full bg-primary"
                />
              </Option>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="color"
              aria-label={appearanceT('customColour')}
              value={isHex(hex) ? hex.toLowerCase() : '#000000'}
              onChange={(event) => setHex(event.target.value)}
              className={cn(
                'h-10 w-14 cursor-pointer rounded-md border bg-background',
                isHex(current.accent) && 'ring-2 ring-ring'
              )}
            />
            <Input
              aria-label={appearanceT('customHex')}
              aria-invalid={!isHex(hex)}
              aria-describedby={isHex(hex) ? undefined : hexErrorId}
              value={hex}
              onChange={(event) => setHex(event.target.value.trim())}
              className="w-32 font-mono"
            />
            <Button
              disabled={!isHex(hex)}
              onClick={() => choose('accent', hex.toLowerCase() as HexColour)}
            >
              {appearanceT('useColour')}
            </Button>
          </div>
          {!isHex(hex) && (
            <p id={hexErrorId} className="text-sm text-destructive">
              {appearanceT('hexInvalid')}
            </p>
          )}
        </Section>

        <Section title={appearanceT('palette')}>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {PALETTES.map((palette) => (
              <Option
                key={palette}
                label={
                  palette === 'default'
                    ? appearanceT('paletteDefault')
                    : PALETTE_NAMES[palette]
                }
                selected={current.palette === palette}
                isDefault={instance.palette === palette}
                onSelect={() => choose('palette', palette)}
              >
                <div className="grid w-full grid-cols-2 gap-1">
                  {[false, true].map((isDark) => (
                    <Scope
                      key={String(isDark)}
                      palette={palette}
                      dark={isDark}
                      className="flex flex-col gap-1 rounded-md border p-2"
                    >
                      <span className="h-2 w-3/4 rounded-sm bg-foreground" />
                      <span className="h-2 w-1/2 rounded-sm bg-muted-foreground" />
                      <span className="mt-1 h-3 w-1/2 rounded-sm bg-primary" />
                      <span className="flex gap-1">
                        <span className="size-2 rounded-full bg-status-running" />
                        <span className="size-2 rounded-full bg-status-starting" />
                        <span className="size-2 rounded-full bg-status-error" />
                      </span>
                    </Scope>
                  ))}
                </div>
              </Option>
            ))}
          </div>
        </Section>

        <Section title={appearanceT('radius')}>
          <div className="flex flex-wrap gap-2">
            {RADII.map((radius) => (
              <Option
                key={radius}
                label={appearanceT(RADIUS_LABEL[radius])}
                selected={current.radius === radius}
                isDefault={instance.radius === radius}
                onSelect={() => choose('radius', radius)}
              >
                <Scope
                  palette={current.palette}
                  dark={dark}
                  accent={current.accent}
                  radius={radius}
                  className="size-10 rounded-lg border-2 border-primary"
                />
              </Option>
            ))}
          </div>
        </Section>

        <Section title={appearanceT('status')}>
          <div className="flex flex-wrap gap-2">
            {STATUS_SETS.map((set) => (
              <Option
                key={set}
                label={appearanceT(STATUS_LABEL[set])}
                selected={current.status === set}
                isDefault={instance.status === set}
                onSelect={() => choose('status', set)}
              >
                <Scope
                  palette={current.palette}
                  dark={dark}
                  status={set}
                  className="flex gap-3 rounded-md p-2"
                >
                  {STATUSES.map((status) => (
                    <StatusIndicator
                      key={status}
                      status={status}
                      label={statusT(status)}
                    />
                  ))}
                </Scope>
              </Option>
            ))}
          </div>
        </Section>

        <div>
          <Button variant="outline" onClick={resetAll}>
            {appearanceT('reset')}
          </Button>
        </div>
      </div>

      <aside className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold">{appearanceT('preview')}</h2>
        <AppearancePreview />
      </aside>
    </div>
  )
}
