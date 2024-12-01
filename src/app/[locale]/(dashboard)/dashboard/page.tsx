import PageLayout from '@/components/pageLayout'
import { UsersIcon } from 'lucide-react'
import { getNumberOnlinePlayers } from '@/utils/server-api/players/getNumberOnlinePlayers'
import { getTasks } from '@/utils/server-api/tasks/getTasks'
import { getNumberRegisteredPlayers } from '@/utils/server-api/players/getNumberRegisteredPlayers'
import { getNodes } from '@/utils/server-api/nodes/getNodes'
import { getLocalTemplates } from '@/utils/server-api/templates/getLocalTemplates'
import { getS3Templates } from '@/utils/server-api/templates/getS3Templates'
import { getServices } from '@/utils/server-api/services/getServices'
import { getSFTPTemplates } from '@/utils/server-api/templates/getSFTPTemplates'
import { getStorages } from '@/utils/server-api/templates/getStorages'
import { getGroups } from '@/utils/server-api/groups/getGroups'
import { getLoadedModules } from '@/utils/server-api/modules/getLoadedModules'
import { getUsers } from '@/utils/server-api/users/getUsers'
import { DashboardCard } from '@/components/dashboardCard'
import { Link } from '@/i18n/routing'
import AutoRefresh from '@/components/autoRefresh'

export const runtime = 'edge'

export default async function DashboardPage(props) {
  const params = await props.params

  const { locale } = params

  const onlinePlayers = await getNumberOnlinePlayers()
  const registeredPlayers = await getNumberRegisteredPlayers()
  const nodes = await getNodes()
  const availableModules = await getLoadedModules()
  const groups = await getGroups()
  const totalTasks = await getTasks()
  const templateStorages = await getStorages()
  const services = await getServices()
  const users = await getUsers()

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
                value={availableModules?.modules?.length || 0}
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
          </div>
        </main>
      </AutoRefresh>
    </PageLayout>
  )
}
