'use client'
import { Button } from '@/components/ui/button'
import { nodeApi } from '@/lib/client-api'
import {
  CableIcon,
  DatabaseZapIcon,
  GitBranchIcon,
  MemoryStickIcon,
  ServerOffIcon
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Nodes } from '@/utils/types/nodes'
import { toast } from 'sonner'
import { useTranslations } from 'gt-next/client'

export default function NodeClientPage({
  node,
  nodeId
}: {
  node: Nodes
  nodeId: string
}) {
  const nodesT = useTranslations('Nodes')
  const mainT = useTranslations('Main')

  const handleSave = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())
    const ip = data.IP?.toString() || ''
    const port = data.Port?.toString() || ''

    if (ip === '' || port === '') {
      toast.error(nodesT('ipPortRequired'))
      return
    }
    const response = await nodeApi.update(nodeId, ip, port)
    if (response.status === 200) {
      toast.success(nodesT('nodeUpdated'))
    } else {
      toast.error(nodesT('updateFailed'))
    }
  }

  const stats = [
    {
      name: nodesT('cpuUsage'),
      icon: MemoryStickIcon,
      canEdit: false,
      value1: node?.nodeInfoSnapshot?.processSnapshot?.cpuUsage
        ? node.nodeInfoSnapshot.processSnapshot.cpuUsage.toFixed(2) + '%'
        : 'N/A',
      value2: node?.nodeInfoSnapshot?.processSnapshot?.systemCpuUsage
        ? node.nodeInfoSnapshot.processSnapshot.systemCpuUsage.toFixed(2) + '%'
        : 'N/A',
      value1Name: nodesT('nodeUsage'),
      value2Name: nodesT('systemUsage')
    },
    {
      name: nodesT('memory'),
      icon: MemoryStickIcon,
      canEdit: false,
      value1: node?.nodeInfoSnapshot?.usedMemory
        ? node.nodeInfoSnapshot.usedMemory + ' MB'
        : 'N/A',
      value2: node?.nodeInfoSnapshot?.maxMemory
        ? node.nodeInfoSnapshot.maxMemory + ' MB'
        : 'N/A',
      value1Name: nodesT('usedMemory'),
      value2Name: nodesT('maxMemory')
    },
    {
      name: nodesT('servicesCount'),
      icon: DatabaseZapIcon,
      canEdit: false,
      value1: node?.nodeInfoSnapshot?.currentServicesCount || 0,
      value2: '',
      value1Name: nodesT('currentServicesCount'),
      value2Name: ''
    },
    {
      name: nodesT('drainStatus'),
      icon: ServerOffIcon,
      canEdit: false,
      value1: node?.nodeInfoSnapshot?.drain
        ? nodesT('draining')
        : nodesT('notDraining'),
      value2: '',
      value1Name: nodesT('drainStatus'),
      value2Name: ''
    },
    {
      name: nodesT('version'),
      icon: GitBranchIcon,
      canEdit: false,
      value1: node?.nodeInfoSnapshot?.version?.major || 'N/A',
      value2: node?.nodeInfoSnapshot?.version?.versionType,
      value1Name: nodesT('version'),
      value2Name: nodesT('version')
    },
    {
      name: nodesT('connectionDetails'),
      icon: CableIcon,
      canEdit: true,
      value1: node?.node?.listeners?.[0].host,
      value2: node?.node?.listeners?.[0].port,
      value1Name: nodesT('ip'),
      value2Name: nodesT('port')
    }
  ]

  return (
    <form onSubmit={handleSave}>
      <div>
        <Button variant="outline" type="submit">
          {mainT('save')}
        </Button>
      </div>
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
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-light-color">{stats.value1Name}</dt>
                <dd className="text-light-color flex items-center">
                  <div className="">
                    <Input
                      type="text"
                      name={stats.value1Name}
                      className="text-sm rounded bg-transparent w-36"
                      defaultValue={stats.value1}
                      disabled={stats.canEdit === false}
                      hidden={!stats.value1}
                    />
                  </div>
                </dd>
              </div>

              {stats.value2 && (
                <div className="flex justify-between gap-x-4 py-3">
                  <dt className="text-light-color">{stats.value2Name}</dt>
                  <dd className="flex items-start gap-x-2">
                    <div className="text-light-color">
                      <Input
                        type="text"
                        name={stats.value2Name}
                        className="text-sm rounded bg-transparent w-36"
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
    </form>
  )
}
