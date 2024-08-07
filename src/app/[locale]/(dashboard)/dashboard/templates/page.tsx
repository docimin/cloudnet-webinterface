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
import NoAccess from '@/components/static/noAccess'
import { getStorages } from '@/utils/server-api/templates/getStorages'
import { Storages } from '@/utils/types/templateStorages'
import NoRecords from '@/components/static/noRecords'
import { Link } from '@/navigation'

export const runtime = 'edge'

export default async function ServicesPage({ params: { locale } }) {
  const storages: Storages = await getStorages()
  const permissions: string[] = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:template_storage_read',
    'cloudnet_rest:template_storage_list',
    'global:admin',
  ]

  const requiredEditPermissions = [
    'cloudnet_rest:template_storage_write',
    'cloudnet_rest:template_storage_template_list',
    'global:admin',
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!storages.storages) {
    return <NoRecords />
  }

  return (
    <PageLayout title={'Templates'}>
      <Table>
        <TableCaption>A list of your storages.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-full">Name</TableHead>
            {requiredEditPermissions.some((permission) =>
              permissions.includes(permission)
            ) && <TableHead className="sr-only">Edit</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {storages?.storages
            .sort((a, b) => a.localeCompare(b))
            .map((storage) => (
              <TableRow key={storage}>
                <TableCell className="font-medium">{storage}</TableCell>
                {requiredPermissions.some((permission) =>
                  permissions.includes(permission)
                ) && (
                  <TableCell>
                    <Link
                      href={{
                        pathname: '/dashboard/templates/[storageId]',
                        params: { storageId: storage },
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