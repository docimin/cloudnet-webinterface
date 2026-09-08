import { Info } from 'lucide-react'
import { useState } from 'react'
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues
} from 'react-hook-form'
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { Textarea } from '@/components/ui/textarea'

interface JsonFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  label: string
  description: string
  field: ControllerRenderProps<T, N>
}

const JsonField = <T extends FieldValues, N extends FieldPath<T>>({
  label,
  description,
  field
}: JsonFieldProps<T, N>) => {
  const [text, setText] = useState(() =>
    JSON.stringify(field.value ?? [], null, 2)
  )

  // an unparseable draft clears the value so the schema blocks the save instead
  // of posting whatever happened to parse last
  const handleChange = (value: string) => {
    setText(value)
    try {
      field.onChange(JSON.parse(value))
    } catch {
      field.onChange(undefined)
    }
  }

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
      <FormControl>
        <Textarea
          spellCheck={false}
          className="min-h-32 resize-y font-mono text-xs"
          value={text}
          onChange={(event) => handleChange(event.target.value)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export default JsonField
