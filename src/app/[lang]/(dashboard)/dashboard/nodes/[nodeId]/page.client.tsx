'use client'
import { Button } from '@/components/ui/button'
import { updateNode } from '@/utils/actions/nodes/updateNode'
import {
  CableIcon,
  DatabaseZapIcon,
  GitBranchIcon,
  MemoryStickIcon,
  ServerOffIcon,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'

export default function NodeClientPage({ node, nodeId }) {
  const { toast } = useToast()
  const handleSave = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())
    if (data.IP === '' || data.Port === '') {
      toast({
        title: 'Failed',
        description: 'IP and Port are required to update node',
        variant: 'destructive',
      })
      return
    }
    const response = await updateNode(nodeId, data.IP, data.Port)
    if (response.status === 200) {
      toast({
        title: 'Updated',
        description: 'Node updated successfully',
      })
    } else if (response.status === 500) {
      toast({
        title: 'Failed',
        description: 'Failed to update node',
        variant: 'destructive',
      })
    }
  }

  const stats = [
    {
      name: 'CPU Usage',
      icon: MemoryStickIcon,
      canEdit: false,
      value1:
        (node?.nodeInfoSnapshot.processSnapshot.cpuUsage).toFixed(2) + '%',
      value2:
        (node?.nodeInfoSnapshot.processSnapshot.systemCpuUsage).toFixed(2) +
        '%',
      value1Name: 'Node Usage',
      value2Name: 'System Usage',
    },
    {
      name: 'Memory',
      icon: MemoryStickIcon,
      canEdit: false,
      value1:
        node?.nodeInfoSnapshot && node?.nodeInfoSnapshot?.usedMemory + ' MB',
      value2:
        node?.nodeInfoSnapshot && node?.nodeInfoSnapshot?.maxMemory + ' MB',
      value1Name: 'Used Memory',
      value2Name: 'Max Memory',
    },
    {
      name: 'Amount of services',
      icon: DatabaseZapIcon,
      canEdit: false,
      value1: node?.nodeInfoSnapshot?.currentServicesCount,
      value2: '',
      value1Name: 'Current Services Count',
      value2Name: '',
    },
    {
      name: 'Drain Status',
      icon: ServerOffIcon,
      canEdit: false,
      value1: node?.nodeInfoSnapshot?.drain ? 'Draining' : 'Not Draining',
      value2: '',
      value1Name: 'Drain status',
      value2Name: '',
    },
    {
      name: 'Version',
      icon: GitBranchIcon,
      canEdit: false,
      value1: node?.nodeInfoSnapshot?.version?.major,
      value2: node?.nodeInfoSnapshot?.version?.versionType,
      value1Name: 'Major version',
      value2Name: 'Type',
    },
    {
      name: 'Connection details',
      icon: CableIcon,
      canEdit: true,
      value1: node?.node?.listeners?.[0].host,
      value2: node?.node?.listeners?.[0].port,
      value1Name: 'IP',
      value2Name: 'Port',
    },
  ]

  return (
    <form onSubmit={handleSave}>
      <div>
        <Button variant="outline" type="submit">
          Save
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