import { useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { PlusIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import { type PaletteItem, paletteIndex } from '@/server/search'

const ROUTES = {
  service: '/{-$locale}/dashboard/services/$serviceId',
  task: '/{-$locale}/dashboard/tasks/$taskId',
  group: '/{-$locale}/dashboard/groups/$groupId',
  node: '/{-$locale}/dashboard/nodes/$nodeId',
  createService: '/{-$locale}/dashboard/services/create'
} as const

const GROUPS = [
  ['service', 'services'],
  ['task', 'tasks'],
  ['group', 'groups'],
  ['node', 'nodes']
] as const

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<PaletteItem[]>([])
  const [canCreateService, setCanCreateService] = useState(false)
  const navigate = useNavigate()
  const paletteT = useTranslations('Palette')
  const servicesT = useTranslations('Services')
  // Depend on the resolved string, not paletteT: its identity changes every
  // render and would re-fire the fetch effect in a loop.
  const loadError = paletteT('error')

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((previous) => !previous)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    paletteIndex()
      .then((result) => {
        setItems(result.items)
        setCanCreateService(result.canCreateService)
      })
      .catch(() => toast.error(loadError))
  }, [open, loadError])

  const select = (item: PaletteItem) => {
    setOpen(false)
    switch (item.type) {
      case 'service':
        navigate({ to: ROUTES.service, params: { serviceId: item.id } })
        return
      case 'task':
        navigate({ to: ROUTES.task, params: { taskId: item.id } })
        return
      case 'group':
        navigate({ to: ROUTES.group, params: { groupId: item.id } })
        return
      case 'node':
        navigate({ to: ROUTES.node, params: { nodeId: item.id } })
        return
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={setOpen} title={paletteT('title')}>
      <CommandInput placeholder={paletteT('placeholder')} />
      <CommandList>
        <CommandEmpty>{paletteT('empty')}</CommandEmpty>
        {canCreateService && (
          <CommandGroup>
            <CommandItem
              value="action:createService"
              keywords={[servicesT('createService')]}
              onSelect={() => {
                setOpen(false)
                navigate({ to: ROUTES.createService })
              }}
            >
              <PlusIcon className="mr-2 size-4" />
              <span className="text-sm">{servicesT('createService')}</span>
            </CommandItem>
          </CommandGroup>
        )}
        {GROUPS.map(([type, labelKey]) => {
          const group = items.filter((item) => item.type === type)
          if (!group.length) return null
          return (
            <CommandGroup key={type} heading={paletteT(labelKey)}>
              {group.map((item) => (
                <CommandItem
                  key={`${item.type}:${item.id}`}
                  // Names collide across types (a task and its group share a
                  // name); cmdk keys selection off value, so it must be unique.
                  value={`${item.type}:${item.id}`}
                  keywords={
                    item.sublabel ? [item.label, item.sublabel] : [item.label]
                  }
                  onSelect={() => select(item)}
                >
                  <span className="font-mono text-sm">{item.label}</span>
                  {item.sublabel && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      {item.sublabel}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )
        })}
      </CommandList>
    </CommandDialog>
  )
}
