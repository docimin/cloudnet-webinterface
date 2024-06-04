import { Button } from '@/components/ui/button'
import {
  CableIcon,
  DatabaseZapIcon,
  GitBranchIcon,
  MemoryStickIcon,
  ServerOffIcon,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatBytes } from '@/components/formatBytes'
import { getService } from '@/utils/server-api/services/getService'
import PageLayout from '@/components/pageLayout'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export const runtime = 'edge'

export default async function ServiceClientPage({
  params: { serviceId, lang },
}) {
  const service: Service = await getService(serviceId)
  const serviceConfigData = JSON.stringify(service, null, 2)

  const stats = [
    {
      name: 'Memory',
      icon: MemoryStickIcon,
      canEdit: false,
      value1: service?.processSnapshot?.cpuUsage
        ? formatBytes(service?.processSnapshot.heapUsageMemory)
        : 'N/A',
      value2: service?.processSnapshot.maxHeapMemory
        ? formatBytes(service?.processSnapshot.maxHeapMemory)
        : 'N/A',
      value1Name: 'Used Memory',
      value2Name: 'Max Memory',
    },
    {
      name: 'CPU',
      icon: DatabaseZapIcon,
      canEdit: false,
      value1: service?.processSnapshot.cpuUsage.toFixed(2) + '%' || 'N/A',
      value2: '',
      value1Name: 'Service CPU Usage',
      value2Name: '',
    },
    {
      name: 'Created',
      icon: ServerOffIcon,
      canEdit: false,
      value1: service?.connectedTime
        ? new Date(service?.connectedTime).toLocaleString()
        : 'N/A',
      value2: '',
      value1Name: 'Created at',
      value2Name: '',
    },
    {
      name: 'Version',
      icon: ServerOffIcon,
      canEdit: false,
      value1: service?.properties.Version || 'N/A',
      value2: '',
      value1Name: 'MC Version',
      value2Name: '',
    },
  ]

  return (
    <PageLayout
      title={
        service?.configuration.serviceId.taskName +
          service?.configuration.serviceId.nameSplitter +
          service?.configuration.serviceId.taskServiceId || 'Service'
      }
    >
      <ul
        role="list"
        className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8 pt-4"
      >
        {stats.map((stats, index) => (
          <li
            key={index}
            className="overflow-hidden rounded-xl border border-gray-200"
          >
            <div className="flex items-center gap-x-4 border-b bg-transparent p-6 divider text-light-color">
              <stats.icon />
              <div className="text-sm font-medium leading-6 text-light-color">
                {stats.name}
              </div>
              <div className="ml-auto">
                {stats.canEdit ? 'Can edit' : 'View only'}
              </div>
            </div>
            <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3 items-center">
                <dt className="text-light-color">{stats.value1Name}</dt>
                <dd className="text-light-color flex items-center">
                  <div className="">
                    <Input
                      type="text"
                      name={stats.value1Name}
                      className="text-sm rounded bg-transparent w-52"
                      defaultValue={stats.value1}
                      disabled={stats.canEdit === false}
                      hidden={!stats.value1}
                    />
                  </div>
                </dd>
              </div>

              {stats.value2 && (
                <div className="flex justify-between gap-x-4 py-3 items-center">
                  <dt className="text-light-color">{stats.value2Name}</dt>
                  <dd className="flex items-start gap-x-2">
                    <div className="text-light-color">
                      <Input
                        type="text"
                        name={stats.value2Name}
                        className="text-sm rounded bg-transparent w-52"
                        defaultValue={stats.value2}
                        disabled={stats.canEdit === false}
                      />
                    </div>
                  </dd>
                </div>
              )}
            </dl>
          </li>
        ))}
      </ul>

      {serviceConfigData && (
        <div className="w-full mt-8">
          <Label htmlFor="json">JSON</Label>
          <div className="mt-2">
            <Textarea
              name="json"
              id="json"
              className={'h-96'}
              value={serviceConfigData}
              disabled
            />
          </div>
        </div>
      )}
    </PageLayout>
  )
}
