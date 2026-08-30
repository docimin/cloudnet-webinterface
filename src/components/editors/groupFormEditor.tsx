'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { groupApi } from '@/lib/client-api'
import { StringList, TemplateList, KeyValueList } from './taskFormEditor'

export default function GroupFormEditor({ group, groupName }: { group: any; groupName: string }) {
  const router = useRouter()
  const [g, setG] = useState<any>(() => JSON.parse(JSON.stringify(group)))
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: any) => setG({ ...g, [k]: v })

  const save = async () => {
    setSaving(true)
    try {
      if (g.name !== groupName) { toast.warning('Renaming a group is not supported here'); return }
      const res: any = await groupApi.update(g)
      if ((res.status ?? 0) >= 400) toast.error(`Save failed (HTTP ${res.status})`)
      else { toast.success('Group saved'); router.refresh() }
    } catch (e: any) {
      toast.error(e.message || 'Save failed')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4 space-y-4">
        <div className="grid gap-1.5">
          <Label>Name</Label>
          <Input value={g.name} disabled />
        </div>

        <div className="grid gap-1.5">
          <Label>Target environments</Label>
          <StringList values={g.targetEnvironments || []} onChange={(v) => set('targetEnvironments', v)} placeholder="MINECRAFT_SERVER" />
          <p className="text-xs text-muted-foreground">
            Services with any of these environments will automatically inherit this group's templates and JVM options.
          </p>
        </div>

        <div className="grid gap-1.5">
          <Label>Templates</Label>
          <TemplateList values={g.templates || []} onChange={(v) => set('templates', v)} />
        </div>

        <div className="grid gap-1.5">
          <Label>JVM options</Label>
          <StringList values={g.jvmOptions || []} onChange={(v) => set('jvmOptions', v)} placeholder="-XX:+UseG1GC" />
        </div>

        <div className="grid gap-1.5">
          <Label>Process parameters</Label>
          <StringList values={g.processParameters || []} onChange={(v) => set('processParameters', v)} placeholder="--nogui" />
        </div>

        <div className="grid gap-1.5">
          <Label>Environment variables</Label>
          <KeyValueList values={g.environmentVariables || {}} onChange={(v) => set('environmentVariables', v)} />
        </div>

        <div className="grid gap-1.5">
          <Label>Deployments (raw JSON)</Label>
          <Textarea rows={3} value={JSON.stringify(g.deployments || [], null, 2)}
            onChange={(e) => { try { set('deployments', JSON.parse(e.target.value)) } catch {} }}
            className="font-mono text-xs" />
        </div>

        <div className="grid gap-1.5">
          <Label>Includes (raw JSON)</Label>
          <Textarea rows={3} value={JSON.stringify(g.includes || [], null, 2)}
            onChange={(e) => { try { set('includes', JSON.parse(e.target.value)) } catch {} }}
            className="font-mono text-xs" />
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</Button>
      </div>
    </div>
  )
}
