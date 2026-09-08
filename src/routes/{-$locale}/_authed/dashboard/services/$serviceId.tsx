import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import {
  LayersIcon,
  MemoryStickIcon,
  UsersIcon,
  WorkflowIcon
} from 'lucide-react'
import ServiceConsole from '@/components/console'
import DetailField from '@/components/detailField'
import { formatBytes } from '@/components/formatBytes'
import Meter, { loadTone } from '@/components/meter'
import PageLayout from '@/components/pageLayout'
import DoesNotExist from '@/components/static/doesNotExist'
import NoAccess from '@/components/static/noAccess'
import { StatusIndicator } from '@/components/status'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { serviceStatus } from '@/lib/cloudnetStatus'
import { cn } from '@/lib/utils'
import { currentPermissions } from '@/server/auth'
import { serviceGet } from '@/server/service'
import ServiceActions from './-serviceClient'
import ServiceResources from './-serviceResources'

const requiredPermissions = [
  'cloudnet_rest:service_read',
  'cloudnet_rest:service_get',
  'global:admin'
]
const requiredEditPermissions = [
  'cloudnet_rest:service_write',
  'cloudnet_rest:service_lifecycle',
  'global:admin'
]
const requiredDeletePermissions = [
  'cloudnet_rest:service_write',
  'cloudnet_rest:service_delete',
  'global:admin'
]

const requiredSnapshotPermissions = [
  'cloudnet_rest:service_write',
  'cloudnet_rest:service_deploy_resources',
  'global:admin'
]

const requiredConsolePermissions = [
  'cloudnet_rest:service_read',
  'cloudnet_rest:service_live_log',
  'global:admin'
]

export const Route = createFileRoute(
  '/{-$locale}/_authed/dashboard/services/$serviceId'
)({
  loader: async ({ params }) => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )

    if (!hasPermissions) {
      return { permissions, hasPermissions, service: null }
    }

    try {
      const service = await serviceGet({ data: { id: params.serviceId } })
      return { permissions, hasPermissions, service }
    } catch {
      return { permissions, hasPermissions, service: null }
    }
  },
  component: ServicePage
})

function Section({
  title,
  icon,
  footer,
  children
}: {
  title: string
  icon: React.ReactNode
  footer?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <span className="text-muted-foreground">{icon}</span>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="text-sm">{children}</dl>
        {footer}
      </CardContent>
    </Card>
  )
}

function LoadRow({
  label,
  value,
  percent
}: {
  label: string
  value: string
  percent: number
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span
          className={cn('font-mono text-xs tabular-nums', loadTone(percent))}
        >
          {value}
        </span>
      </div>
      <Meter value={percent} label={label} valueText={value} />
    </div>
  )
}

