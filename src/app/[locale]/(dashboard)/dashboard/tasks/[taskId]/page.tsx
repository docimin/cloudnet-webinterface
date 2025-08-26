import PageLayout from '@/components/pageLayout'
import { getPermissions } from '@/utils/server-api/getPermissions'
import NoAccess from '@/components/static/noAccess'
import DoesNotExist from '@/components/static/doesNotExist'
import {
  CaseLowerIcon,
  ChevronsLeftRightIcon,
  ConstructionIcon,
  MemoryStickIcon,
  RefreshCcwIcon,
  ScaleIcon,
  SplitIcon
} from 'lucide-react'
import { DashboardCard } from '@/components/dashboardCard'
import TaskClientPage from './page.client'
import { serverTaskApi } from '@/lib/server-api'
import { Task } from '@/utils/types/tasks'
import { getTranslations } from 'gt-next/server'

export default async function UserPage(props) {
  const params = await props.params
  const { taskId } = params
  const taskT = await getTranslations('Tasks')

  const permissions = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:task_read',
    'cloudnet_rest:task_get',
    'global:admin'
  ]
  const requiredEditPermissions = [
    'cloudnet_rest:task_write',
    'cloudnet_rest:task_create',
    'global:admin'
  ]
  const requiredDeletePermissions = [
    'cloudnet_rest:task_write',
    'cloudnet_rest:task_delete',
    'global:admin'
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

  let task: Task | null = null
  try {
    task = await serverTaskApi.get(taskId)
  } catch {
    return <DoesNotExist name={taskT('name')} />
  }
  const taskConfigData = JSON.stringify(task, null, 2)

  return (
    <PageLayout title={taskT('editTitle', { name: task?.name })}>
      <TaskClientPage
        taskName={task?.name}
        taskId={taskId}
        hasEditPermissions={hasEditPermissions}
        hasDeletePermissions={hasDeletePermissions}
        taskConfigData={taskConfigData}
      >
        <div className="flex flex-1 flex-col gap-4 md:gap-8 mt-8">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <DashboardCard
              title={taskT('name')}
              icon={<CaseLowerIcon className="w-4 h-4" />}
              value={task?.name}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin'
              ]}
            />
            <DashboardCard
              title={taskT('splitter')}
              icon={<SplitIcon className="w-4 h-4" />}
              value={task?.nameSplitter}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin'
              ]}
            />
            <DashboardCard
              title={taskT('maintenance')}
              icon={<ConstructionIcon className="w-4 h-4" />}
              value={task?.maintenance ? taskT('yes') : taskT('no')}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin'
              ]}
            />
            <DashboardCard
              title={taskT('isStatic')}
              icon={<RefreshCcwIcon className="w-4 h-4" />}
              value={task?.staticServices ? taskT('yes') : taskT('no')}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin'
              ]}
            />
            <DashboardCard
              title={taskT('minServiceCount')}
              icon={<ScaleIcon className="w-4 h-4" />}
              value={task?.minServiceCount}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin'
              ]}
            />
            <DashboardCard
              title={taskT('startPort')}
              icon={<ChevronsLeftRightIcon className="w-4 h-4" />}
              value={task?.startPort}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin'
              ]}
            />
            <DashboardCard
              title={taskT('maxMemory')}
              icon={<MemoryStickIcon className="w-4 h-4" />}
              value={`${task?.processConfiguration?.maxHeapMemorySize} MB`}
              permissions={[
                'cloudnet_rest:task_read',
                'cloudnet_rest:task_get',
                'global:admin'
              ]}
            />
          </div>
        </div>
      </TaskClientPage>
    </PageLayout>
  )
}
