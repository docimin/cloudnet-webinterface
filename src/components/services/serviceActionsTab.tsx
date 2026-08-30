'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { serviceApi, serviceActionsApi } from '@/lib/client-api'
import {
  PackagePlusIcon, UploadCloudIcon, DownloadCloudIcon, PlayIcon,
  Trash2Icon, TerminalIcon
} from 'lucide-react'

export default function ServiceActionsTab({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  return (
    <div className="pt-4 space-y-3">
      <ActionCard
        icon={<PackagePlusIcon className="h-5 w-5" />}
        title="Attach template"
        description="Adds a template to this service. Applied on the next start unless you check Flush now, in which case CloudNet copies the template's files into the running service immediately."
        trigger={<AddTemplateDialog serviceId={serviceId} />}
      />
      <ActionCard
        icon={<UploadCloudIcon className="h-5 w-5" />}
        title="Add deployment target"
        description="Sets a template as a deployment target — the next Deploy resources will copy this service's files into it. Use to snapshot state."
        trigger={<AddDeploymentDialog serviceId={serviceId} />}
      />
      <ActionCard
        icon={<DownloadCloudIcon className="h-5 w-5" />}
        title="Add remote inclusion"
        description="Downloads a file from an HTTP(s) URL into the service at a given relative path. Useful for pulling a plugin jar or a config from a repo."
        trigger={<AddInclusionDialog serviceId={serviceId} />}
      />
      <ActionCard
        icon={<PlayIcon className="h-5 w-5" />}
        title="Deploy resources now"
        description="Flushes all pending deployments — copies files from the runtime into every attached deployment template right now."
        trigger={<DeployNowButton serviceId={serviceId} />}
      />
      <ActionCard
        icon={<TerminalIcon className="h-5 w-5" />}
        title="Send console command"
        description="Runs a single command in the service's console — same as typing it in the Console tab."
        trigger={<SendCommandDialog serviceId={serviceId} serviceName={serviceName} />}
      />
      <ActionCard
        icon={<Trash2Icon className="h-5 w-5 text-destructive" />}
        title="Wipe runtime files"
        description="Deletes ALL files of this service's runtime tree. Static services lose their persistent data too. Cannot be undone."
        trigger={<WipeFilesButton serviceId={serviceId} />}
        destructive
      />
    </div>
  )
}

function ActionCard({ icon, title, description, trigger, destructive = false }: {
  icon: React.ReactNode; title: string; description: string; trigger: React.ReactNode; destructive?: boolean
}) {
  return (
    <div className={`border rounded-lg p-4 flex items-start gap-4 ${destructive ? 'border-destructive/40' : ''}`}>
      <div className="mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="font-medium">{title}</div>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="shrink-0">{trigger}</div>
    </div>
  )
}

function AddTemplateDialog({ serviceId }: { serviceId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [storage, setStorage] = useState('local')
  const [prefix, setPrefix] = useState('')
  const [name, setName] = useState('default')
  const [flush, setFlush] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!prefix || !name) { toast.error('Prefix and name required'); return }
    setBusy(true)
    try {
      const res: any = await serviceActionsApi.addTemplate(serviceId, prefix, name, storage, flush)
      if ((res.status ?? 0) >= 400) toast.error(`Failed (HTTP ${res.status})`)
      else { toast.success(`Template ${prefix}/${name} attached`); setOpen(false); router.refresh() }
    } finally { setBusy(false) }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm">Attach</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Attach template</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <FieldRow label="Storage"><Input value={storage} onChange={(e) => setStorage(e.target.value)} /></FieldRow>
          <FieldRow label="Prefix"><Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="MyTemplate" /></FieldRow>
          <FieldRow label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></FieldRow>
          <div className="flex items-center gap-2">
            <Checkbox id="fl" checked={flush} onCheckedChange={(v) => setFlush(!!v)} />
            <Label htmlFor="fl" className="cursor-pointer text-sm">
              Flush now — copy template files into the running service immediately
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !prefix}>{busy ? 'Attaching…' : 'Attach'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddDeploymentDialog({ serviceId }: { serviceId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [storage, setStorage] = useState('local')
  const [prefix, setPrefix] = useState('')
  const [name, setName] = useState('default')
  const [flush, setFlush] = useState(false)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!prefix || !name) { toast.error('Prefix and name required'); return }
    setBusy(true)
    try {
      const res: any = await serviceActionsApi.addDeployment(serviceId, prefix, name, storage, flush)
      if ((res.status ?? 0) >= 400) toast.error(`Failed (HTTP ${res.status})`)
      else { toast.success(`Deployment target ${prefix}/${name} added`); setOpen(false); router.refresh() }
    } finally { setBusy(false) }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm">Add</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add deployment target</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <FieldRow label="Storage"><Input value={storage} onChange={(e) => setStorage(e.target.value)} /></FieldRow>
          <FieldRow label="Prefix"><Input value={prefix} onChange={(e) => setPrefix(e.target.value)} placeholder="Snapshot" /></FieldRow>
          <FieldRow label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></FieldRow>
          <div className="flex items-center gap-2">
            <Checkbox id="fldep" checked={flush} onCheckedChange={(v) => setFlush(!!v)} />
            <Label htmlFor="fldep" className="cursor-pointer text-sm">
              Deploy now — run the deployment immediately after adding
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !prefix}>{busy ? 'Adding…' : 'Add'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function AddInclusionDialog({ serviceId }: { serviceId: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [dest, setDest] = useState('plugins/')
  const [flush, setFlush] = useState(true)
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    if (!url || !dest) { toast.error('URL and destination required'); return }
    setBusy(true)
    try {
      const res: any = await serviceActionsApi.addInclusion(serviceId, url, dest, flush)
      if ((res.status ?? 0) >= 400) {
        const detail = res?.data?.detail || res?.error || `HTTP ${res.status}`
        toast.error(`Failed: ${detail}`)
      } else { toast.success(`Inclusion ${dest} queued`); setOpen(false); router.refresh() }
    } finally { setBusy(false) }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm">Add</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add remote inclusion</DialogTitle></DialogHeader>
        <div className="grid gap-3 py-2">
          <FieldRow label="URL">
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/plugin.jar" />
          </FieldRow>
          <FieldRow label="Destination (relative)">
            <Input value={dest} onChange={(e) => setDest(e.target.value)} placeholder="plugins/plugin.jar" />
          </FieldRow>
          <div className="flex items-center gap-2">
            <Checkbox id="flinc" checked={flush} onCheckedChange={(v) => setFlush(!!v)} />
            <Label htmlFor="flinc" className="cursor-pointer text-sm">
              Download now — otherwise it happens on the next start
            </Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={submit} disabled={busy || !url || !dest}>{busy ? 'Queuing…' : 'Add'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeployNowButton({ serviceId }: { serviceId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const run = async () => {
    setBusy(true)
    try {
      const res: any = await serviceActionsApi.deployResources(serviceId, true)
      if ((res.status ?? 0) >= 400) toast.error(`Failed (HTTP ${res.status})`)
      else { toast.success('Resources deployed'); router.refresh() }
    } finally { setBusy(false) }
  }
  return <Button variant="outline" size="sm" onClick={run} disabled={busy}>{busy ? 'Deploying…' : 'Deploy'}</Button>
}

function SendCommandDialog({ serviceId, serviceName }: { serviceId: string; serviceName: string }) {
  const [open, setOpen] = useState(false)
  const [cmd, setCmd] = useState('')
  const [busy, setBusy] = useState(false)
  const run = async () => {
    if (!cmd.trim()) return
    setBusy(true)
    try {
      const res: any = await serviceApi.execute(serviceId, cmd)
      if ((res.status ?? 0) >= 400) toast.error(`Failed (HTTP ${res.status})`)
      else { toast.success(`Sent: ${cmd}`); setCmd(''); setOpen(false) }
    } finally { setBusy(false) }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline" size="sm">Send</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send command to {serviceName}</DialogTitle>
          <DialogDescription>The command runs in the service's own console — see the Console tab for output.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          <FieldRow label="Command">
            <Input
              value={cmd}
              onChange={(e) => setCmd(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); run() } }}
              placeholder="say Hello"
              autoFocus
            />
          </FieldRow>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button onClick={run} disabled={busy || !cmd.trim()}>{busy ? 'Sending…' : 'Send'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WipeFilesButton({ serviceId }: { serviceId: string }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const run = async () => {
    setBusy(true)
    try {
      const res: any = await serviceActionsApi.wipeFiles(serviceId)
      if ((res.status ?? 0) >= 400) toast.error(`Failed (HTTP ${res.status})`)
      else { toast.success('Runtime files wiped'); router.refresh() }
    } finally { setBusy(false) }
  }
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" disabled={busy}>{busy ? 'Wiping…' : 'Wipe'}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Wipe all runtime files?</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes every file of the service's runtime tree, including worlds, plugin data, and configs. Static services lose their persistent data too. Cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={run} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Wipe files
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}
