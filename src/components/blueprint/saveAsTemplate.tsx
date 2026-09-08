import * as Sentry from '@sentry/tanstackstart-react'
import { useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { SaveIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { serviceSaveAsTemplate } from '@/server/service'
import { storageList } from '@/server/templates'
import { STEP_KEYS } from './steps'

const DEFAULT_STORAGE = 'local'
const DEFAULT_NAME = 'snapshot'

// kept in step with the server validator in src/server/service.ts
const SEGMENT = /^[^/\\]+$/

export default function SaveAsTemplate({
  serviceId,
  taskName
}: {
  serviceId: string
  taskName: string
}) {
  const blueprintT = useTranslations('Blueprint')
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [storages, setStorages] = useState([DEFAULT_STORAGE])
  const [storage, setStorage] = useState(DEFAULT_STORAGE)
  const [prefix, setPrefix] = useState(taskName)
  const [name, setName] = useState(DEFAULT_NAME)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    let active = true
    storageList()
      .then((result) => {
        if (!active) return
        setStorages([
          ...new Set([DEFAULT_STORAGE, ...(result?.storages ?? [])])
        ])
      })
      .catch((error) => {
        // the default storage stays selectable, so a failed list is not fatal
        Sentry.captureException(error)
      })
    return () => {
      active = false
    }
  }, [open])

  const submit = async () => {
    if (!SEGMENT.test(prefix.trim()) || !SEGMENT.test(name.trim())) {
      toast.error(blueprintT('invalidTemplateName'))
      return
    }
    setSaving(true)
    try {
      const result = await serviceSaveAsTemplate({
        data: {
          id: serviceId,
          storage,
          prefix: prefix.trim(),
          name: name.trim()
        }
      })
      if (!result.ok) {
        toast.error(
          blueprintT('stepFailed', {
            step: blueprintT(STEP_KEYS[result.step]),
            message: result.message
          })
        )
        return
      }
      toast.success(
        blueprintT('saved', {
          template: `${storage}:${prefix.trim()}/${name.trim()}`
        })
      )
      setOpen(false)
      router.invalidate()
    } catch (error) {
      Sentry.captureException(error)
      toast.error(blueprintT('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <SaveIcon className="mr-2 size-4" />
        {blueprintT('saveAsTemplate')}
      </Button>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!saving) setOpen(next)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{blueprintT('saveAsTemplateTitle')}</DialogTitle>
            <DialogDescription>
              {blueprintT('saveAsTemplateDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="save-template-storage">
                {blueprintT('storage')}
              </Label>
              <Select value={storage} onValueChange={setStorage}>
                <SelectTrigger id="save-template-storage" className="font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {storages.map((entry) => (
                    <SelectItem key={entry} value={entry} className="font-mono">
                      {entry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="save-template-prefix">
                {blueprintT('prefix')}
              </Label>
              <Input
                id="save-template-prefix"
                className="font-mono"
                value={prefix}
                onChange={(event) => setPrefix(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="save-template-name">{blueprintT('name')}</Label>
              <Input
                id="save-template-name"
                className="font-mono"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => setOpen(false)}
            >
              {blueprintT('cancel')}
            </Button>
            <Button
              disabled={saving || !prefix.trim() || !name.trim()}
              onClick={submit}
            >
              {blueprintT('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
