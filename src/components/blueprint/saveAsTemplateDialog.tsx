'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { SaveIcon } from 'lucide-react'
import { serviceCreateApi } from '@/lib/client-api'

export default function SaveAsTemplateDialog({ serviceId, serviceName }: { serviceId: string; serviceName?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [prefix, setPrefix] = useState(serviceName?.split('-')[0] || '')
  const [name, setName] = useState('snapshot')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!prefix || !name) { toast.error('Prefix and name required'); return }
    setBusy(true)
    try {
      const res: any = await serviceCreateApi.saveAsTemplate(serviceId, prefix, name)
      if ((res.status ?? 0) >= 400) {
        toast.error(`Failed at step "${res.step ?? '?'}": HTTP ${res.status}`)
      } else {
        toast.success(`Saved to local/${prefix}/${name}`)
        setOpen(false)
        router.refresh()
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <SaveIcon className="h-4 w-4 mr-2" /> Save as template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save current runtime as a template</DialogTitle>
          <DialogDescription>
            Captures the current files of this service into a new template. On a live service, the snapshot is what's on disk *right now* — some plugins buffer writes, save/flush first if needed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1">
            <Label>Storage</Label>
            <Input value="local" disabled />
          </div>
          <div className="grid gap-1">
            <Label>Prefix</Label>
            <Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Skyblock" />
          </div>
          <div className="grid gap-1">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="snapshot" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !prefix || !name}>{busy ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
