import PageLayout from '@/components/pageLayout'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import { getModules } from '@/utils/server-api/modules/getModules'
import { Modules } from '@/utils/types/modules'
import NoAccess from '@/components/static/noAccess'
import NoRecords from '@/components/static/noRecords'
import { Link } from '@/i18n/routing'

export const runtime = 'edge'

export default async function NodesPage(props) {
  const params = await props.params

  const { locale } = params

  const modules: Modules = await getModules()
  const permissions: string[] = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:cluster_read',
    'cloudnet_rest:cluster_node_get',
    'global:admin',
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!modules.modules) {
    return <NoRecords />
  }

  return (
    <PageLayout title={'Modules'}>
      <Table>
        <TableCaption>A list of your modules.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Name</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Version</TableHead>
            {requiredPermissions.some((permission) =>
              permissions.includes(permission)
            ) && <TableHead className="sr-only">Edit</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {modules.modules
            .sort((a, b) =>
              a.configuration.name.localeCompare(b.configuration.name)
            )
            .map((module) => (
              <TableRow key={module.configuration.name}>
                <TableCell className="font-medium">
                  {module.configuration.name}
                </TableCell>
                <TableCell>{module.configuration.author}</TableCell>
                <TableCell>{module.configuration.version}</TableCell>
                {requiredPermissions.some((permission) =>
                  permissions.includes(permission)
                ) && (
                  <TableCell>
                    <Link
                      href={{
                        pathname: '/dashboard/modules/[moduleId]',
                        params: { moduleId: module.configuration.name },
                      }}
                    >
                      <Button
                        size={'sm'}
                        variant={'link'}
                        className={'p-0 text-right'}
                      >
                        Edit
                      </Button>
                    </Link>
                  </TableCell>
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </PageLayout>
  )
}
