import { useTranslations } from 'gt-tanstack-start'
import { Check, ChevronsUpDown, Info } from 'lucide-react'
import React from 'react'
import {
  Controller,
  type ControllerRenderProps,
  type FieldPath,
  type FieldValues
} from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
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

interface ComboBoxFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  label: string
  description: string
  options: { value: string; label: string }[]
  field: ControllerRenderProps<T, N>
}

const ComboBoxField = <T extends FieldValues, N extends FieldPath<T>>({
  label,
  description,
  options,
  field
}: ComboBoxFieldProps<T, N>) => {
  const mainT = useTranslations('Main')
  const [open, setOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState<string>(
    field.value || ''
  )

  const handleSelect = (currentValue: string) => {
    const newValue = currentValue === selectedValue ? '' : currentValue
    setSelectedValue(newValue)
    field.onChange(newValue)
    setOpen(false)
  }

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
          <Controller
            name={field.name}
            render={() => (
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-50 justify-between"
                  >
                    {selectedValue
                      ? options.find((option) => option.value === selectedValue)
                          ?.label
                      : mainT('selectOption')}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-50 p-0">
                  <Command>
                    <CommandInput
                      placeholder={mainT('search')}
                      className={'focus:ring-0 focus:border-0'}
                    />
                    <CommandList>
                      <CommandEmpty>{mainT('noResults')}</CommandEmpty>
                      <CommandGroup>
                        {options.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => handleSelect(option.value)}
                          >
                            {option.label}
                            <Check
                              className={cn(
                                'ml-auto',
                                selectedValue === option.value
                                  ? 'opacity-100'
                                  : 'opacity-0'
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            )}
          />
        </FormControl>
      </div>
      <FormMessage />
    </FormItem>
  )
}

export default ComboBoxField
