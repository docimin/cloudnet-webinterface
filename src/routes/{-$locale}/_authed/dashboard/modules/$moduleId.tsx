import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { useState } from 'react'
import { toast } from 'sonner'
import PageLayout from '@/components/pageLayout'
import DoesNotExist from '@/components/static/doesNotExist'
import NoAccess from '@/components/static/noAccess'
import { StatusIndicator } from '@/components/status'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { moduleStatus } from '@/lib/cloudnetStatus'
import { cn } from '@/lib/utils'
import { currentPermissions } from '@/server/auth'
import {
  moduleGet,
  moduleGetConfig,
  moduleLifecycle,
  moduleUninstall,
  moduleUpdate
} from '@/server/module'
import { type Module, Target } from '@/utils/types/modules'

const requiredPermissions = [
  'cloudnet_rest:module_read',
  'cloudnet_rest:module_get',
  'global:admin'
]
const requiredConfigPermissions = [
  'cloudnet_rest:module_read',
  'cloudnet_rest:module_config_get',
  'cloudnet_rest:module_config_get_sensitive',
  'global:admin'
]

export const Route = createFileRoute(
  '/{-$locale}/_authed/dashboard/modules/$moduleId'
)({
  loader: async ({ params }) => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )
    const hasConfigPermissions = requiredConfigPermissions.some((permission) =>
      permissions.includes(permission)
    )

    let module: Module | null = null
    if (hasPermissions) {
      try {
        module = await moduleGet({ data: { id: params.moduleId } })
      } catch {
        module = null
      }
    }

    // null means "not loaded" — never seed the editor with a fabricated config
    let moduleConfig: Record<string, unknown> | null = null
    if (hasConfigPermissions) {
      try {
        moduleConfig = await moduleGetConfig({ data: { id: params.moduleId } })
      } catch {
        moduleConfig = null
      }
    }

    return { hasPermissions, hasConfigPermissions, module, moduleConfig }
  },
  component: ModulePage
})

function Detail({
  label,
  value,
  mono = true,
  className
}: {
  label: string
  value?: string
  mono?: boolean
  className?: string
}) {
  return (
    <div className={cn('space-y-1', className)}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn('text-sm break-words', mono && 'font-mono')}>
        {value || '—'}
      </dd>
    </div>
  )
}

function ModulePage() {
  const { moduleId } = Route.useParams()
  const { hasPermissions, hasConfigPermissions, module, moduleConfig } =
    Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const navigationT = useTranslations('Navigation')
  const modulesT = useTranslations('Modules')
  const statusT = useTranslations('Status')
  const mainT = useTranslations('Main')
  const canEditConfig = moduleConfig !== null
  const [moduleConfigData, setModuleConfigData] = useState(
    canEditConfig ? JSON.stringify(moduleConfig, null, 2) : ''
  )

  const handleModuleConfigSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()
    if (!canEditConfig) return

    await moduleUpdate({
      data: { id: moduleId, config: JSON.parse(moduleConfigData) }
    })
    toast.success(modulesT('moduleConfigUpdated'))
  }

  const handleLifecycle = async (event: Target) => {
    await moduleLifecycle({ data: { id: moduleId, target: event } })
    toast.success(modulesT('lifecycleUpdated'))
    router.invalidate()
  }

  const handleUninstall = async () => {
    await moduleUninstall({ data: { id: moduleId } })
    toast.success(modulesT('moduleUninstalled'))
    navigate({ to: '/{-$locale}/dashboard/modules' })
  }

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!module?.configuration?.name) {
    return <DoesNotExist name={navigationT('modules')} />
  }

  const status = moduleStatus(module.lifecycle)

  return (
    <PageLayout title={module.configuration.name}>
      <form onSubmit={handleModuleConfigSave} className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <StatusIndicator
              status={status}
              label={statusT(status)}
              showLabel
            />
            <span className="font-mono text-xs text-muted-foreground">
              {module.lifecycle}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {canEditConfig && (
              <Button size="sm" type="submit">
                {mainT('save')}
              </Button>
            )}
            {module.lifecycle !== 'STARTED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleLifecycle(Target.START)}
                type={'button'}
              >
                {modulesT('start')}
              </Button>
            )}
            {module.lifecycle === 'STARTED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleLifecycle(Target.RELOAD)}
                type={'button'}
              >
                {modulesT('reload')}
              </Button>
            )}
            {module.lifecycle !== 'STOPPED' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleLifecycle(Target.STOP)}
                type={'button'}
              >
                {modulesT('stop')}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleLifecycle(Target.UNLOAD)}
              type={'button'}
            >
              {modulesT('unload')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleUninstall}
              type={'button'}
            >
              {modulesT('uninstall')}
            </Button>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-4 rounded-lg border p-4 sm:grid-cols-2 lg:grid-cols-3">
          <Detail
            label={modulesT('version')}
            value={module.configuration.version}
          />
          <Detail
            label={modulesT('author')}
            value={module.configuration.author}
          />
          <Detail
            label={modulesT('group')}
            value={module.configuration.group}
          />
          <Detail
            label={modulesT('description')}
            value={module.configuration.description}
            mono={false}
            className="sm:col-span-2 lg:col-span-3"
          />
        </dl>

        <div className="space-y-2">
          <Label htmlFor="json">{modulesT('json')}</Label>
          {canEditConfig ? (
            <Textarea
              name="json"
              id="json"
              className="h-96 font-mono text-xs"
              required
              value={moduleConfigData}
              onChange={(event) => setModuleConfigData(event.target.value)}
            />
          ) : (
            <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
              {hasConfigPermissions
                ? modulesT('configUnavailable')
                : modulesT('configNoAccess')}
            </p>
          )}
        </div>
      </form>
    </PageLayout>
  )
}
