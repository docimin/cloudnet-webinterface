import { useTranslations } from 'gt-tanstack-start'
import { Check, ChevronsUpDown, Info } from 'lucide-react'
import type React from 'react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
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
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
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
  field
}) => {
  const mainT = useTranslations('Main')

  return (
    <FormItem>
      <div className="flex flex-col gap-3">
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-75 justify-between">
                {field.value.length > 0
                  ? mainT('selectedCount', { count: field.value.length })
                  : mainT('selectOptions')}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-75 p-0">
              <Command>
                <CommandInput
                  placeholder={mainT('search')}
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
