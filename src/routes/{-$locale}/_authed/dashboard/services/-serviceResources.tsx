import * as Sentry from '@sentry/tanstackstart-react'
import { useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import {
  DownloadIcon,
  FolderSyncIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import TableEmpty from '@/components/tableEmpty'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  serviceAddDeployment,
  serviceAddInclusion,
  serviceAddTemplate,
  serviceDeleteFiles,
  serviceDeployResources,
  serviceInclude
} from '@/server/service'
import { storageList, storageTemplateList } from '@/server/templates'

type Dialogs = 'template' | 'inclusion' | 'deployment' | null
type Confirms = 'templates' | 'inclusions' | 'deploy' | 'deleteFiles' | null

function Panel({
  title,
  action,
  children
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {action}
      </div>
      <div className="overflow-hidden rounded-lg border">{children}</div>
    </section>
  )
}

// Storage and template lists are fetched only when a picker opens; the detail
// page should not pay for them on every visit.
function TemplatePicker({
  storage,
  template,
  onStorageChange,
  onTemplateChange
}: {
  storage: string
  template: string
  onStorageChange: (value: string) => void
  onTemplateChange: (value: string) => void
}) {
  const servicesT = useTranslations('Services')
  const [storages, setStorages] = useState<string[]>([])
  const [templates, setTemplates] = useState<string[]>([])
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true
    storageList()
      .then((result) => {
        if (active) setStorages(result?.storages ?? [])
      })
      .catch((error) => {
        Sentry.captureException(error)
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!storage) {
      setTemplates([])
      return
    }
    let active = true
    storageTemplateList({ data: { storage } })
      .then((result) => {
        if (!active) return
        const ids = (result?.templates ?? [])
          .filter((entry) => entry?.prefix && entry?.name)
          .map((entry) => `${entry.prefix}/${entry.name}`)
        setTemplates([...new Set(ids)].sort((a, b) => a.localeCompare(b)))
      })
      .catch((error) => {
        Sentry.captureException(error)
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [storage])

  if (failed) {
    return (
      <p className="text-sm text-muted-foreground">
        {servicesT('storagesUnavailable')}
      </p>
    )
  }

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="resource-storage">{servicesT('storage')}</Label>
        <Select value={storage} onValueChange={onStorageChange}>
          <SelectTrigger id="resource-storage" className="font-mono">
            <SelectValue placeholder={servicesT('selectStorage')} />
          </SelectTrigger>
          <SelectContent>
            {storages
              .filter(Boolean)
              .sort((a, b) => a.localeCompare(b))
              .map((entry) => (
                <SelectItem key={entry} value={entry} className="font-mono">
                  {entry}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="resource-template">{servicesT('template')}</Label>
        <Select
          value={template}
          onValueChange={onTemplateChange}
          disabled={!storage || templates.length === 0}
        >
          <SelectTrigger id="resource-template" className="font-mono">
            <SelectValue placeholder={servicesT('selectTemplate')} />
          </SelectTrigger>
          <SelectContent>
            {templates.map((entry) => (
              <SelectItem key={entry} value={entry} className="font-mono">
                {entry}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  )
}

export default function ServiceResources({
  serviceId,
  service,
  permissions
}: {
  serviceId: string
  service: Service
  permissions: string[]
}) {
  const servicesT = useTranslations('Services')
  const statusT = useTranslations('Status')
  const router = useRouter()

  const [dialog, setDialog] = useState<Dialogs>(null)
  const [confirm, setConfirm] = useState<Confirms>(null)
  const [pending, setPending] = useState(false)
  const [storage, setStorage] = useState('')
  const [template, setTemplate] = useState('')
  const [priority, setPriority] = useState('0')
  const [alwaysCopy, setAlwaysCopy] = useState(false)
  const [flush, setFlush] = useState(false)
  const [url, setUrl] = useState('')
  const [destination, setDestination] = useState('')
  const [excludes, setExcludes] = useState('')
  const [removeDeployments, setRemoveDeployments] = useState(true)
  const [typed, setTyped] = useState('')

  const allows = (...scopes: string[]) =>
    permissions.includes('global:admin') ||
    scopes.some((scope) => permissions.includes(scope))

  const mayAddTemplate = allows(
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_add_template'
  )
  const mayAddInclusion = allows(
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_add_inclusion'
  )
  const mayAddDeployment = allows(
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_add_deployment'
  )
  const mayInclude = allows(
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_include'
  )
  const mayDeploy = allows(
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_deploy_resources'
  )
  const mayDeleteFiles = allows(
    'cloudnet_rest:service_write',
    'cloudnet_rest:service_delete_files'
  )

  const identity = service.configuration.serviceId
  const name = `${identity.taskName}${identity.nameSplitter}${identity.taskServiceId}`

  const closeDialog = () => {
    setDialog(null)
    setStorage('')
    setTemplate('')
    setPriority('0')
    setAlwaysCopy(false)
    setFlush(false)
    setUrl('')
    setDestination('')
    setExcludes('')
  }

  const pickedTemplate = () => {
    const slash = template.indexOf('/')
    if (!storage || slash <= 0) return null
    const parsed = Number.parseInt(priority, 10)
    return {
      storage,
      prefix: template.slice(0, slash),
      name: template.slice(slash + 1),
      priority: Number.isNaN(parsed) ? 0 : parsed,
      alwaysCopyToStaticServices: alwaysCopy
    }
  }

  const run = async (action: () => Promise<unknown>, success: string) => {
    setPending(true)
    try {
      await action()
      toast.success(success)
      router.invalidate()
      return true
    } catch (error) {
      Sentry.captureException(error)
      toast.error(servicesT('resourceActionFailed'))
      return false
    } finally {
      setPending(false)
    }
  }

  const addTemplate = async () => {
    const picked = pickedTemplate()
    if (!picked) return
    const done = await run(
      () =>
        serviceAddTemplate({
          data: { id: serviceId, flush, template: picked }
        }),
      servicesT('templateAdded')
    )
    if (done) closeDialog()
  }

  const addDeployment = async () => {
    const picked = pickedTemplate()
    if (!picked) return
    const done = await run(
      () =>
        serviceAddDeployment({
          data: {
            id: serviceId,
            flush,
            template: picked,
            excludes: excludes
              .split(',')
              .map((entry) => entry.trim())
              .filter(Boolean)
          }
        }),
      servicesT('deploymentAdded')
    )
    if (done) closeDialog()
  }

  const addInclusion = async () => {
    const done = await run(
      () =>
        serviceAddInclusion({
          data: {
            id: serviceId,
            flush,
            url: url.trim(),
            destination: destination.trim()
          }
        }),
      servicesT('inclusionAdded')
    )
    if (done) closeDialog()
  }

  const runConfirm = async () => {
    const current = confirm
    // re-checked here so the gate survives losing the disabled attribute
    if (current === 'deleteFiles' && typed !== name) return
    setConfirm(null)
    setTyped('')
    if (current === 'templates') {
      await run(
        () => serviceInclude({ data: { id: serviceId, type: 'templates' } }),
        servicesT('templatesIncluded')
      )
    } else if (current === 'inclusions') {
      await run(
        () => serviceInclude({ data: { id: serviceId, type: 'inclusions' } }),
        servicesT('inclusionsRun')
      )
    } else if (current === 'deploy') {
      await run(
        () =>
          serviceDeployResources({
            data: { id: serviceId, remove: removeDeployments }
          }),
        servicesT('resourcesDeployed')
      )
    } else if (current === 'deleteFiles') {
      await run(
        () => serviceDeleteFiles({ data: { id: serviceId } }),
        servicesT('filesDeleted')
      )
    }
  }

  const confirmCopy = () => {
    if (confirm === 'templates') {
      return {
        title: servicesT('includeTemplatesTitle'),
        description: servicesT('includeTemplatesDescription'),
        label: servicesT('includeTemplates')
      }
    }
    if (confirm === 'inclusions') {
      return {
        title: servicesT('runInclusionsTitle'),
        description: servicesT('runInclusionsDescription'),
        label: servicesT('runInclusions')
      }
    }
    if (confirm === 'deploy') {
      return {
        title: servicesT('deployResourcesTitle'),
        description: servicesT('deployResourcesDescription'),
        label: servicesT('deployResources')
      }
    }
    return {
      title: servicesT('deleteFilesTitle'),
      description: servicesT('deleteFilesDescription'),
      label: servicesT('deleteFiles')
    }
  }

  const copy = confirmCopy()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {mayInclude && (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setConfirm('templates')}
            >
              <FolderSyncIcon className="mr-2 size-4" />
              {servicesT('includeTemplates')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() => setConfirm('inclusions')}
            >
              <DownloadIcon className="mr-2 size-4" />
              {servicesT('runInclusions')}
            </Button>
          </>
        )}
        {mayDeploy && (
          <Button
            size="sm"
            variant="outline"
            disabled={pending}
            onClick={() => setConfirm('deploy')}
          >
            <UploadIcon className="mr-2 size-4" />
            {servicesT('deployResources')}
          </Button>
        )}
        {mayDeleteFiles && (
          <Button
            size="sm"
            variant="destructive"
            disabled={pending}
            onClick={() => {
              setTyped('')
              setConfirm('deleteFiles')
            }}
          >
            <Trash2Icon className="mr-2 size-4" />
            {servicesT('deleteFiles')}
          </Button>
        )}
      </div>

      <Panel
        title={servicesT('templates')}
        action={
          mayAddTemplate && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDialog('template')}
            >
              <PlusIcon className="mr-2 size-4" />
              {servicesT('addTemplate')}
            </Button>
          )
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{servicesT('storage')}</TableHead>
              <TableHead>{servicesT('template')}</TableHead>
              <TableHead className="text-right">
                {servicesT('priority')}
              </TableHead>
              <TableHead>{servicesT('alwaysCopy')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {service.configuration.templates.length === 0 && (
              <TableEmpty
                colSpan={4}
                title={servicesT('noTemplates')}
                description={servicesT('noTemplatesDescription')}
              />
            )}
            {service.configuration.templates.map((entry) => (
              <TableRow
                key={`${entry.storage}:${entry.prefix}/${entry.name}`}
                className="hover:bg-muted/50"
              >
                <TableCell className="font-mono text-muted-foreground">
                  {entry.storage}
                </TableCell>
                <TableCell className="font-mono">
                  {entry.prefix}/{entry.name}
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {entry.priority}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {entry.alwaysCopyToStaticServices
                    ? servicesT('yes')
                    : servicesT('no')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Panel
        title={servicesT('inclusions')}
        action={
          mayAddInclusion && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDialog('inclusion')}
            >
              <PlusIcon className="mr-2 size-4" />
              {servicesT('addInclusion')}
            </Button>
          )
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{servicesT('url')}</TableHead>
              <TableHead>{servicesT('destination')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {service.configuration.includes.length === 0 && (
              <TableEmpty
                colSpan={2}
                title={servicesT('noInclusions')}
                description={servicesT('noInclusionsDescription')}
              />
            )}
            {service.configuration.includes.map((entry) => (
              <TableRow
                key={`${entry.url}:${entry.destination}`}
                className="hover:bg-muted/50"
              >
                <TableCell className="font-mono break-all">
                  {entry.url}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  {entry.destination}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Panel
        title={servicesT('deployments')}
        action={
          mayAddDeployment && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDialog('deployment')}
            >
              <PlusIcon className="mr-2 size-4" />
              {servicesT('addDeployment')}
            </Button>
          )
        }
      >
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>{servicesT('storage')}</TableHead>
              <TableHead>{servicesT('template')}</TableHead>
              <TableHead>{servicesT('excludes')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {service.configuration.deployments.length === 0 && (
              <TableEmpty
                colSpan={3}
                title={servicesT('noDeployments')}
                description={servicesT('noDeploymentsDescription')}
              />
            )}
            {service.configuration.deployments.map((entry) => (
              <TableRow
                key={`${entry.template.storage}:${entry.template.prefix}/${entry.template.name}`}
                className="hover:bg-muted/50"
              >
                <TableCell className="font-mono text-muted-foreground">
                  {entry.template.storage}
                </TableCell>
                <TableCell className="font-mono">
                  {entry.template.prefix}/{entry.template.name}
                </TableCell>
                <TableCell className="font-mono text-muted-foreground">
                  {entry.excludes.join(', ') || statusT('none')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Panel>

      <Dialog
        open={dialog !== null}
        onOpenChange={(next) => {
          if (!next) closeDialog()
        }}
      >
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>
              {dialog === 'inclusion'
                ? servicesT('addInclusion')
                : dialog === 'deployment'
                  ? servicesT('addDeployment')
                  : servicesT('addTemplate')}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {dialog === 'inclusion' ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="inclusion-url">{servicesT('url')}</Label>
                  <Input
                    id="inclusion-url"
                    className="font-mono"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inclusion-destination">
                    {servicesT('destination')}
                  </Label>
                  <Input
                    id="inclusion-destination"
                    className="font-mono"
                    value={destination}
                    onChange={(event) => setDestination(event.target.value)}
                  />
                </div>
              </>
            ) : (
              <>
                <TemplatePicker
                  storage={storage}
                  template={template}
                  onStorageChange={(value) => {
                    setStorage(value)
                    setTemplate('')
                  }}
                  onTemplateChange={setTemplate}
                />
                {dialog === 'template' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="template-priority">
                        {servicesT('priority')}
                      </Label>
                      <Input
                        id="template-priority"
                        className="font-mono tabular-nums"
                        inputMode="numeric"
                        value={priority}
                        onChange={(event) => setPriority(event.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="template-always-copy"
                        checked={alwaysCopy}
                        onCheckedChange={(value) =>
                          setAlwaysCopy(value === true)
                        }
                      />
                      <Label htmlFor="template-always-copy">
                        {servicesT('alwaysCopy')}
                      </Label>
                    </div>
                  </>
                )}
                {dialog === 'deployment' && (
                  <div className="space-y-2">
                    <Label htmlFor="deployment-excludes">
                      {servicesT('excludes')}
                    </Label>
                    <Input
                      id="deployment-excludes"
                      className="font-mono"
                      value={excludes}
                      placeholder={servicesT('excludesHint')}
                      onChange={(event) => setExcludes(event.target.value)}
                    />
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="resource-flush"
                checked={flush}
                onCheckedChange={(value) => setFlush(value === true)}
              />
              <Label htmlFor="resource-flush">{servicesT('flush')}</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              {servicesT('cancel')}
            </Button>
            <Button
              disabled={
                pending ||
                (dialog === 'inclusion'
                  ? url.trim() === '' || destination.trim() === ''
                  : pickedTemplate() === null)
              }
              onClick={() => {
                if (dialog === 'inclusion') void addInclusion()
                else if (dialog === 'deployment') void addDeployment()
                else void addTemplate()
              }}
            >
              {servicesT('add')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirm !== null}
        onOpenChange={(next) => {
          if (!next) {
            setConfirm(null)
            setTyped('')
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.title}</AlertDialogTitle>
            <AlertDialogDescription>{copy.description}</AlertDialogDescription>
          </AlertDialogHeader>
          {confirm === 'deploy' && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="deploy-remove"
                checked={removeDeployments}
                onCheckedChange={(value) =>
                  setRemoveDeployments(value === true)
                }
              />
              <Label htmlFor="deploy-remove">
                {servicesT('removeDeployments')}
              </Label>
            </div>
          )}
          {confirm === 'deleteFiles' && (
            <div className="space-y-2">
              <Label htmlFor="delete-files-confirm">
                {servicesT('typeNameToConfirm')}
              </Label>
              <Input
                id="delete-files-confirm"
                className="font-mono"
                value={typed}
                onChange={(event) => setTyped(event.target.value)}
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>{servicesT('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              disabled={confirm === 'deleteFiles' && typed !== name}
              onClick={runConfirm}
            >
              {copy.label}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
