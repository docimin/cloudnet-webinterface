import PageLayout from '@/components/pageLayout'
import { getPermissions } from '@/utils/server-api/getPermissions'
import NoAccess from '@/components/static/noAccess'
import ServiceConsole from '@/components/console'

export default async function NodeConsolePage() {
  const permissions = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:node_read',
    'cloudnet_rest:node_live_console',
    'global:admin'
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  return (
    <PageLayout title={'Node Console'}>
      <ServiceConsole
        webSocketPath={`/node/liveConsole`}
        disableCommands={true}
        type={'node'}
      />
    </PageLayout>
  )
}
