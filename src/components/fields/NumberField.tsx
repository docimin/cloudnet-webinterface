import React from 'react'
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Info } from 'lucide-react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

interface NumberFieldProps {
  label: string
  description: string
  placeholder: string
  field: {
    value: number
    onChange: (value: any) => void
  }
}

const NumberField: React.FC<NumberFieldProps> = ({
  label,
  description,
  placeholder,
  field,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value)
    if (!isNaN(value)) {
      field.onChange(value) // Directly update the form value
    } else if (e.target.value === '') {
      field.onChange(0) // Optionally clear the field value
    }
  }

  return (
    <FormItem className={'pb-2'}>
      <FormLabel>
        {label}
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
      <FormControl>
        <Input
          placeholder={placeholder}
          value={field.value === 0 ? '' : field.value} // Display empty string if value is 0
          onChange={handleChange}
          type={'number'}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export default NumberField
