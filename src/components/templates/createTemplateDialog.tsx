'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { templateStorageApi } from '@/lib/client-api'
import { PlusIcon } from 'lucide-react'

export default function CreateTemplateDialog({
  storage,
  prefix
}: {
  storage?: string
  prefix?: string
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [s, setS] = useState(storage || 'local')
  const [p, setP] = useState(prefix || '')
  const [n, setN] = useState('default')

  const submit = async () => {
    if (!s || !p || !n) {
      toast.error('Storage, prefix and name required')
      return
    }
    setBusy(true)
    try {
      const res = await templateStorageApi.createTemplate(s, p, n)
      if (res.status && res.status >= 400) {
        toast.error(`Failed (${res.status})`)
      } else {
        toast.success(`Template ${p}/${n} created`)
        setOpen(false)
        router.refresh()
        router.push(`/dashboard/templates/${s}/${p}/${n}`)
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
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" />
          New template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create template</DialogTitle>
          <DialogDescription>
            Creates an empty template at <code>{s}/{p}/{n}</code>.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1">
            <Label htmlFor="tpl-storage">Storage</Label>
            <Input
              id="tpl-storage"
              value={s}
              disabled={!!storage}
              onChange={(e) => setS(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="tpl-prefix">Prefix (task/group name)</Label>
            <Input
              id="tpl-prefix"
              value={p}
              disabled={!!prefix}
              placeholder="Lobby"
              onChange={(e) => setP(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="tpl-name">Name</Label>
            <Input
              id="tpl-name"
              value={n}
              placeholder="default"
              onChange={(e) => setN(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={busy}>
            {busy ? 'Creating…' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
