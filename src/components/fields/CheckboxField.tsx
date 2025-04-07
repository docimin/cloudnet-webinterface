import React from 'react'
import {
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
} from '@/components/ui/form'
import { Checkbox } from '@/components/ui/checkbox'
import { Info } from 'lucide-react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

interface CheckboxFieldProps {
  label: string
  description: string
  field: any
}

const CheckboxField: React.FC<CheckboxFieldProps> = ({
  label,
  description,
  field,
}) => {
  return (
    <FormItem>
      <div className="flex flex-col gap-3">
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
