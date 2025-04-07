import React from 'react'
import { Check, ChevronsUpDown, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Controller } from 'react-hook-form'

interface ComboBoxFieldProps {
  label: string
  description: string
  options: { value: string; label: string }[]
  field: any
}

const ComboBoxField: React.FC<ComboBoxFieldProps> = ({
  label,
  description,
  options,
  field,
}) => {
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
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-[200px] justify-between"
                  >
                    {selectedValue
                      ? options.find((option) => option.value === selectedValue)
                          ?.label
                      : 'Select an option...'}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search option..."
                      className={'focus:ring-0 focus:border-0'}
                    />
                    <CommandList>
                      <CommandEmpty>No option found.</CommandEmpty>
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
