import PageLayout from '@/components/pageLayout'
import NoAccess from '@/components/static/noAccess'
import NoRecords from '@/components/static/noRecords'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { serverModuleApi } from '@/lib/server-api'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import Link from 'next/link'

export const runtime = 'edge'

export default async function NodesPage() {
  const modules = await serverModuleApi.getLoaded()
  console.log(modules)
  const permissions: string[] = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_list_available',
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
                      href={`/dashboard/modules/${module.configuration.name}`}
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
