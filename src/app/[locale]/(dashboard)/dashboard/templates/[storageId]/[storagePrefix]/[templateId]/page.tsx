import PageLayout from '@/components/pageLayout'
import FileBrowser from '@/components/templates/fileBrowser'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import NoAccess from '@/components/static/noAccess'
import DoesNotExist from '@/components/static/doesNotExist'

export const runtime = 'edge'

export default async function TemplatePage({ params }) {
  const permissions: string[] = await getPermissions()
  const requiredPermissions = [
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

  if (!params.storageId || !params.storagePrefix || !params.templateId) {
    return <DoesNotExist name={'Template'} />
  }

  return (
    <PageLayout title={'File browser'}>
      <FileBrowser params={params} permissions={permissions} />
    </PageLayout>
  )
}