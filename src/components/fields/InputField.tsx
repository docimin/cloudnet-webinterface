import React from 'react'
import {
  FormControl,
  FormLabel,
  FormMessage,
  FormItem
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Info } from 'lucide-react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'

interface InputFieldProps {
  label: string
  description: string
  placeholder: string
  field: any
  type?: string
  maxLength?: number
  className?: string
  disabled?: boolean
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  description,
  placeholder,
  field,
  type = 'text',
  maxLength,
  className,
  disabled
}) => {
  return (
    <FormItem className={className}>
      {label && (
        <FormLabel>
          {label || 'Label'}
          {description && (
            <HoverCard openDelay={100} closeDelay={50}>
              <HoverCardTrigger>
                <span className="ml-2 text-gray-500">
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
