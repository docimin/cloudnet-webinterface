import PageLayout from '@/components/pageLayout'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import NoAccess from '@/components/static/noAccess'
import { getServices } from '@/utils/server-api/services/getServices'
import { formatBytes } from '@/components/formatBytes'
import NoRecords from '@/components/static/noRecords'
import AutoRefresh from '@/components/autoRefresh'
import Link from 'next/link'

export const runtime = 'edge'

export default async function ServicesPage(props) {
  const params = await props.params

  const { locale } = params

  const services: Services = await getServices()
  const permissions: string[] = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:service_read',
    'cloudnet_rest:service_list',
    'global:admin',
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
    <PageLayout title={'Services'}>
      <AutoRefresh>
        <Table>
          <TableCaption>A list of your services.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Name</TableHead>
              <TableHead>State</TableHead>
              <TableHead>CPU Usage</TableHead>
              <TableHead>RAM Usage</TableHead>
              <TableHead>Players</TableHead>
              {requiredPermissions.some((permission) =>
                permissions.includes(permission)
              ) && <TableHead className="sr-only">Details</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {services?.services
              .sort((a, b) =>
                a.configuration.serviceId.nodeUniqueId.localeCompare(
                  b.configuration.serviceId.nodeUniqueId
                )
              )
              .map((service) => (
                <TableRow key={service?.configuration.serviceId.uniqueId}>
                  <TableCell className="font-medium">
                    {service?.configuration.serviceId.taskName}
                    {service?.configuration.serviceId.nameSplitter}
                    {service?.configuration.serviceId.taskServiceId}
                  </TableCell>
                  <TableCell>{service?.lifeCycle}</TableCell>
                  <TableCell>
                    {service?.processSnapshot.cpuUsage.toFixed(2) + '%'}
                  </TableCell>
                  <TableCell>
                    {formatBytes(service?.processSnapshot.heapUsageMemory)} /{' '}
                    {formatBytes(service?.processSnapshot.maxHeapMemory)}
                  </TableCell>
                  <TableCell>
                    {service?.properties['Online-Count'] || '0'} /{' '}
                    {service?.properties['Max-Players'] || '0'}
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
                          Details
                        </Button>
                      </Link>
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </AutoRefresh>
    </PageLayout>
  )
}
