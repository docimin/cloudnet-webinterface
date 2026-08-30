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
import { Input } from '@/components/ui/input'
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
import { PlusIcon, ServerIcon, GamepadIcon, HomeIcon, WrenchIcon, WorkflowIcon } from 'lucide-react'
import { versionApi, blueprintApi } from '@/lib/client-api'

type Preset = 'lobby' | 'survival' | 'minigame' | 'proxy' | 'custom'

type PresetDef = {
  key: Preset
  label: string
  icon: any
  description: string
  environment: string
  groups: string[]
  memory: number
  static: boolean
  minServiceCount: number
  startPort: number
  suggestedVersion?: { type: string; version: string }
}

const PRESETS: Record<Preset, PresetDef> = {
  lobby: {
    key: 'lobby', label: 'Lobby / Hub', icon: HomeIcon,
    description: 'Single persistent hub with your spawn, NPCs and signs.',
    environment: 'MINECRAFT_SERVER',
    groups: ['Lobby', 'Global-Server'],
    memory: 512, static: true, minServiceCount: 1, startPort: 44955,
    suggestedVersion: { type: 'purpur', version: '26.2' }
  },
  survival: {
    key: 'survival', label: 'Survival / Creative', icon: WorkflowIcon,
    description: 'Persistent server keeping worlds and player data across restarts.',
    environment: 'MINECRAFT_SERVER',
    groups: ['Global-Server'],
    memory: 2048, static: true, minServiceCount: 1, startPort: 45000,
    suggestedVersion: { type: 'purpur', version: '26.2' }
  },
  minigame: {
    key: 'minigame', label: 'Minigame / Event', icon: GamepadIcon,
    description: 'Ephemeral server that resets to a clean map at every restart.',
    environment: 'MINECRAFT_SERVER',
    groups: ['Global-Server'],
    memory: 1024, static: false, minServiceCount: 2, startPort: 45100,
    suggestedVersion: { type: 'purpur', version: '26.2' }
  },
  proxy: {
    key: 'proxy', label: 'Proxy (Velocity)', icon: ServerIcon,
    description: 'Front-end proxy that routes players to backend servers.',
    environment: 'VELOCITY',
    groups: ['Proxy', 'Global-Proxy'],
    memory: 512, static: false, minServiceCount: 1, startPort: 25565,
    suggestedVersion: { type: 'velocity', version: 'latest' }
  },
  custom: {
    key: 'custom', label: 'Custom', icon: WrenchIcon,
    description: 'Blank slate — set every field yourself.',
    environment: 'MINECRAFT_SERVER',
    groups: [],
    memory: 512, static: false, minServiceCount: 0, startPort: 45200
  }
}

