import { useTranslations } from 'gt-tanstack-start'
import { Info } from 'lucide-react'
import {
  Controller,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

interface SelectFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  label: string
  description: string
  options: { value: string; label: string }[]
  field: ControllerRenderProps<T, N>
}

const SelectField = <T extends FieldValues, N extends FieldPath<T>>({
  label,
  description,
  options,
  field
}: SelectFieldProps<T, N>) => {
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
            <Select
              value={
                Array.isArray(controllerField.value)
                  ? ''
                  : controllerField.value || ''
              }
              onValueChange={controllerField.onChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={mainT('selectOption')} />
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
