import { useTranslations } from 'gt-tanstack-start'
import { Info, PlusIcon, XIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { FormItem, FormLabel } from '@/components/ui/form'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { TemplateEntry } from './templateEntry'

interface Row {
  id: string
  template: TemplateEntry
  priorityText: string
}

interface TemplateListFieldProps {
  label: string
  description: string
  field: {
    value: TemplateEntry[]
    onChange: (value: TemplateEntry[]) => void
  }
}

const TemplateListField = ({
  label,
  description,
  field
}: TemplateListFieldProps) => {
  const editorsT = useTranslations('Editors')
  const nextId = useRef(0)
  const [rows, setRows] = useState<Row[]>(() =>
    (field.value ?? []).map((template) => ({
      id: String(nextId.current++),
      template,
      priorityText: String(template.priority ?? 0)
    }))
  )

  const emit = (next: Row[]) => {
    setRows(next)
    field.onChange(next.map((row) => row.template))
  }

  const patch = (id: string, changes: Partial<TemplateEntry>) =>
    emit(
      rows.map((row) =>
        row.id === id
          ? { ...row, template: { ...row.template, ...changes } }
          : row
      )
    )

  const patchPriority = (id: string, text: string) => {
    const parsed = Number.parseInt(text, 10)
    emit(
      rows.map((row) =>
        row.id === id
          ? {
              ...row,
              priorityText: text,
              template: {
                ...row.template,
                priority: Number.isNaN(parsed) ? 0 : parsed
              }
            }
          : row
      )
    )
  }

  const add = () =>
    emit([
      ...rows,
      {
        id: String(nextId.current++),
        priorityText: '0',
        template: {
          storage: 'local',
          prefix: '',
          name: '',
          priority: 0,
          alwaysCopyToStaticServices: false
        }
      }
    ])

  return (
    <FormItem>
      <FormLabel>
        {label}
        {description && (
          <HoverCard openDelay={100} closeDelay={50}>
            <HoverCardTrigger>
              <span className="ml-2 text-muted-foreground">
                <Info className="inline-block h-4 w-4" />
              </span>
            </HoverCardTrigger>
            <HoverCardContent>{description}</HoverCardContent>
          </HoverCard>
        )}
      </FormLabel>
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.id} className="rounded-md border p-3">
            <div className="grid gap-2 sm:grid-cols-4">
              <Input
                className="font-mono"
                placeholder={editorsT('storagePlaceholder')}
                value={row.template.storage}
                onChange={(event) =>
                  patch(row.id, { storage: event.target.value })
                }
              />
              <Input
                className="font-mono"
                placeholder={editorsT('prefixPlaceholder')}
                value={row.template.prefix}
                onChange={(event) =>
                  patch(row.id, { prefix: event.target.value })
                }
              />
              <Input
                className="font-mono"
                placeholder={editorsT('namePlaceholder')}
                value={row.template.name}
                onChange={(event) =>
                  patch(row.id, { name: event.target.value })
                }
              />
              <Input
                className="font-mono tabular-nums"
                inputMode="numeric"
                placeholder={editorsT('priorityPlaceholder')}
                value={row.priorityText}
                onChange={(event) => patchPriority(row.id, event.target.value)}
              />
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`template-copy-${row.id}`}
                  checked={row.template.alwaysCopyToStaticServices}
                  onCheckedChange={(value) =>
                    patch(row.id, {
                      alwaysCopyToStaticServices: value === true
                    })
                  }
                />
                <Label htmlFor={`template-copy-${row.id}`}>
                  {editorsT('alwaysCopyToStaticServices')}
                </Label>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={editorsT('removeTemplate')}
                onClick={() =>
                  emit(rows.filter((entry) => entry.id !== row.id))
                }
              >
                <XIcon className="size-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={add}>
          <PlusIcon className="mr-2 size-4" />
          {editorsT('addTemplate')}
        </Button>
      </div>
    </FormItem>
  )
}

export default TemplateListField
