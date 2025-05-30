import PageLayout from '@/components/pageLayout'
import { getPermissions } from '@/utils/server-api/getPermissions'
import NoAccess from '@/components/static/noAccess'
import DoesNotExist from '@/components/static/doesNotExist'
import GroupClientPage from './page.client'
import { serverGroupApi } from '@/lib/server-api'
import { getDict } from 'gt-next/server'

export default async function GroupPage(props) {
  const { groupId } = await props.params
  const navigationT = await getDict('Navigation')

  const group = await serverGroupApi.get(groupId)
  const permissions: any = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:group_read',
    'cloudnet_rest:group_get',
    'global:admin'
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!group?.name) {
    return <DoesNotExist name={navigationT('groups')} />
  }

  return (
    <PageLayout title={group?.name}>
      <GroupClientPage groupId={groupId} group={group} />
    </PageLayout>
  )
}
