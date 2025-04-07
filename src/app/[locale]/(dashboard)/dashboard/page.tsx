import PageLayout from '@/components/pageLayout'
import { UsersIcon } from 'lucide-react'
import { DashboardCard } from '@/components/dashboardCard'
import Link from 'next/link'
import AutoRefresh from '@/components/autoRefresh'
import {
  serverPlayerApi,
  serverNodeApi,
  serverModuleApi,
  serverGroupApi,
  serverTaskApi,
  serverServiceApi,
  serverUserApi,
  serverStorageApi,
} from '@/lib/server-api'
import { Modules } from '@/utils/types/modules'
import { NodesType } from '@/utils/types/nodes'
import { TasksType } from '@/utils/types/tasks'

export const runtime = 'edge'

export default async function DashboardPage() {
  let onlinePlayers: OnlinePlayersCount = { onlineCount: 0 }
  let registeredPlayers: RegisteredPlayersCount = { registeredCount: 0 }
  let nodes: NodesType = { nodes: [] }
  let loadedModules: Modules = { modules: [] }
  let groups: GroupsType = { groups: [] }
  let totalTasks: TasksType = { tasks: [] }
  let services: Services = { services: [] }
  let users: Users = { users: [] }
  let templateStorages: Storages = { storages: [] }
  let totalTemplates = 0
  let localTemplates: { templates?: any[] } = { templates: [] }
  let s3Templates: { templates?: any[] } = { templates: [] }
  let sftpTemplates: { templates?: any[] } = { templates: [] }

  try {
    ;[
      onlinePlayers,
      registeredPlayers,
      nodes,
      loadedModules,
      groups,
      totalTasks,
      services,
      users,
      templateStorages,
      localTemplates,
      s3Templates,
      sftpTemplates,
    ] = await Promise.all([
      serverPlayerApi.onlineAmount().catch(() => ({ onlineCount: 0 })),
      serverPlayerApi.registeredAmount().catch(() => ({ registeredCount: 0 })),
      serverNodeApi.list().catch(() => ({ nodes: [] })),
      serverModuleApi.getLoaded().catch(() => ({ modules: [] })),
      serverGroupApi.list().catch(() => ({ groups: [] })),
      serverTaskApi.list().catch(() => ({ tasks: [] })),
      serverServiceApi.list().catch(() => ({ services: [] })),
      serverUserApi.list().catch(() => ({ users: [] })),
      serverStorageApi.getStorages().catch(() => ({ storages: [] })),
      serverStorageApi.getLocalTemplates().catch(() => ({ templates: [] })),
      serverStorageApi.getS3Templates().catch(() => ({ templates: [] })),
      serverStorageApi.getSFTPTemplates().catch(() => ({ templates: [] })),
    ])

    totalTemplates =
      (localTemplates?.templates?.length || 0) +
      (s3Templates?.templates?.length || 0) +
      (sftpTemplates?.templates?.length || 0)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }

  return (
    <PageLayout title={'Dashboard'}>
      <AutoRefresh>
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Link href={'/dashboard/players'}>
              <DashboardCard
                title="Active players"
                icon={<UsersIcon className="w-4 h-4" />}
                value={onlinePlayers.onlineCount || 0}
                permissions={[
                  'cloudnet_bridge:player_read',
                  'cloudnet_bridge:player_online_count',
                  'global:admin',
                ]}
              />
            </Link>
            <DashboardCard
              title="Registered players"
              icon={<UsersIcon className="w-4 h-4" />}
              value={registeredPlayers.registeredCount || 0}
              permissions={[
                'cloudnet_bridge:player_read',
                'cloudnet_bridge:player_registered_count',
                'global:admin',
              ]}
            />
            <Link href={'/dashboard/nodes'}>
              <DashboardCard
                title="Total nodes"
                icon={<UsersIcon className="w-4 h-4" />}
                value={nodes?.nodes?.length || 0}
                permissions={[
                  'cloudnet_rest:cluster_read',
                  'cloudnet_rest:cluster_node_list',
                  'global:admin',
                ]}
              />
            </Link>
            <Link href={'/dashboard/modules'}>
              <DashboardCard
                title="Loaded modules"
                icon={<UsersIcon className="w-4 h-4" />}
                value={loadedModules?.modules?.length || 0}
                permissions={[
                  'cloudnet_rest:module_read',
                  'cloudnet_rest:module_list_loaded',
                  'global:admin',
                ]}
              />
            </Link>
            {/* TODO: Wait for new API - cc: 0utplay && klaro
            <Link href={'/dashboard/templates'}>
              <DashboardCard
                title="Total templates"
                icon={<UsersIcon className="w-4 h-4" />}
                value={totalTemplates}
                permissions={[
                  'cloudnet_rest:template_storage_read',
                  'cloudnet_rest:template_storage_template_list',
                  'global:admin',
                ]}
              />
            </Link>
            */}
            <Link href={'/dashboard/groups'}>
              <DashboardCard
                title="Total groups"
                icon={<UsersIcon className="w-4 h-4" />}
                value={groups?.groups?.length || 0}
                permissions={[
                  'cloudnet_rest:group_read',
                  'cloudnet_rest:group_list',
                  'global:admin',
                ]}
              />
            </Link>
            <Link href={'/dashboard/tasks'}>
              <DashboardCard
                title="Total tasks"
                icon={<UsersIcon className="w-4 h-4" />}
                value={totalTasks?.tasks?.length || 0}
                permissions={[
                  'cloudnet_rest:task_read',
                  'cloudnet_rest:task_list',
                  'global:admin',
                ]}
              />
            </Link>
            <Link href={'/dashboard/services'}>
              <DashboardCard
                title="Total services"
                icon={<UsersIcon className="w-4 h-4" />}
                value={services?.services?.length || 0}
                permissions={[
                  'cloudnet_rest:service_read',
                  'cloudnet_rest:service_list',
                  'global:admin',
                ]}
              />
            </Link>
            <Link href={'/dashboard/users'}>
              <DashboardCard
                title="REST Users"
                icon={<UsersIcon className="w-4 h-4" />}
                value={users?.users?.length || 0}
                permissions={[
                  'cloudnet_rest:user_read',
                  'cloudnet_rest:user_get_all',
                  'global:admin',
                ]}
              />
            </Link>
            <Link href={'/dashboard/nodes/console'}>
              <DashboardCard
                title="Node Console"
                icon={<UsersIcon className="w-4 h-4" />}
                value={'View'}
                permissions={[
                  'cloudnet_rest:user_read',
                  'cloudnet_rest:user_get_all',
                  'global:admin',
                ]}
              />
            </Link>
          </div>
        </main>
      </AutoRefresh>
    </PageLayout>
  )
}
