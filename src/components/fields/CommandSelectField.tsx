import React from 'react'
import {
  FormControl,
  FormLabel,
  FormMessage,
  FormItem,
} from '@/components/ui/form'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import {
  Command,
  CommandInput,
  CommandList,
  CommandItem,
  CommandGroup,
} from '@/components/ui/command'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Check, ChevronsUpDown, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CommandSelectFieldProps {
  label: string
  description: string
  options: { value: string; label: string }[]
  field: {
    value: string[]
    onChange: (value: string[]) => void
  }
}

const CommandSelectField: React.FC<CommandSelectFieldProps> = ({
  label,
  description,
  options,
  field,
}) => {
  return (
    <FormItem>
      <div className="flex flex-col gap-3">
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[300px] justify-between">
                {field.value.length > 0
                  ? `${field.value.length} languages selected`
                  : 'Select languages...'}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput
                  placeholder="Search options..."
                  className={'focus:ring-0 focus:border-0 border-0'}
                />
                <CommandList>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        onSelect={() => {
                          const newValue = field.value.includes(option.value)
                            ? field.value.filter(
                                (value) => value !== option.value
                              )
                            : [...field.value, option.value]
                          field.onChange(newValue)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            field.value.includes(option.value)
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </FormControl>
        <FormMessage />
      </div>
    </FormItem>
  )
}

export default CommandSelectField
