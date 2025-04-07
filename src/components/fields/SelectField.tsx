import React from 'react'
import {
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Info } from 'lucide-react'
import { Controller } from 'react-hook-form'

interface SelectFieldProps {
  label: string
  description: string
  options: { value: string; label: string }[]
  field: any
}

const SelectField: React.FC<SelectFieldProps> = ({
  label,
  description,
  options,
  field,
}) => {
  return (
    <FormItem>
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
        <Controller
          control={field.control}
          name={field.name}
          render={({ field: controllerField }) => (
            <Select
              value={
                Array.isArray(controllerField.value)
                  ? ''
                  : controllerField.value || ''
              }
              onValueChange={controllerField.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export default SelectField
