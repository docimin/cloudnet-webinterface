import PageLayout from '@/components/pageLayout'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getPermissions } from '@/utils/server-api/getPermissions'
import NoAccess from '@/components/static/noAccess'
import { formatBytes } from '@/components/formatBytes'
import NoRecords from '@/components/static/noRecords'
import AutoRefresh from '@/components/autoRefresh'
import Link from 'next/link'
import { serverServiceApi } from '@/lib/server-api'
import { getTranslations } from 'gt-next/server'

export default async function ServicesPage() {
  const servicesT = await getTranslations('Services')
  const services = await serverServiceApi.list()
  const permissions = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:service_read',
    'cloudnet_rest:service_list',
    'global:admin'
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!services.services) {
    return <NoRecords />
  }

  return (
    <PageLayout title={servicesT('title')}>
      <AutoRefresh>
        <Table>
          <TableCaption>{servicesT('tableCaption')}</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">{servicesT('name')}</TableHead>
              <TableHead>{servicesT('state')}</TableHead>
              <TableHead>{servicesT('cpuUsage')}</TableHead>
              <TableHead>{servicesT('ramUsage')}</TableHead>
              <TableHead>{servicesT('players')}</TableHead>
              {requiredPermissions.some((permission) =>
                permissions.includes(permission)
              ) && (
                <TableHead className="sr-only">
                  {servicesT('details')}
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {services?.services
              .sort((a, b) =>
                a.configuration.serviceId.nodeUniqueId.localeCompare(
                  b.configuration.serviceId.nodeUniqueId
                )
              )
              .map((service) => {
                const cpuUsage = service?.processSnapshot.cpuUsage || 0
                const ramUsagePercentage =
                  (service?.processSnapshot.heapUsageMemory /
                    service?.processSnapshot.maxHeapMemory) *
                  100

                return (
                  <TableRow key={service?.configuration.serviceId.uniqueId}>
                    <TableCell className="font-medium">
                      {service?.configuration.serviceId.taskName}
                      {service?.configuration.serviceId.nameSplitter}
                      {service?.configuration.serviceId.taskServiceId}
                    </TableCell>
                    <TableCell>{service?.lifeCycle}</TableCell>
                    <TableCell
                      className={
                        cpuUsage < 50
                          ? 'text-green-500'
                          : cpuUsage < 80
                            ? 'text-yellow-500'
                            : 'text-red-500'
                      }
                    >
                      {cpuUsage.toFixed(2) + '%'}
                    </TableCell>
                    <TableCell
                      className={
                        ramUsagePercentage < 50
                          ? 'text-green-500'
                          : ramUsagePercentage < 80
                            ? 'text-yellow-500'
                            : 'text-red-500'
                      }
                    >
                      {servicesT('ramUsageFormat', {
                        used: formatBytes(
                          service?.processSnapshot?.heapUsageMemory
                        ),
                        max: formatBytes(
                          service?.processSnapshot?.maxHeapMemory
                        )
                      })}
                    </TableCell>
                    <TableCell>
                      {servicesT('onlineCount', {
                        current: service?.properties['Online-Count'] || '0',
                        max: service?.properties['Max-Players'] || '0'
                      })}
                    </TableCell>
                    {requiredPermissions.some((permission) =>
                      permissions.includes(permission)
                    ) && (
                      <TableCell>
                        <Link
                          href={`/dashboard/services/${service?.configuration.serviceId.uniqueId}`}
                        >
                          <Button
                            size={'sm'}
                            variant={'link'}
                            className={'p-0 text-right'}
                          >
                            {servicesT('details')}
                          </Button>
                        </Link>
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </AutoRefresh>
    </PageLayout>
  )
}
