'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { taskApi } from '@/lib/client-api'
import { PlusIcon, XIcon } from 'lucide-react'

const ENVIRONMENTS = [
  'MINECRAFT_SERVER', 'MODDED_MINECRAFT_SERVER', 'VELOCITY', 'BUNGEECORD',
  'NUKKIT', 'WATERDOG_PE', 'GLOWSTONE'
]
const RUNTIMES = ['jvm', 'docker-jvm']

export default function TaskFormEditor({ task, taskName }: { task: any; taskName: string }) {
  const router = useRouter()
  const [t, setT] = useState<any>(() => JSON.parse(JSON.stringify(task)))
  const [saving, setSaving] = useState(false)

  // Persistence is really a pair (autoDeleteOnStop, staticServices). Expose a
  // single-choice UI to avoid users setting incompatible combos.
  const persistence: 'ephemeral' | 'static' = t.staticServices ? 'static' : 'ephemeral'
  const setPersistence = (p: 'ephemeral' | 'static') => {
    setT({ ...t, staticServices: p === 'static', autoDeleteOnStop: p !== 'static' })
  }

  const setPath = (path: string, value: any) => {
    const parts = path.split('.')
    const next = JSON.parse(JSON.stringify(t))
    let cur = next
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]] ??= {}
    cur[parts[parts.length - 1]] = value
    setT(next)
  }

  const setList = (key: keyof typeof t | 'processConfiguration.jvmOptions' | 'processConfiguration.processParameters', v: string[]) => {
    setPath(key as string, v)
  }

  const save = async () => {
    setSaving(true)
    try {
      if (t.name !== taskName) { toast.warning('Renaming a task is not supported here'); return }
      const res: any = await taskApi.update(t)
      if ((res.status ?? 0) >= 400) {
        toast.error(`Save failed (HTTP ${res.status})`)
      } else {
        toast.success('Task saved')
        router.refresh()
      }
    } catch (e: any) {
      toast.error(e.message || 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <Section title="Identity">
        <Field label="Name">
          <Input value={t.name} disabled />
          <p className="text-xs text-muted-foreground">Renaming needs deleting + recreating the task.</p>
        </Field>
        <Field label="Name splitter">
          <Input value={t.nameSplitter || '-'} onChange={(e) => setPath('nameSplitter', e.target.value)} />
        </Field>
      </Section>

      <Section title="Behaviour">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Persistence">
            <Select value={persistence} onValueChange={(v) => setPersistence(v as any)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ephemeral">Ephemeral — files reset every restart</SelectItem>
                <SelectItem value="static">Static — files kept across restarts</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Maintenance mode">
            <div className="flex items-center gap-2 h-9">
              <Switch checked={!!t.maintenance} onCheckedChange={(v) => setPath('maintenance', v)} />
              <span className="text-sm text-muted-foreground">{t.maintenance ? 'On (players blocked)' : 'Off'}</span>
            </div>
          </Field>
          <Field label="Min instances">
            <Input type="number" value={t.minServiceCount ?? 0} onChange={(e) => setPath('minServiceCount', Number(e.target.value))} />
          </Field>
          <Field label="Start port">
            <Input type="number" value={t.startPort ?? 0} onChange={(e) => setPath('startPort', Number(e.target.value))} />
          </Field>
        </div>
      </Section>

      <Section title="Runtime">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Runtime">
            <Select value={t.runtime || 'jvm'} onValueChange={(v) => setPath('runtime', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {RUNTIMES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Environment">
            <Select value={t.processConfiguration?.environment || 'MINECRAFT_SERVER'} onValueChange={(v) => setPath('processConfiguration.environment', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ENVIRONMENTS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Max heap memory (MB)">
            <Input type="number" value={t.processConfiguration?.maxHeapMemorySize ?? 512}
              onChange={(e) => setPath('processConfiguration.maxHeapMemorySize', Number(e.target.value))} />
          </Field>
          <Field label="Java command">
            <Input value={t.javaCommand || ''} onChange={(e) => setPath('javaCommand', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Groups & templates">
        <Field label="Groups">
          <StringList
            values={t.groups || []}
            onChange={(v) => setList('groups', v)}
            placeholder="Global-Server"
          />
        </Field>
        <Field label="Templates">
          <TemplateList
            values={t.templates || []}
            onChange={(v) => setPath('templates', v)}
          />
        </Field>
      </Section>

      <Section title="Advanced" collapsed>
        <Field label="JVM options">
          <StringList
            values={t.processConfiguration?.jvmOptions || []}
            onChange={(v) => setPath('processConfiguration.jvmOptions', v)}
            placeholder="-XX:+UseG1GC"
          />
        </Field>
        <Field label="Process parameters">
          <StringList
            values={t.processConfiguration?.processParameters || []}
            onChange={(v) => setPath('processConfiguration.processParameters', v)}
            placeholder="--nogui"
          />
        </Field>
        <Field label="Environment variables">
          <KeyValueList
            values={t.processConfiguration?.environmentVariables || {}}
            onChange={(v) => setPath('processConfiguration.environmentVariables', v)}
          />
        </Field>
        <Field label="Deployments (raw JSON)">
          <Textarea rows={4} value={JSON.stringify(t.deployments || [], null, 2)}
            onChange={(e) => { try { setPath('deployments', JSON.parse(e.target.value)) } catch {} }}
            className="font-mono text-xs" />
        </Field>
        <Field label="Includes (raw JSON)">
          <Textarea rows={3} value={JSON.stringify(t.includes || [], null, 2)}
            onChange={(e) => { try { setPath('includes', JSON.parse(e.target.value)) } catch {} }}
            className="font-mono text-xs" />
        </Field>
      </Section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </div>
    </div>
  )
}

function Section({ title, children, collapsed = false }: { title: string; children: React.ReactNode; collapsed?: boolean }) {
  const [open, setOpen] = useState(!collapsed)
  return (
    <div className="border rounded-lg">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full text-left px-4 py-3 font-medium flex items-center justify-between hover:bg-muted/40"
      >
        <span>{title}</span>
        <span className="text-xs text-muted-foreground">{open ? '▾' : '▸'}</span>
      </button>
      {open && <div className="border-t p-4 space-y-4">{children}</div>}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export function StringList({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState('')
  const add = () => {
    const v = draft.trim()
    if (v && !values.includes(v)) onChange([...values, v])
    setDraft('')
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {values.map((v, i) => (
          <span key={`${v}-${i}`} className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-0.5 text-xs">
            {v}
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="hover:text-destructive">
              <XIcon className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          placeholder={placeholder} />
        <Button type="button" variant="outline" onClick={add}><PlusIcon className="h-4 w-4" /></Button>
      </div>
    </div>
  )
}

export function TemplateList({ values, onChange }: { values: any[]; onChange: (v: any[]) => void }) {
  const update = (i: number, field: string, v: any) => {
    const next = values.slice()
    next[i] = { ...next[i], [field]: v }
    onChange(next)
  }
  const add = () => onChange([...values, { prefix: '', name: 'default', storage: 'local', priority: 0, alwaysCopyToStaticServices: false }])
  return (
    <div className="space-y-2">
      {values.map((tpl, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
          <Input value={tpl.storage || 'local'} onChange={(e) => update(i, 'storage', e.target.value)} placeholder="storage" />
          <Input value={tpl.prefix || ''} onChange={(e) => update(i, 'prefix', e.target.value)} placeholder="prefix" />
          <Input value={tpl.name || ''} onChange={(e) => update(i, 'name', e.target.value)} placeholder="name" />
          <Button type="button" variant="ghost" size="icon" onClick={() => onChange(values.filter((_, j) => j !== i))}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <PlusIcon className="h-4 w-4 mr-2" /> Add template
      </Button>
    </div>
  )
}

export function KeyValueList({ values, onChange }: { values: Record<string, string>; onChange: (v: Record<string, string>) => void }) {
  const entries = Object.entries(values)
  const update = (i: number, k: string, v: string) => {
    const next: Record<string, string> = {}
    entries.forEach(([ek, ev], j) => {
      if (j === i) next[k] = v
      else next[ek] = ev
    })
    onChange(next)
  }
  const add = () => onChange({ ...values, '': '' })
  return (
    <div className="space-y-2">
      {entries.map(([k, v], i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
          <Input value={k} onChange={(e) => update(i, e.target.value, v)} placeholder="KEY" />
          <Input value={v} onChange={(e) => update(i, k, e.target.value)} placeholder="value" />
          <Button type="button" variant="ghost" size="icon" onClick={() => {
            const next = { ...values }; delete next[k]; onChange(next)
          }}>
            <XIcon className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <PlusIcon className="h-4 w-4 mr-2" /> Add variable
      </Button>
    </div>
  )
}
