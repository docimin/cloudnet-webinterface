import type { ReactNode } from 'react'
import {
  type Accent,
  isHex,
  type Palette,
  type Radius,
  type StatusSet
} from '@/lib/appearance'
import { cn } from '@/lib/utils'

// Theme tokens are keyed on data attributes that work on any element, so a
// preview re-scopes every token inside it without a single inline style. It
// always states its own palette and mode, because a light preview has to stay
// light on a dark page.
export function Scope({
  palette,
  dark,
  accent,
  radius,
  status,
  className,
  children
}: {
  palette: Palette
  dark: boolean
  accent?: Accent
  radius?: Radius
  status?: StatusSet
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      data-palette={palette}
      data-accent={
        accent === undefined || accent === 'palette'
          ? undefined
          : isHex(accent)
            ? 'custom'
            : accent
      }
      data-radius={radius}
      data-status={status === 'palette' ? undefined : status}
      className={cn(dark && 'dark', 'bg-background text-foreground', className)}
    >
      {children}
    </div>
  )
}
