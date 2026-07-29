import { useTranslations } from 'gt-tanstack-start'
import { Info } from 'lucide-react'
import type React from 'react'
import {
  Controller,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues
} from 'react-hook-form'
import MultipleSelector, {
  type Option
} from '@/components/ui/custom/multi-select'
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

interface MultiSelectFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  label: string
  description: string
  options: Option[]
  field: ControllerRenderProps<T, N>
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

const MultiSelectField = <T extends FieldValues, N extends FieldPath<T>>({
  label,
  description,
  options,
  field,
  placeholder,
  maxSelected,
  onMaxSelected,
  groupBy,
  emptyIndicator,
  defaultOptions,
  loadingIndicator,
  disabled,
  className
}: MultiSelectFieldProps<T, N>) => {
  const mainT = useTranslations('Main')

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
        <Controller
          name={field.name}
          render={({ field: controllerField }) => (
            <MultipleSelector
              value={controllerField.value || []}
              onChange={controllerField.onChange}
              options={options}
              placeholder={placeholder ?? mainT('selectOptions')}
              maxSelected={maxSelected}
              onMaxSelected={onMaxSelected}
              groupBy={groupBy}
              emptyIndicator={
                emptyIndicator ?? (
                  <p className="text-center text-lg leading-10">
                    {mainT('noResults')}
                  </p>
                )
              }
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
