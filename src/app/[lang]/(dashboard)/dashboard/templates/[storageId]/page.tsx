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
import { Templates, TemplatesList } from '@/utils/types/templateStorages'
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

  const uniqueTemplates: Templates[] = templates.templates.reduce(
    (unique, template) => {
      if (!unique.some((item) => item.prefix === template.prefix)) {
        unique.push(template)
      }
      return unique
    },
    []
  )

  return (
    <PageLayout title={storageId || 'Templates'}>
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
          {uniqueTemplates
            .sort((a, b) => a.prefix.localeCompare(b.prefix))
            .map((template) => (
              <TableRow key={template.prefix}>
                <TableCell className="font-medium">{template.prefix}</TableCell>
                {requiredPermissions.some((permission) =>
                  permissions.includes(permission)
                ) && (
                  <TableCell>
                    <Link
                      href={`/${lang}/dashboard/templates/${storageId}/${template.prefix}`}
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