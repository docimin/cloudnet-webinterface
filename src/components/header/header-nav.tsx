import { Link, useLocation } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import type { LucideIcon } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import { buttonVariants } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

interface NavProps {
  isCollapsed: boolean
  links: {
    title: string
    label?: string
    icon: LucideIcon
    variant: 'default' | 'ghost'
    href: string
  }[]
  setIsOpen?: Dispatch<SetStateAction<boolean>>
}

export function Nav({ isCollapsed, links, setIsOpen }: NavProps) {
  const { pathname } = useLocation()
  const navigationT = useTranslations('Navigation')

  // pathname keeps the optional locale segment (/nl/dashboard), hrefs never do
  const currentPath = pathname.replace(/^\/(?:en|de|nl)(?=\/|$)/, '')

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link) => {
          const isActive =
            link.title === navigationT('dashboard')
              ? currentPath === link.href.replace(/\/$/, '')
              : currentPath.startsWith(link.href)

          const variant = isActive ? 'default' : 'ghost'
          // every generated route sits under the optional locale segment
          const to = `/{-$locale}${link.href}`

          return isCollapsed ? (
            <Tooltip key={link.href} delayDuration={0}>
              <TooltipTrigger asChild>
                <Link
                  to={to}
                  onClick={() => {
                    if (window.innerWidth <= 768) {
                      // 768px is a common breakpoint for mobile devices
                      setIsOpen?.(false)
                    }
                  }}
                  className={cn(
                    buttonVariants({ variant, size: 'icon' }),
                    'border-l-2 border-l-transparent',
                    isActive && 'border-l-accent-bar',
                    'h-9 w-9',
                    variant === 'default' &&
                      'dark:bg-muted dark:text-muted-foreground dark:hover:bg-muted dark:hover:text-foreground'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="sr-only">{link.title}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="flex items-center gap-4">
                {link.title}
                {link.label && (
                  <span className="ml-auto text-muted-foreground">
                    {link.label}
                  </span>
                )}
              </TooltipContent>
            </Tooltip>
          ) : (
            <Link
              key={link.href}
              to={to}
              onClick={() => {
                if (window.innerWidth <= 768) {
                  // 768px is a common breakpoint for mobile devices
                  setIsOpen?.(false)
                }
              }}
              className={cn(
                buttonVariants({ variant, size: 'sm' }),
                'border-l-2 border-l-transparent',
                isActive && 'border-l-accent-bar',
                variant === 'default' &&
                  'dark:bg-muted dark:text-foreground dark:hover:bg-muted dark:hover:text-foreground',
                'justify-start'
              )}
            >
              <link.icon className="mr-2 h-4 w-4" />
              {link.title}
              {link.label && (
                <span
                  className={cn(
                    'ml-auto',
                    variant === 'default' &&
                      'text-background dark:text-foreground'
                  )}
                >
                  {link.label}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
