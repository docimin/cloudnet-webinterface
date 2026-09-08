import { Info } from 'lucide-react'
import type {
  ControllerRenderProps,
  FieldPath,
  FieldValues
} from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
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

interface CheckboxFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  label: string
  description: string
  field: ControllerRenderProps<T, N>
}

const CheckboxField = <T extends FieldValues, N extends FieldPath<T>>({
  label,
  description,
  field
}: CheckboxFieldProps<T, N>) => {
  return (
    <FormItem>
      <div className="flex flex-col gap-3">
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
        <FormControl>
          <Checkbox
            checked={field.value || false} // Directly use the form value
            onCheckedChange={(e) => field.onChange(e)}
          />
        </FormControl>
        <FormMessage />
      </div>
    </FormItem>
  )
}

export default CheckboxField