function ServicePage() {
  const { serviceId } = Route.useParams()
  const { permissions, hasPermissions, service } = Route.useLoaderData()
  const serviceT = useTranslations('Services')
  const statusT = useTranslations('Status')

  const hasEditPermissions = requiredEditPermissions.some((permission) =>
    permissions.includes(permission)
  )
  const hasDeletePermissions = requiredDeletePermissions.some((permission) =>
    permissions.includes(permission)
  )
  const hasSnapshotPermissions = requiredSnapshotPermissions.some(
    (permission) => permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!service) {
    return <DoesNotExist name={serviceT('name')} />
  }

  const serviceConfigData = JSON.stringify(service, null, 2)
  const identity = service.configuration.serviceId
  const status = serviceStatus(service.lifeCycle)
  const snapshot = service.processSnapshot
  const cpuPercent = snapshot.cpuUsage || 0
  const memoryPercent = snapshot.maxHeapMemory
    ? (snapshot.heapUsageMemory / snapshot.maxHeapMemory) * 100
    : 0
  const memoryText = `${memoryPercent.toFixed(0)}% ${statusT('ofCapacity')}`

  const name =
    identity.taskName + identity.nameSplitter + identity.taskServiceId ||
    serviceT('name')

  return (
    <PageLayout title={name}>
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <StatusIndicator
                status={status}
                label={statusT(status)}
                showLabel
              />
              <h2 className="font-mono text-lg font-semibold">{name}</h2>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              {identity.uniqueId}
            </p>
          </div>
          <ServiceActions
            serviceId={serviceId}
            name={name}
            taskName={identity.taskName}
            lifeCycle={service.lifeCycle}
            hasLifecyclePermissions={hasEditPermissions}
            hasDeletePermissions={hasDeletePermissions}
            hasSnapshotPermissions={hasSnapshotPermissions}
          />
        </div>

        <Tabs defaultValue={'config'}>
          <TabsList>
            <TabsTrigger value={'config'}>
              {serviceT('configuration')}
            </TabsTrigger>
            <TabsTrigger value={'resources'}>
              {serviceT('resourcesTab')}
            </TabsTrigger>
            {requiredConsolePermissions.some((permission) =>
              permissions.includes(permission)
            ) && (
              <TabsTrigger value={'console'}>{serviceT('console')}</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value={'config'} className="pt-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
              <Section
                title={serviceT('resources')}
                icon={<MemoryStickIcon className="size-4" />}
                footer={
                  <div className="space-y-3">
                    <LoadRow
                      label={serviceT('serviceCpuUsage')}
                      value={`${cpuPercent.toFixed(2)}%`}
                      percent={cpuPercent}
                    />
                    <LoadRow
                      label={serviceT('memory')}
                      value={memoryText}
                      percent={memoryPercent}
                    />
                  </div>
                }
              >
                <DetailField
                  label={serviceT('usedMemory')}
                  value={
                    snapshot.heapUsageMemory
                      ? formatBytes(snapshot.heapUsageMemory)
                      : '—'
                  }
                />
                <DetailField
                  label={serviceT('maxMemory')}
                  value={
                    snapshot.maxHeapMemory
                      ? formatBytes(snapshot.maxHeapMemory)
                      : '—'
                  }
                />
              </Section>

              <Section
                title={serviceT('players')}
                icon={<UsersIcon className="size-4" />}
              >
                <DetailField
                  label={serviceT('onlinePlayers')}
                  value={String(service.properties['Online-Count'] ?? 0)}
                />
                <DetailField
                  label={serviceT('maxPlayers')}
                  value={String(service.properties['Max-Players'] ?? 0)}
                />
                <DetailField
                  label={serviceT('version')}
                  value={service.properties.Version || '—'}
                />
              </Section>

              <Section
                title={serviceT('placement')}
                icon={<WorkflowIcon className="size-4" />}
              >
                <DetailField
                  label={serviceT('node')}
                  value={identity.nodeUniqueId || '—'}
                />
                <DetailField
                  label={serviceT('environment')}
                  value={identity.environmentName || '—'}
                />
                <DetailField
                  label={serviceT('address')}
                  value={`${service.address.host}:${service.address.port}`}
                />
                <DetailField
                  label={serviceT('createdAt')}
                  value={
                    service.connectedTime
                      ? new Date(service.connectedTime).toLocaleString()
                      : '—'
                  }
                />
              </Section>

              <Section
                title={serviceT('deployment')}
                icon={<LayersIcon className="size-4" />}
              >
                <DetailField
                  label={serviceT('groups')}
                  value={
                    service.configuration.groups.join(', ') || statusT('none')
                  }
                />
                <DetailField
                  label={serviceT('templates')}
                  value={
                    service.configuration.templates
                      .map(
                        (template) =>
                          `${template.storage}:${template.prefix}/${template.name}`
                      )
                      .join(', ') || statusT('none')
                  }
                />
                <DetailField
                  label={serviceT('runtime')}
                  value={service.configuration.runtime || '—'}
                />
              </Section>
            </div>

            <div className="mt-6">
              <Label htmlFor="json">{serviceT('json')}</Label>
              <Textarea
                name="json"
                id="json"
                className={'mt-2 h-96 font-mono text-xs'}
                value={serviceConfigData}
                disabled
              />
            </div>
          </TabsContent>
          <TabsContent value={'resources'} className="pt-4">
            <ServiceResources
              serviceId={serviceId}
              service={service}
              permissions={permissions}
            />
          </TabsContent>
          {requiredConsolePermissions.some((permission) =>
            permissions.includes(permission)
          ) && (
            <TabsContent value={'console'} className="pt-4">
              <ServiceConsole
                serviceName={name}
                webSocketPath={`/service/${name}/liveLog`}
                type={'service'}
              />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </PageLayout>
  )
}
