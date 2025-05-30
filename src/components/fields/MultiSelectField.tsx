import React from 'react'
import {
  FormControl,
  FormLabel,
  FormMessage,
  FormItem
} from '@/components/ui/form'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { Info } from 'lucide-react'
import { Controller } from 'react-hook-form'
import MultipleSelector, { Option } from '@/components/ui/custom/multi-select'

interface MultiSelectFieldProps {
  label: string
  description: string
  options: Option[]
  field: any
  placeholder?: string
  maxSelected?: number
  onMaxSelected?: (maxLimit: number) => void
  groupBy?: string
  emptyIndicator?: React.ReactNode
  defaultOptions?: Option[]
  loadingIndicator?: React.ReactNode
  disabled?: boolean
  className?: string
}

const defaultEmptyIndicator = (
  <p className="text-center text-lg leading-10">No results found.</p>
)

const MultiSelectField: React.FC<MultiSelectFieldProps> = ({
  label,
  description,
  options,
  field,
  placeholder = 'Select options',
  maxSelected,
  onMaxSelected,
  groupBy,
  emptyIndicator = defaultEmptyIndicator,
  defaultOptions,
  loadingIndicator,
  disabled,
  className
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
            <MultipleSelector
              value={controllerField.value || []}
              onChange={controllerField.onChange}
              options={options}
              placeholder={placeholder}
              maxSelected={maxSelected}
              onMaxSelected={onMaxSelected}
              groupBy={groupBy}
              emptyIndicator={emptyIndicator}
              defaultOptions={defaultOptions}
              loadingIndicator={loadingIndicator}
              disabled={disabled}
              className={className}
            />
          )}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export default MultiSelectField
