import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { PlusIcon } from 'lucide-react'
import AutoRefresh from '@/components/autoRefresh'
import { formatBytes } from '@/components/formatBytes'
import Meter, { loadTone } from '@/components/meter'
import PageHeader from '@/components/pageHeader'
import PageLayout from '@/components/pageLayout'
import NoAccess from '@/components/static/noAccess'
import NoRecords from '@/components/static/noRecords'
import { StatusIndicator } from '@/components/status'
import StatusTally from '@/components/statusTally'
import TableEmpty from '@/components/tableEmpty'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { serviceStatus, tally } from '@/lib/cloudnetStatus'
import { cn } from '@/lib/utils'
import { currentPermissions } from '@/server/auth'
import { serviceList } from '@/server/service'

const requiredPermissions = [
  'cloudnet_rest:service_read',
  'cloudnet_rest:service_list',
  'global:admin'
]

const requiredCreatePermissions = [
  'cloudnet_rest:service_write',
  'cloudnet_rest:service_create_task_name',
  'cloudnet_rest:service_create_task',
  'global:admin'
]

const SERVICE_ROUTE = '/{-$locale}/dashboard/services/$serviceId'

export const Route = createFileRoute('/{-$locale}/_authed/dashboard/services/')(
  {
    loader: async () => {
      const permissions = await currentPermissions()
      const hasPermissions = requiredPermissions.some((permission) =>
        permissions.includes(permission)
      )
      return {
        permissions,
        hasPermissions,
        services: hasPermissions ? await serviceList() : null
      }
    },
    component: ServicesPage
  }
)

function ServicesPage() {
  const servicesT = useTranslations('Services')
  const statusT = useTranslations('Status')
  const navigate = useNavigate()
  const { permissions, hasPermissions, services } = Route.useLoaderData()

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!services?.services) {
    return <NoRecords />
  }

  const canOpenDetails = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )
  const canCreate = requiredCreatePermissions.some((permission) =>
    permissions.includes(permission)
  )

  const list = [...services.services]
    .filter((service) => Boolean(service?.configuration?.serviceId?.uniqueId))
    .sort((a, b) =>
      (a.configuration.serviceId.nodeUniqueId ?? '').localeCompare(
        b.configuration.serviceId.nodeUniqueId ?? ''
      )
    )

  const counts = tally(list, (service) => serviceStatus(service.lifeCycle))

  return (
    <PageLayout title={servicesT('title')}>
      <AutoRefresh>
        <div className="flex flex-col gap-4">
          <PageHeader count={list.length} caption={servicesT('tableCaption')}>
            <StatusTally counts={counts} />
            {canCreate && (
              <Button size="sm" asChild>
                <Link to="/{-$locale}/dashboard/services/create">
                  <PlusIcon className="mr-2 size-4" />
                  {servicesT('createService')}
                </Link>
              </Button>
            )}
          </PageHeader>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-32">{servicesT('state')}</TableHead>
                  <TableHead>{servicesT('name')}</TableHead>
                  <TableHead>{servicesT('node')}</TableHead>
                  <TableHead className="text-right">
                    {servicesT('players')}
                  </TableHead>
                  <TableHead className="text-right">
                    {servicesT('cpuUsage')}
                  </TableHead>
                  <TableHead className="text-right">
                    {servicesT('ramUsage')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.length === 0 && (
                  <TableEmpty
                    colSpan={6}
                    title={servicesT('noServices')}
                    description={servicesT('noServicesDescription')}
                  />
                )}
                {list.map((service) => {
                  const serviceId = service.configuration.serviceId
                  const name = `${serviceId.taskName}${serviceId.nameSplitter}${serviceId.taskServiceId}`
                  const status = serviceStatus(service.lifeCycle)
                  const cpuUsage = service.processSnapshot.cpuUsage || 0
                  const ramUsage =
                    (service.processSnapshot.heapUsageMemory /
                      service.processSnapshot.maxHeapMemory) *
                    100
                  const cpuText = `${cpuUsage.toFixed(2)}%`
                  const ramText = servicesT('ramUsageFormat', {
                    used: formatBytes(service.processSnapshot.heapUsageMemory),
                    max: formatBytes(service.processSnapshot.maxHeapMemory)
                  })

                  return (
                    <TableRow
                      key={serviceId.uniqueId}
                      onClick={
                        canOpenDetails
                          ? () =>
                              navigate({
                                to: SERVICE_ROUTE,
                                params: { serviceId: serviceId.uniqueId }
                              })
                          : undefined
                      }
                      className={cn(
                        'hover:bg-muted/50',
                        canOpenDetails && 'cursor-pointer'
                      )}
                    >
                      <TableCell>
                        <StatusIndicator
                          status={status}
                          label={statusT(status)}
                          showLabel
                        />
                      </TableCell>
                      <TableCell className="font-mono font-medium">
                        {canOpenDetails ? (
                          <Link
                            to={SERVICE_ROUTE}
                            params={{ serviceId: serviceId.uniqueId }}
                            onClick={(event) => event.stopPropagation()}
                            className="hover:underline focus-visible:underline"
                          >
                            {name}
                          </Link>
                        ) : (
                          name
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-muted-foreground">
                        {serviceId.nodeUniqueId}
                      </TableCell>
                      <TableCell className="text-right font-mono tabular-nums">
                        {servicesT('onlineCount', {
                          current: service.properties['Online-Count'] || '0',
                          max: service.properties['Max-Players'] || '0'
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Meter
                            value={cpuUsage}
                            label={servicesT('cpuUsage')}
                            valueText={cpuText}
                            className="w-16 max-md:hidden"
                          />
                          <span
                            className={cn(
                              'font-mono tabular-nums',
                              loadTone(cpuUsage)
                            )}
                          >
                            {cpuText}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Meter
                            value={ramUsage}
                            label={servicesT('ramUsage')}
                            valueText={ramText}
                            className="w-16 max-md:hidden"
                          />
                          <span
                            className={cn(
                              'font-mono tabular-nums',
                              loadTone(ramUsage)
                            )}
                          >
                            {ramText}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </AutoRefresh>
    </PageLayout>
  )
}
