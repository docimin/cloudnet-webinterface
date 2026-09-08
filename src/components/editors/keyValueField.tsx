import { useTranslations } from 'gt-tanstack-start'
import { Info, PlusIcon, XIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { FormItem, FormLabel } from '@/components/ui/form'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'

interface Row {
  id: string
  key: string
  value: string
}

interface KeyValueFieldProps {
  label: string
  description: string
  field: {
    value: Record<string, string>
    onChange: (value: Record<string, string>) => void
  }
}

const KeyValueField = ({ label, description, field }: KeyValueFieldProps) => {
  const editorsT = useTranslations('Editors')
  const nextId = useRef(0)
  // rows keep their identity while a key is being typed; collapsing straight to
  // an object would merge two half-typed keys into one entry
  const [rows, setRows] = useState<Row[]>(() =>
    Object.entries(field.value ?? {}).map(([key, value]) => ({
      id: String(nextId.current++),
      key,
      value
    }))
  )

  const emit = (next: Row[]) => {
    setRows(next)
    field.onChange(
      Object.fromEntries(
        next.filter((row) => row.key !== '').map((row) => [row.key, row.value])
      )
    )
  }

  const patch = (id: string, changes: Partial<Row>) =>
    emit(rows.map((row) => (row.id === id ? { ...row, ...changes } : row)))

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
          <div key={row.id} className="flex items-center gap-2">
            <Input
              className="font-mono"
              placeholder={editorsT('keyPlaceholder')}
              value={row.key}
              onChange={(event) => patch(row.id, { key: event.target.value })}
            />
            <Input
              className="font-mono"
              placeholder={editorsT('valuePlaceholder')}
              value={row.value}
              onChange={(event) => patch(row.id, { value: event.target.value })}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={editorsT('removeVariable')}
              onClick={() => emit(rows.filter((entry) => entry.id !== row.id))}
            >
              <XIcon className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            emit([
              ...rows,
              { id: String(nextId.current++), key: '', value: '' }
            ])
          }
        >
          <PlusIcon className="mr-2 size-4" />
          {editorsT('addVariable')}
        </Button>
      </div>
    </FormItem>
  )
}

export default KeyValueField
