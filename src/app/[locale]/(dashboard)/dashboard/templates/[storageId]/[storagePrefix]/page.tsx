import PageLayout from '@/components/pageLayout'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { getPermissions } from '@/utils/server-api/getPermissions'
import NoAccess from '@/components/static/noAccess'
import { serverStorageApi } from '@/lib/server-api'
import NoRecords from '@/components/static/noRecords'
import Link from 'next/link'

export default async function TemplatesPage(props) {
  const params = await props.params

  const { storageId, storagePrefix } = params

  const permissions = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:template_storage_read',
    'cloudnet_rest:template_storage_template_list',
    'global:admin'
  ]

  const requiredEditPermissions = [
    'cloudnet_rest:template_read',
    'cloudnet_rest:template_directory_list',
    'global:admin'
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )
  const hasEditPermissions = requiredEditPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  let templates: TemplatesList
  try {
    templates = await serverStorageApi.getTemplates(storageId)
  } catch {
    return <NoRecords />
  }

  if (!templates.templates) {
    return <NoRecords />
  }

  const filteredTemplates = templates.templates.filter(
    (template) => template.prefix === storagePrefix
  )

  const uniqueTemplates: Templates[] = filteredTemplates.reduce(
    (unique, template) => {
      if (!unique.some((item) => item.name === template.name)) {
        unique.push(template)
      }
      return unique
    },
    []
  )

  return (
    <PageLayout title={`${storageId} - ${storagePrefix}` || 'Templates'}>
      <Table>
        <TableCaption>A list of your templates.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-full">Name</TableHead>
            {hasEditPermissions && (
              <TableHead className="sr-only">Edit</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {uniqueTemplates
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((template) => (
              <TableRow key={template.name}>
                <TableCell className="font-medium">{template.name}</TableCell>
                {hasEditPermissions && (
                  <TableCell>
                    <Link
                      href={`/dashboard/templates/${storageId}/${storagePrefix}/${template.name}`}
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
