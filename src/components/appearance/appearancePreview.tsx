import { useTranslations } from 'gt-tanstack-start'
import { useId } from 'react'
import Meter from '@/components/meter'
import { type Status, StatusIndicator } from '@/components/status'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

const STATUSES: Status[] = [
  'running',
  'starting',
  'stopped',
  'error',
  'draining'
]

export function AppearancePreview() {
  const appearanceT = useTranslations('Appearance')
  const statusT = useTranslations('Status')
  const checkboxId = useId()
  const switchId = useId()

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-card p-4 text-card-foreground">
      <div className="flex flex-wrap gap-2">
        <Button>{appearanceT('previewPrimary')}</Button>
        <Button variant="secondary">{appearanceT('previewSecondary')}</Button>
        <Button variant="outline">{appearanceT('previewOutline')}</Button>
        <Button variant="destructive">
          {appearanceT('previewDestructive')}
        </Button>
      </div>
      <Input placeholder={appearanceT('previewInput')} />
      <div className="flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-2">
          <Checkbox id={checkboxId} defaultChecked />
          <Label htmlFor={checkboxId}>{appearanceT('previewCheckbox')}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id={switchId} defaultChecked />
          <Label htmlFor={switchId}>{appearanceT('previewSwitch')}</Label>
        </div>
      </div>
      <div className="flex flex-wrap gap-4 text-sm">
        {STATUSES.map((status) => (
          <StatusIndicator
            key={status}
            status={status}
            label={statusT(status)}
            showLabel
          />
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {[35, 80, 95].map((value) => (
          <Meter
            key={value}
            value={value}
            label={appearanceT('previewLoad', { value })}
          />
        ))}
      </div>
      <div className="rounded-md bg-console p-3 font-mono text-sm text-console-foreground">
        <div className="text-log-info">{appearanceT('previewLogInfo')}</div>
        <div className="text-log-warn">{appearanceT('previewLogWarn')}</div>
        <div className="text-log-error">{appearanceT('previewLogError')}</div>
      </div>
    </div>
  )
}
