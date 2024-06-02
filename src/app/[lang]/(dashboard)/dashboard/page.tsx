import PageLayout from '@/components/pageLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UsersIcon } from 'lucide-react'
import { getNumberOnlinePlayers } from '@/utils/server-api/players/getNumberOnlinePlayers'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import { getTasks } from '@/utils/server-api/tasks/getTasks'
import { getNumberRegisteredPlayers } from '@/utils/server-api/players/getNumberRegisteredPlayers'
import { getNodes } from '@/utils/server-api/nodes/getNodes'
import { getLocalTemplates } from '@/utils/server-api/templates/getLocalTemplates'
import { getS3Templates } from '@/utils/server-api/templates/getS3Templates'
import { getServices } from '@/utils/server-api/services/getServices'
import { getSFTPTemplates } from '@/utils/server-api/templates/getSFTPTemplates'
import { getStorages } from '@/utils/server-api/templates/getStorages'
import Link from 'next/link'
import { getGroups } from '@/utils/server-api/groups/getGroups'
import { getLoadedModules } from '@/utils/server-api/modules/getLoadedModules'

export const runtime = 'edge'

export default async function DashboardPage({ params: { lang } }) {
  const onlinePlayers = await getNumberOnlinePlayers()
  const registeredPlayers = await getNumberRegisteredPlayers()
  const nodes = await getNodes()
  const availableModules = await getLoadedModules()
  const groups = await getGroups()
  const totalTasks = await getTasks()
  const templateStorages = await getStorages()
  const services = await getServices()

  let totalTemplates = 0
  if (templateStorages?.storages?.includes('local')) {
    const localTemplates = await getLocalTemplates()
    totalTemplates += localTemplates?.templates?.length
  }

  if (templateStorages?.storages?.includes('s3')) {
    const s3Templates = await getS3Templates()
    totalTemplates += s3Templates?.templates?.length
  }

  if (templateStorages?.storages?.includes('sftp')) {
    const sftpTemplates = await getSFTPTemplates()
    totalTemplates += sftpTemplates?.templates?.length
  }

  return (
    <PageLayout title={'Dashboard'}>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
          <Link href={`/${lang}/dashboard/nodes`}>
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
          <Link href={`/${lang}/dashboard/modules`}>
            <DashboardCard
              title="Loaded modules"
              icon={<UsersIcon className="w-4 h-4" />}
              value={availableModules?.modules?.length || 0}
              permissions={[
                'cloudnet_rest:module_read',
                'cloudnet_rest:module_list_loaded',
                'global:admin',
              ]}
            />
          </Link>
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
        </div>
      </main>
    </PageLayout>
  )
}

const DashboardCard = async ({ title, icon, value, permissions }) => {
  let perms: string[] = await getPermissions()

  return permissions.some((permission: string) =>
    perms.includes(permission)
  ) ? (
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
