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
import Link from 'next/link'
import NoAccess from '@/components/static/noAccess'
import Maintenance from '@/components/static/maintenance'
import { TemplatesList } from '@/utils/types/templateStorages'
import { getTemplates } from '@/utils/server-api/templates/getTemplates'

export const runtime = 'edge'

export default async function ServicesPage({ params: { storageId, lang } }) {
  const templates: TemplatesList = await getTemplates(storageId)
  const permissions: string[] = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:template_storage_read',
    'cloudnet_rest:template_storage_template_list',
    'global:admin',
  ]

  const requiredEditPermissions = [
    'cloudnet_rest:template_read',
    'cloudnet_rest:template_directory_list',
    'global:admin',
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!templates.templates) {
    return <Maintenance />
  }

  return (
    <PageLayout title={'Nodes'}>
      <Table>
        <TableCaption>A list of your templates.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-full">Name</TableHead>
            {requiredEditPermissions.some((permission) =>
              permissions.includes(permission)
            ) && <TableHead className="sr-only">Edit</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {templates?.templates
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((template) => (
              <TableRow key={template.name}>
                <TableCell className="font-medium">{template.name}</TableCell>
                {requiredPermissions.some((permission) =>
                  permissions.includes(permission)
                ) && (
                  <TableCell>
                    <Link
                      href={`/${lang}/dashboard/templates/${storageId}/${template.name}`}
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
