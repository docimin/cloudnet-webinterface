import { createFileRoute } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import ServiceConsole from '@/components/console'
import PageLayout from '@/components/pageLayout'
import NoAccess from '@/components/static/noAccess'
import { currentPermissions } from '@/server/auth'

const requiredPermissions = [
  'cloudnet_rest:node_read',
  'cloudnet_rest:node_live_console',
  'global:admin'
]

export const Route = createFileRoute(
  '/{-$locale}/_authed/dashboard/nodes/console'
)({
  loader: async () => {
    const permissions = await currentPermissions()
    return {
      hasPermissions: requiredPermissions.some((permission) =>
        permissions.includes(permission)
      )
    }
  },
  component: NodeConsolePage
})

function NodeConsolePage() {
  const { hasPermissions } = Route.useLoaderData()
  const nodesT = useTranslations('Nodes')

  if (!hasPermissions) {
    return <NoAccess />
  }

  return (
    <PageLayout title={nodesT('consoleTitle')}>
      <div className="flex flex-1 flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          {nodesT('consoleDescription')}
        </p>
        <ServiceConsole
          webSocketPath={`/node/liveConsole`}
          disableCommands={true}
          type={'node'}
        />
      </div>
    </PageLayout>
  )
}
