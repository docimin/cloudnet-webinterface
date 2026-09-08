import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import PageHeader from '@/components/pageHeader'
import PageLayout from '@/components/pageLayout'
import NoAccess from '@/components/static/noAccess'
import NoRecords from '@/components/static/noRecords'
import { StatusIndicator } from '@/components/status'
import StatusTally from '@/components/statusTally'
import TableEmpty from '@/components/tableEmpty'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { moduleStatus, tally } from '@/lib/cloudnetStatus'
import { currentPermissions } from '@/server/auth'
import { moduleLoaded } from '@/server/module'

const requiredPermissions = [
  'cloudnet_rest:module_read',
  'cloudnet_rest:module_list_loaded',
  'global:admin'
]

export const Route = createFileRoute('/{-$locale}/_authed/dashboard/modules/')({
  loader: async () => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )
    return {
      permissions,
      hasPermissions,
      modules: hasPermissions ? await moduleLoaded() : null
    }
  },
  component: ModulesPage
})

function ModulesPage() {
  const { hasPermissions, modules } = Route.useLoaderData()
  const modulesT = useTranslations('Modules')
  const statusT = useTranslations('Status')
  const navigate = useNavigate()

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!modules?.modules) {
    return <NoRecords />
  }

  const sorted = [...modules.modules]
    .filter((module) => Boolean(module?.configuration?.name))
    .sort((a, b) => a.configuration.name.localeCompare(b.configuration.name))
  const counts = tally(sorted, (module) => moduleStatus(module.lifecycle))

  return (
    <PageLayout title={modulesT('title')}>
      <div className="flex flex-col gap-4">
        <PageHeader count={sorted.length} caption={modulesT('tableCaption')}>
          <StatusTally counts={counts} />
        </PageHeader>

        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-32">{modulesT('status')}</TableHead>
                <TableHead className="w-64">{modulesT('name')}</TableHead>
                <TableHead className="w-32">{modulesT('version')}</TableHead>
                <TableHead>{modulesT('author')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 && (
                <TableEmpty
                  colSpan={4}
                  title={modulesT('noModules')}
                  description={modulesT('noModulesDescription')}
                />
              )}
              {sorted.map((module) => {
                const status = moduleStatus(module.lifecycle)
                return (
                  <TableRow
                    key={module.configuration.name}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() =>
                      navigate({
                        to: '/{-$locale}/dashboard/modules/$moduleId',
                        params: { moduleId: module.configuration.name }
                      })
                    }
                  >
                    <TableCell>
                      <StatusIndicator
                        status={status}
                        label={statusT(status)}
                        showLabel
                      />
                    </TableCell>
                    <TableCell className="font-mono font-medium">
                      <Link
                        to="/{-$locale}/dashboard/modules/$moduleId"
                        params={{ moduleId: module.configuration.name }}
                        onClick={(event) => event.stopPropagation()}
                        className="hover:underline focus-visible:underline"
                      >
                        {module.configuration.name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono tabular-nums text-muted-foreground">
                      {module.configuration.version}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {module.configuration.author}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageLayout>
  )
}
