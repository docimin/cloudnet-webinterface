import PageLayout from '@/components/pageLayout'
import FileBrowser from '@/components/templates/fileBrowser'
import { getPermissions } from '@/utils/server-api/getPermissions'
import NoAccess from '@/components/static/noAccess'
import DoesNotExist from '@/components/static/doesNotExist'
import FileEditor from '@/components/templates/fileEditor'

export default async function TemplatePage(props) {
  const params = await props.params
  const permissions: string[] = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:template_read',
    'cloudnet_rest:template_directory_list',
    'global:admin'
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

  if (params.fileId && params.fileId.length > 0) {
    const lastElement = params.fileId[params.fileId.length - 1]
    if (lastElement.includes('.')) {
      return (
        <PageLayout title={'File editor'}>
          <FileEditor params={params} />
        </PageLayout>
      )
    }
  }

  return (
    <PageLayout title={'File browser'}>
      <FileBrowser params={params} />
    </PageLayout>
  )
}
