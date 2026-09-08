import { useTranslations } from 'gt-tanstack-start'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function PromptDialog({
  open,
  title,
  description,
  label,
  defaultValue,
  confirmLabel,
  onSubmit,
  onCancel
}: {
  open: boolean
  title: string
  description?: string
  label: string
  defaultValue?: string
  confirmLabel: string
  onSubmit: (value: string) => void
  onCancel: () => void
}) {
  const templatesT = useTranslations('Templates')
  const [value, setValue] = useState(defaultValue ?? '')

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel()
      }}
    >
      {/* an explicit undefined would override the id Radix wires up itself */}
      <DialogContent
        {...(description ? {} : { 'aria-describedby': undefined })}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (value.trim() === '') return
            onSubmit(value)
          }}
        >
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && (
              <DialogDescription>{description}</DialogDescription>
            )}
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="prompt-dialog-value">{label}</Label>
            <Input
              id="prompt-dialog-value"
              className="font-mono"
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onCancel}>
              {templatesT('cancel')}
            </Button>
            <Button type="submit" disabled={value.trim() === ''}>
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
