import { Info, XIcon } from 'lucide-react'
import React from 'react'
import type {
  ControllerRenderProps,
  FieldError,
  FieldPath,
  FieldValues
} from 'react-hook-form'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { FormControl, FormItem, FormLabel } from '@/components/ui/form'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'

interface TagInputFieldProps<T extends FieldValues, N extends FieldPath<T>> {
  label: string
  description: string
  placeholder: string
  field: ControllerRenderProps<T, N>
  error?: FieldError
  maxLength?: number
}

const TagsInputField = <T extends FieldValues, N extends FieldPath<T>>({
  label,
  description,
  placeholder,
  field,
  error,
  maxLength
}: TagInputFieldProps<T, N>) => {
  const [inputValue, setInputValue] = React.useState('')

  const updateTags = React.useCallback(
    (newTags: string[]) => {
      field.onChange(newTags)
    },
    [field]
  )

  const addTag = React.useCallback(() => {
    const newTag = inputValue.trim()
    if (newTag && !field.value.includes(newTag)) {
      updateTags([...field.value, newTag])
      setInputValue('')
    }
  }, [inputValue, field.value, updateTags])

  const removeTag = React.useCallback(
    (tagToRemove: string) => {
      updateTags(field.value.filter((tag: string) => tag !== tagToRemove))
    },
    [field.value, updateTags]
  )

  const handleInputKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addTag()
      }
    },
    [addTag]
  )

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
        <FormControl>
          <div className="space-y-2">
            <Input
              placeholder={placeholder}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleInputKeyDown}
              maxLength={maxLength}
            />
            <div className="flex flex-wrap gap-2">
              {field.value.map((tag: string) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-sm py-1 px-2"
                >
                  {tag}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-auto p-0 text-base"
                    onClick={() => removeTag(tag)}
                  >
                    <XIcon className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        </FormControl>
      </FormControl>
      {error && (
        <span className="text-sm text-destructive">{error.message}</span>
      )}
    </FormItem>
  )
}

export default TagsInputField
