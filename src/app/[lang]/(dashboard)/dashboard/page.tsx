import PageLayout from '@/components/pageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UsersIcon } from 'lucide-react'
import { getNumberOnlinePlayers } from '@/utils/server-api/players/getNumberOnlinePlayers'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import { getTasks } from '@/utils/server-api/tasks/getTasks'
import { getNumberRegisteredPlayers } from '@/utils/server-api/players/getNumberRegisteredPlayers'
import { getNodes } from '@/utils/server-api/nodes/getNodes'

export const runtime = 'edge'

export default async function DashboardPage() {
  const onlinePlayers = await getNumberOnlinePlayers()
  const registeredPlayers = await getNumberRegisteredPlayers()
  const nodes = await getNodes()
  const totalTasks = await getTasks()

  return (
    <PageLayout title={'Dashboard'}>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <DashboardCard
            title="Active players"
            icon={<UsersIcon className="w-4 h-4" />}
            value={onlinePlayers.onlineCount}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_online_count',
              'global:admin',
            ]}
          />
          <DashboardCard
            title="Registered players"
            icon={<UsersIcon className="w-4 h-4" />}
            value={registeredPlayers.registeredCount}
            permissions={[
              'cloudnet_bridge:player_read',
              'cloudnet_bridge:player_online_count',
              'global:admin',
            ]}
          />
          <DashboardCard
            title="Total nodes"
            icon={<UsersIcon className="w-4 h-4" />}
            value={totalTasks.tasks.length}
            permissions={[
              'cloudnet_rest:task_read',
              'cloudnet_rest:task_list',
              'global:admin',
            ]}
          />
          <DashboardCard
            title="Total tasks"
            icon={<UsersIcon className="w-4 h-4" />}
            value={totalTasks.tasks.length}
            permissions={[
              'cloudnet_rest:task_read',
              'cloudnet_rest:task_list',
              'global:admin',
            ]}
          />
          <DashboardCard
            title="Total tasks"
            icon={<UsersIcon className="w-4 h-4" />}
            value={totalTasks.tasks.length}
            permissions={[
              'cloudnet_rest:task_read',
              'cloudnet_rest:task_list',
              'global:admin',
            ]}
          />
        </div>
      </main>
    </PageLayout>
  )
}

const DashboardCard = async ({ title, icon, value, permissions }) => {
  const perms: string[] = await getPermissions()

  return permissions.some((permission) => perms.includes(permission)) ? (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  ) : null
}
