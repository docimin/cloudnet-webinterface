import { GlobeIcon, Info } from 'lucide-react'
import type React from 'react'
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

interface TextareaFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  label: string
  description: string
  placeholder: string
  field: ControllerRenderProps<T, N>
  resizable?: boolean
  rightIcon?: React.ReactNode
}

const TextareaField = <T extends FieldValues, N extends FieldPath<T>>({
  label,
  description,
  placeholder,
  field,
  resizable
}: TextareaFieldProps<T, N>) => {
  return (
    <FormItem>
      <div className={'flex items-center justify-between'}>
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
        <GlobeIcon className="h-4 w-4" />
      </div>
      <FormControl>
        <Textarea
          placeholder={placeholder}
          value={field.value || ''}
          onChange={(e) => field.onChange(e.target.value)}
          className={`${resizable ? null : 'resize-none'}`}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export default TextareaField
