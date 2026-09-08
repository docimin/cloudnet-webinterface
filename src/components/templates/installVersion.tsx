import * as Sentry from '@sentry/tanstackstart-react'
import { useTranslations } from 'gt-tanstack-start'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  serviceEnvironmentList,
  serviceVersionInstall,
  serviceVersionList
} from '@/server/serviceVersion'
import type {
  ServiceEnvironmentType,
  ServiceVersionType
} from '@/utils/types/serviceVersions'

const ALL_ENVIRONMENTS = 'all'

export function InstallVersion({
  open,
  template,
  onCancel,
  onInstalled
}: {
  open: boolean
  template: {
    storage: string
    prefix: string
    name: string
    priority: number
    alwaysCopyToStaticServices: boolean
  }
  onCancel: () => void
  onInstalled: () => void
}) {
  const versionsT = useTranslations('Versions')
  const [types, setTypes] = useState<ServiceVersionType[] | null>(null)
  const [environments, setEnvironments] = useState<ServiceEnvironmentType[]>([])
  const [environment, setEnvironment] = useState(ALL_ENVIRONMENTS)
  const [type, setType] = useState('')
  const [version, setVersion] = useState('')
  const [installing, setInstalling] = useState(false)
  const [listFailed, setListFailed] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    Promise.all([
      serviceVersionList(),
      serviceEnvironmentList().catch(() => ({ environments: [] }))
    ])
      .then(([list, environmentList]) => {
        if (cancelled) return
        setTypes(list.serviceVersionTypes ?? [])
        setEnvironments(environmentList.environments ?? [])
      })
      .catch((error) => {
        if (cancelled) return
        Sentry.captureException(error)
        setTypes([])
        setListFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [open])

  const visibleTypes = (types ?? [])
    .filter(
      (entry) =>
        environment === ALL_ENVIRONMENTS ||
        entry.environmentType === environment
    )
    .sort((a, b) => a.name.localeCompare(b.name))

  const versions = visibleTypes.find((entry) => entry.name === type)?.versions

  const install = async () => {
    setInstalling(true)
    try {
      await serviceVersionInstall({
        data: { template, serviceVersionType: type, serviceVersion: version }
      })
      toast.success(versionsT('installed'))
      onInstalled()
    } catch (error) {
      Sentry.captureException(error)
      toast.error(versionsT('installFailed'))
    } finally {
      setInstalling(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{versionsT('installVersion')}</DialogTitle>
          <DialogDescription>
            <span className="font-mono break-all">
              {`${template.storage}:${template.prefix}/${template.name}`}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {listFailed && (
            <p className="text-sm text-destructive">
              {versionsT('listFailed')}
            </p>
          )}
          {types === null && !listFailed && (
            <p className="text-sm text-muted-foreground">
              {versionsT('loadingVersions')}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="install-environment">
              {versionsT('environment')}
            </Label>
            <Select
              value={environment}
              onValueChange={(next) => {
                setEnvironment(next)
                setType('')
                setVersion('')
              }}
            >
              <SelectTrigger id="install-environment">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_ENVIRONMENTS}>
                  {versionsT('allEnvironments')}
                </SelectItem>
                {[...environments]
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map((entry) => (
                    <SelectItem
                      key={entry.name}
                      value={entry.name}
                      className="font-mono"
                    >
                      {entry.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="install-type">{versionsT('versionType')}</Label>
            <Select
              value={type}
              onValueChange={(next) => {
                setType(next)
                setVersion('')
              }}
            >
              <SelectTrigger id="install-type">
                <SelectValue placeholder={versionsT('selectVersionType')} />
              </SelectTrigger>
              <SelectContent>
                {visibleTypes.map((entry) => (
                  <SelectItem
                    key={entry.name}
                    value={entry.name}
                    className="font-mono"
                  >
                    {entry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="install-version">{versionsT('version')}</Label>
            <Select value={version} onValueChange={setVersion} disabled={!type}>
              <SelectTrigger id="install-version">
                <SelectValue placeholder={versionsT('selectVersion')} />
              </SelectTrigger>
              <SelectContent>
                {(versions ?? []).map((entry) => (
                  <SelectItem
                    key={entry.name}
                    value={entry.name}
                    className="font-mono"
                  >
                    {entry.deprecated
                      ? versionsT('deprecatedVersion', { version: entry.name })
                      : entry.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            {versionsT('cancel')}
          </Button>
          <Button
            type="button"
            disabled={!type || !version || installing}
            onClick={install}
          >
            {versionsT('install')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
