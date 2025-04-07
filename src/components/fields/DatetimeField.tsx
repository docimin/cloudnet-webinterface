import React from 'react'
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { CalendarIcon, Info } from 'lucide-react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Button } from '../ui/button'
import { Calendar } from '../ui/calendar'
import { format } from 'date-fns'

interface DatetimeFieldProps {
  label: string
  description: string
  field: any
  fromYear?: number
  toYear?: number
  captionLayout?: 'buttons' | 'dropdown' | 'dropdown-buttons'
  mode?: 'default' | 'multiple' | 'range' | 'single'
}

const DatetimeField: React.FC<DatetimeFieldProps> = ({
  label,
  description,
  field,
  fromYear,
  toYear,
  captionLayout,
  mode = 'single',
}) => {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
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
      <FormControl>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="min-w-[100px] w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {field.value ? (
                format(new Date(field.value), 'PPP')
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode={mode}
              selected={field.value ? new Date(field.value) : undefined}
              // @ts-expect-error
              onSelect={field.value ? new Date(field.value) : undefined}
              initialFocus
              fromYear={fromYear}
              toYear={toYear}
              captionLayout={captionLayout}
            />
          </PopoverContent>
        </Popover>
      </FormControl>
      <FormMessage />
    </FormItem>
  )
}

export default DatetimeField
