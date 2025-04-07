import React from 'react'
import { Input } from '@/components/ui/input'
import { Info } from 'lucide-react'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Label } from '@/components/ui/label'

interface InputFieldProps {
  label: string
  description: string
  placeholder: string
  maxLength?: number
}

const InputFieldNoForm: React.FC<InputFieldProps> = ({
  label,
  description,
  placeholder,
  maxLength,
}) => {
  return (
    <div className={'text-start'}>
      <Label>
        {label || 'No Label'}
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
      </Label>
      <div>
        <Input
          type="text"
          placeholder={placeholder}
          disabled
          maxLength={maxLength}
        />
      </div>
    </div>
  )
}

export default InputFieldNoForm
