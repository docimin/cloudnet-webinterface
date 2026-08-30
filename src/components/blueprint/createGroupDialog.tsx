'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'
import { groupApi } from '@/lib/client-api'

export default function CreateGroupDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [envs, setEnvs] = useState('MINECRAFT_SERVER')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(name)) {
      toast.error('Group name must be alphanumeric')
      return
    }
    setBusy(true)
    try {
      const body = {
        name,
        jvmOptions: [],
        processParameters: [],
        environmentVariables: {},
        targetEnvironments: envs.split(',').map(x => x.trim()).filter(Boolean),
        templates: [],
        deployments: [],
        includes: [],
        properties: {}
      }
      const res: any = await groupApi.update(body)
      if ((res.status ?? 0) >= 400) {
        toast.error(`Failed: HTTP ${res.status}`)
      } else {
        toast.success(`Group ${name} created`)
        setOpen(false)
        setName('')
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
        <Button>
          <PlusIcon className="h-4 w-4 mr-2" /> New group
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new group</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1">
            <Label htmlFor="gname">Name</Label>
            <Input id="gname" value={name} onChange={(e) => setName(e.target.value)} placeholder="MyGroup" />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="genv">Target environments (comma-separated)</Label>
            <Input id="genv" value={envs} onChange={(e) => setEnvs(e.target.value)} placeholder="MINECRAFT_SERVER" />
            <p className="text-xs text-muted-foreground">
              Common values: <code>MINECRAFT_SERVER</code>, <code>VELOCITY</code>, <code>BUNGEECORD</code>. Leave blank to keep the group manual-only.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !name}>{busy ? 'Creating…' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
