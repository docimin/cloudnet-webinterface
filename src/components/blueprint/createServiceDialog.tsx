'use client'
import { useEffect, useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { PlusIcon } from 'lucide-react'
import { taskApi, serviceCreateApi } from '@/lib/client-api'

export default function CreateServiceDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [tasks, setTasks] = useState<string[]>([])
  const [taskName, setTaskName] = useState('')
  const [autoStart, setAutoStart] = useState(true)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    taskApi.list().then((res: any) => {
      const raw = res?.data?.tasks ?? res?.tasks ?? []
      const names = Array.isArray(raw) ? raw.map((t: any) => t.name).sort() : []
      setTasks(names)
    }).catch(() => {})
  }, [open])

  const submit = async () => {
    if (!taskName) { toast.error('Pick a task'); return }
    setBusy(true)
    try {
      const res: any = await serviceCreateApi.create(taskName, autoStart)
      if ((res.status ?? 0) >= 400) {
        toast.error(`Failed: HTTP ${res.status}`)
      } else {
        toast.success(`Service ${taskName}-* created${autoStart ? ' & starting' : ''}`)
        setOpen(false)
        setTaskName('')
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
          <PlusIcon className="h-4 w-4 mr-2" /> New service
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new service instance</DialogTitle>
          <DialogDescription>Spawns a new service from an existing task.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <div className="grid gap-1">
            <Label>Task</Label>
            <Select value={taskName} onValueChange={setTaskName}>
              <SelectTrigger><SelectValue placeholder="Pick a task…" /></SelectTrigger>
              <SelectContent>
                {tasks.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id="autostart" checked={autoStart} onCheckedChange={(v) => setAutoStart(!!v)} />
            <Label htmlFor="autostart" className="cursor-pointer">Start immediately</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !taskName}>{busy ? 'Creating…' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
