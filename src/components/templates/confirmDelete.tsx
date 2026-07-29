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

export function ConfirmDelete({
  open,
  name,
  requireTyping,
  confirmLabel,
  onConfirm,
  onCancel
}: {
  open: boolean
  name: string
  requireTyping: boolean
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
}) {
  const templatesT = useTranslations('Templates')
  const [typed, setTyped] = useState('')

  const blocked = requireTyping && typed !== name

  const confirm = () => {
    // re-checked here so the gate survives losing the disabled attribute
    if (blocked) return
    onConfirm()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{confirmLabel}</DialogTitle>
          <DialogDescription>
            <span className="font-mono break-all">{name}</span>
          </DialogDescription>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          {templatesT('confirmDeleteTemplate')}
        </p>
        {requireTyping && (
          <div className="space-y-2">
            <Label htmlFor="confirm-delete-name">
              {templatesT('typeNameToConfirm')}
            </Label>
            <Input
              id="confirm-delete-name"
              className="font-mono"
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
            />
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            {templatesT('cancel')}
          </Button>
          <Button variant="destructive" onClick={confirm} disabled={blocked}>
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
