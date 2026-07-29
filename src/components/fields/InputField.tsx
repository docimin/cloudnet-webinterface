import { Info } from 'lucide-react'
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
import { Input } from '@/components/ui/input'

interface InputFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  label: string
  description: string
  placeholder: string
  field: ControllerRenderProps<T, N>
  type?: string
  maxLength?: number
  className?: string
  disabled?: boolean
}

const InputField = <T extends FieldValues, N extends FieldPath<T>>({
  label,
  description,
  placeholder,
  field,
  type = 'text',
  maxLength,
  className,
  disabled
}: InputFieldProps<T, N>) => {
  return (
    <FormItem className={className}>
      {label && (
        <FormLabel>
          {label || 'Label'}
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
      )}
      <FormControl>
        <Input
          type={type}
          placeholder={placeholder}
          value={field.value} // Bind the value directly from `field.value`
          onChange={field.onChange} // Use `field.onChange` directly
          maxLength={maxLength}
          disabled={disabled}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export default InputField