export default function BlueprintDialog({ trigger, onCreated }: { trigger?: React.ReactNode; onCreated?: () => void }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [busy, setBusy] = useState(false)
  const [progressMsg, setProgressMsg] = useState('')

  const [preset, setPreset] = useState<Preset>('lobby')
  const p = PRESETS[preset]
  const [environment, setEnvironment] = useState(p.environment)
  const [groups, setGroups] = useState(p.groups.join(', '))
  const [memory, setMemory] = useState(p.memory)
  const [isStatic, setIsStatic] = useState(p.static)
  const [minServiceCount, setMinServiceCount] = useState(p.minServiceCount)
  const [startPort, setStartPort] = useState(p.startPort)
  const [taskName, setTaskName] = useState('')
  const [bootstrap, setBootstrap] = useState(true)

  // Version selection
  const [versionType, setVersionType] = useState(p.suggestedVersion?.type || '')
  const [version, setVersion] = useState(p.suggestedVersion?.version || '')
  const [versionsData, setVersionsData] = useState<Record<string, { versions: Array<{ name: string; deprecated?: boolean }> }>>({})

  useEffect(() => {
    if (!open) return
    versionApi.list().then((res: any) => {
      const raw = res?.data ?? res
      const types = raw?.serviceVersionTypes ?? {}
      setVersionsData(types)
    }).catch(() => {})
  }, [open])

  useEffect(() => {
    const def = PRESETS[preset]
    setEnvironment(def.environment)
    setGroups(def.groups.join(', '))
    setMemory(def.memory)
    setIsStatic(def.static)
    setMinServiceCount(def.minServiceCount)
    setStartPort(def.startPort)
    if (def.suggestedVersion) {
      setVersionType(def.suggestedVersion.type)
      setVersion(def.suggestedVersion.version)
    }
  }, [preset])

  const availableTypes = Object.keys(versionsData).sort()
  const availableVersions = versionsData[versionType]?.versions?.filter(v => !v.deprecated).map(v => v.name) ?? []

  const submit = async () => {
    if (!/^[A-Za-z0-9_-]{1,40}$/.test(taskName)) {
      toast.error('Task name must be alphanumeric (a-z, 0-9, _ or -)')
      return
    }
    setBusy(true)
    setProgressMsg(bootstrap ? 'Creating template, installing jar, starting seed service…' : 'Creating template + task…')
    try {
      const res: any = await blueprintApi.create({
        taskName,
        preset,
        environment,
        groups: groups.split(',').map(g => g.trim()).filter(Boolean),
        static: isStatic,
        memory,
        minServiceCount,
        startPort,
        serviceVersionType: versionType || undefined,
        serviceVersion: version || undefined,
        bootstrap
      })
      if ((res.status ?? 0) >= 400) {
        toast.error(`Failed at step "${res.step ?? '?'}": HTTP ${res.status}`)
      } else {
        toast.success(`Task ${taskName} ready${bootstrap ? ' — configs generated' : ''}`)
        setOpen(false)
        setStep(1)
        setTaskName('')
        onCreated?.()
        router.refresh()
      }
    } catch (e: any) {
      toast.error(e.message || 'Blueprint failed')
    } finally {
      setBusy(false)
      setProgressMsg('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setStep(1) }}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button>
            <PlusIcon className="h-4 w-4 mr-2" /> New task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a new task {step > 1 && `— step ${step}/3`}</DialogTitle>
          <DialogDescription>
            Runs template + version install + task upsert{bootstrap ? ' + config bootstrap' : ''}.
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <div className="grid gap-3 py-2">
            <Label>Server type</Label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.values(PRESETS)).map(def => (
                <button
                  key={def.key}
                  type="button"
                  onClick={() => setPreset(def.key)}
                  className={`text-left border rounded-md p-3 hover:border-primary transition-colors ${preset === def.key ? 'border-primary bg-primary/5' : ''}`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <def.icon className="h-4 w-4" /> {def.label}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{def.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-3 py-2">
            <div className="grid gap-1">
              <Label>Server software</Label>
              <Select value={versionType} onValueChange={setVersionType}>
                <SelectTrigger><SelectValue placeholder="Pick software…" /></SelectTrigger>
                <SelectContent>
                  {availableTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Minecraft version</Label>
              <Select value={version} onValueChange={setVersion}>
                <SelectTrigger><SelectValue placeholder="Pick version…" /></SelectTrigger>
                <SelectContent className="max-h-72">
                  {availableVersions.map(v => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-md border p-3 flex items-start gap-3">
              <Checkbox id="static" checked={isStatic} onCheckedChange={(v) => setIsStatic(!!v)} />
              <div>
                <Label htmlFor="static" className="cursor-pointer font-medium">Persistent (static)</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Files (worlds, configs, plugin data) are kept across restarts. Uncheck for a fresh-every-restart minigame.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-3 py-2">
            <div className="grid gap-1">
              <Label htmlFor="taskName">Task name</Label>
              <Input id="taskName" value={taskName} onChange={(e) => setTaskName(e.target.value)} placeholder="Skyblock" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1">
                <Label htmlFor="memory">Memory (MB)</Label>
                <Input id="memory" type="number" value={memory} onChange={(e) => setMemory(Number(e.target.value))} />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="minServices">Min instances</Label>
                <Input id="minServices" type="number" value={minServiceCount} onChange={(e) => setMinServiceCount(Number(e.target.value))} />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="startPort">Start port</Label>
                <Input id="startPort" type="number" value={startPort} onChange={(e) => setStartPort(Number(e.target.value))} />
              </div>
              <div className="grid gap-1">
                <Label htmlFor="env">Environment</Label>
                <Input id="env" value={environment} onChange={(e) => setEnvironment(e.target.value)} />
              </div>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="groups">Groups (comma-separated)</Label>
              <Input id="groups" value={groups} onChange={(e) => setGroups(e.target.value)} placeholder="Global-Server, Lobby" />
            </div>
            <div className="rounded-md border p-3 flex items-start gap-3">
              <Checkbox id="bootstrap" checked={bootstrap} onCheckedChange={(v) => setBootstrap(!!v)} />
              <div>
                <Label htmlFor="bootstrap" className="cursor-pointer font-medium">Pre-generate config files</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Runs the server once so Paper/Purpur creates its default configs (bukkit.yml, spigot.yml, paper-global.yml…),
                  then saves them into the template so you can edit them from the Templates browser. Adds ~25s to creation.
                </p>
              </div>
            </div>
            {progressMsg && (
              <div className="text-sm text-muted-foreground">{progressMsg}</div>
            )}
          </div>
        )}

        <DialogFooter className="justify-between">
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep(step - 1)} disabled={busy}>Back</Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={busy}>Next</Button>
            ) : (
              <Button onClick={submit} disabled={busy || !taskName}>
                {busy ? 'Working…' : 'Create'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
