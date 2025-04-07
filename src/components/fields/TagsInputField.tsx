import React from 'react'
import { FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Info, XIcon } from 'lucide-react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface TagInputFieldProps {
  label: string
  description: string
  placeholder: string
  field: any
  error?: any
  maxLength?: number
}

const TagsInputField: React.FC<TagInputFieldProps> = ({
  label,
  description,
  placeholder,
  field,
  error,
  maxLength,
}) => {
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
    <>
      <FormItem>
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
          <span className="text-sm text-red-500 dark:text-red-900">
            {error.message}
          </span>
        )}
      </FormItem>
    </>
  )
}

export default TagsInputField
