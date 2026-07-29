import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import {
  BlendIcon,
  BookDashedIcon,
  BoxIcon,
  GroupIcon,
  LayersIcon,
  ServerIcon,
  TerminalIcon,
  UsersIcon,
  WorkflowIcon
} from 'lucide-react'
import AutoRefresh from '@/components/autoRefresh'
import { DashboardCard, StatusCard } from '@/components/dashboardCard'
import PageLayout from '@/components/pageLayout'
import { Button } from '@/components/ui/button'
import { nodeStatus, serviceStatus, tally } from '@/lib/cloudnetStatus'
import { groupList } from '@/server/group'
import { moduleLoaded } from '@/server/module'
import { nodeList } from '@/server/node'
import { playerOnlineAmount, playerRegisteredAmount } from '@/server/player'
import { serviceList } from '@/server/service'
import { taskList } from '@/server/task'
import { storageList, storageTemplateList } from '@/server/templates'
import { userList } from '@/server/user'
import type { Modules } from '@/utils/types/modules'
import type { NodesType } from '@/utils/types/nodes'
import type { TasksType } from '@/utils/types/tasks'

export const Route = createFileRoute('/{-$locale}/_authed/dashboard/')({
  loader: async () => {
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
        templateStorages
      ] = await Promise.all([
        playerOnlineAmount().catch(() => ({ onlineCount: 0 })),
        playerRegisteredAmount().catch(() => ({ registeredCount: 0 })),
        nodeList().catch(() => ({ nodes: [] })),
        moduleLoaded().catch(() => ({ modules: [] })),
        groupList().catch(() => ({ groups: [] })),
        taskList().catch(() => ({ tasks: [] })),
        serviceList().catch(() => ({ services: [] })),
        userList().catch(() => ({ users: [] })),
        storageList().catch(() => ({ storages: [] }))
      ])

      // one unreachable storage must not blank the card
      const perStorage = await Promise.all(
        (templateStorages?.storages ?? []).map((storage) =>
          storageTemplateList({ data: { storage } }).catch(() => ({
            templates: []
          }))
        )
      )
      totalTemplates = perStorage.reduce(
        (sum, r) => sum + (r?.templates?.length ?? 0),
        0
      )
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    }

    return {
      onlinePlayers,
      registeredPlayers,
      nodes,
      loadedModules,
      groups,
      totalTasks,
      services,
      users,
      templateStorages,
      totalTemplates
    }
  },
  component: DashboardPage
})

function DashboardPage() {
  const navigationT = useTranslations('Navigation')
  const homeT = useTranslations('Home')
  const statusT = useTranslations('Status')

  const {
    onlinePlayers,
    registeredPlayers,
    nodes,
    loadedModules,
    groups,
    totalTasks,
    services,
    users,
    totalTemplates
  } = Route.useLoaderData()

  return (
    <PageLayout title={navigationT('dashboard')}>
      <AutoRefresh>
        <main className="flex flex-1 flex-col gap-6 p-4 md:p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Link to={'/{-$locale}/dashboard/services'}>
              <StatusCard
                title={navigationT('services')}
                icon={<LayersIcon className="size-4" />}
                total={services?.services?.length || 0}
                counts={tally(services?.services ?? [], (s) =>
                  serviceStatus(s.lifeCycle)
                )}
                permissions={[
                  'cloudnet_rest:service_read',
                  'cloudnet_rest:service_list',
                  'global:admin'
                ]}
              />
            </Link>
            <Link to={'/{-$locale}/dashboard/nodes'}>
              <StatusCard
                title={navigationT('nodes')}
                icon={<WorkflowIcon className="size-4" />}
                total={nodes?.nodes?.length || 0}
                counts={tally(nodes?.nodes ?? [], (n) =>
                  nodeStatus(n.state, n.nodeInfoSnapshot?.drain)
                )}
                permissions={[
                  'cloudnet_rest:cluster_read',
                  'cloudnet_rest:cluster_node_list',
                  'global:admin'
                ]}
              />
            </Link>
            <Link to={'/{-$locale}/dashboard/players'}>
              <StatusCard
                title={navigationT('players')}
                icon={<UsersIcon className="size-4" />}
                total={onlinePlayers.onlineCount || 0}
                caption={statusT('online')}
                counts={{}}
                permissions={[
                  'cloudnet_bridge:player_read',
                  'cloudnet_bridge:player_online_count',
                  'global:admin'
                ]}
              />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
            <Link to={'/{-$locale}/dashboard/tasks'}>
              <DashboardCard
                title={navigationT('tasks')}
                icon={<BlendIcon className="size-4" />}
                value={totalTasks?.tasks?.length || 0}
                permissions={[
                  'cloudnet_rest:task_read',
                  'cloudnet_rest:task_list',
                  'global:admin'
                ]}
              />
            </Link>
            <Link to={'/{-$locale}/dashboard/groups'}>
              <DashboardCard
                title={navigationT('groups')}
                icon={<GroupIcon className="size-4" />}
                value={groups?.groups?.length || 0}
                permissions={[
                  'cloudnet_rest:group_read',
                  'cloudnet_rest:group_list',
                  'global:admin'
                ]}
              />
            </Link>
            <Link to={'/{-$locale}/dashboard/modules'}>
              <DashboardCard
                title={navigationT('modules')}
                icon={<BoxIcon className="size-4" />}
                value={loadedModules?.modules?.length || 0}
                permissions={[
                  'cloudnet_rest:module_read',
                  'cloudnet_rest:module_list_loaded',
                  'global:admin'
                ]}
              />
            </Link>
            <Link to={'/{-$locale}/dashboard/templates'}>
              <DashboardCard
                title={navigationT('templates')}
                icon={<BookDashedIcon className="size-4" />}
                value={totalTemplates}
                permissions={[
                  'cloudnet_rest:template_storage_read',
                  'cloudnet_rest:template_storage_list',
                  'global:admin'
                ]}
              />
            </Link>
            <Link to={'/{-$locale}/dashboard/users'}>
              <DashboardCard
                title={navigationT('users')}
                icon={<ServerIcon className="size-4" />}
                value={users?.users?.length || 0}
                permissions={[
                  'cloudnet_rest:user_read',
                  'cloudnet_rest:user_get_all',
                  'global:admin'
                ]}
              />
            </Link>
            <DashboardCard
              title={homeT('registeredPlayers')}
              icon={<UsersIcon className="size-4" />}
              value={registeredPlayers.registeredCount || 0}
              permissions={[
                'cloudnet_bridge:player_read',
                'cloudnet_bridge:player_registered_count',
                'global:admin'
              ]}
            />
          </div>

          <div>
            <Link to={'/{-$locale}/dashboard/nodes/console'}>
              <Button variant={'outline'} size={'sm'}>
                <TerminalIcon className="mr-2 size-4" />
                {statusT('openConsole')}
              </Button>
            </Link>
          </div>
        </main>
      </AutoRefresh>
    </PageLayout>
  )
}
