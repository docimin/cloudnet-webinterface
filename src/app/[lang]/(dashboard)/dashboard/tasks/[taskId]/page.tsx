import PageLayout from '@/components/pageLayout'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import NoAccess from '@/components/static/noAccess'
import DoesNotExist from '@/components/static/doesNotExist'
import {
  CaseLowerIcon,
  ConstructionIcon,
  FolderXIcon,
  RefreshCcwIcon,
  SplitIcon,
} from 'lucide-react'
import { DashboardCard } from '@/components/dashboardCard'
import { getTask } from '@/utils/server-api/tasks/getTask'
import TaskClientPage from '@/app/[lang]/(dashboard)/dashboard/tasks/[taskId]/page.client'

export const runtime = 'edge'

export default async function UserPage({ params: { lang, taskId } }) {
  const task: Task = await getTask(taskId)
  const taskConfigData = JSON.stringify(task, null, 2)
  const permissions: any = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:task_read',
    'cloudnet_rest:task_get',
    'global:admin',
  ]
  const requiredEditPermissions = [
    'cloudnet_rest:task_write',
    'cloudnet_rest:task_create',
    'global:admin',
  ]
  const requiredDeletePermissions = [
    'cloudnet_rest:task_write',
    'cloudnet_rest:task_delete',
    'global:admin',
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )
  const hasEditPermissions = requiredEditPermissions.some((permission) =>
    permissions.includes(permission)
  )
  const hasDeletePermissions = requiredDeletePermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!task?.name) {
    return <DoesNotExist name={'Task'} />
  }

  return (
    <PageLayout title={`Edit ${task?.name}`}>
      <TaskClientPage
        taskId={taskId}
        hasEditPermissions={hasEditPermissions}
        hasDeletePermissions={hasDeletePermissions}
        taskConfigData={taskConfigData}
      >
        <div className="flex flex-1 flex-col gap-4 md:gap-8 mt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <DashboardCard
              title="Name"
              icon={<CaseLowerIcon className="w-4 h-4" />}
              value={task?.name}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin',
              ]}
            />
            <DashboardCard
              title="Splitter"
              icon={<SplitIcon className="w-4 h-4" />}
              value={task?.nameSplitter}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin',
              ]}
            />
            <DashboardCard
              title="Maintenance"
              icon={<ConstructionIcon className="w-4 h-4" />}
              value={task?.maintenance ? 'Yes' : 'No'}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin',
              ]}
            />
            <DashboardCard
              title="Is Static"
              icon={<RefreshCcwIcon className="w-4 h-4" />}
              value={task?.staticServices ? 'Yes' : 'No'}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin',
              ]}
            />
            <DashboardCard
              title="Auto deletion"
              icon={<FolderXIcon className="w-4 h-4" />}
              value={task?.autoDeleteOnStop ? 'Yes' : 'No'}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin',
              ]}
            />
            <DashboardCard
              title="Min. Service count"
              icon={<FolderXIcon className="w-4 h-4" />}
              value={task?.minServiceCount}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin',
              ]}
            />
            <DashboardCard
              title="Start port"
              icon={<FolderXIcon className="w-4 h-4" />}
              value={task?.startPort}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin',
              ]}
            />
            <DashboardCard
              title="Max. Memory"
              icon={<FolderXIcon className="w-4 h-4" />}
              value={`${task?.processConfiguration?.maxHeapMemorySize} MB`}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin',
              ]}
            />
          </div>
        </div>
      </TaskClientPage>
    </PageLayout>
  )
}
