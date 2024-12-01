import PageLayout from '@/components/pageLayout'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import NoAccess from '@/components/static/noAccess'
import DoesNotExist from '@/components/static/doesNotExist'
import { getGroup } from '@/utils/server-api/groups/getGroup'
import GroupClientPage from '@/app/[locale]/(dashboard)/dashboard/groups/[groupId]/page.client'

export const runtime = 'edge'

export default async function GroupPage(props) {
  const params = await props.params;

  const {
    locale,
    groupId
  } = params;

  const group: Group = await getGroup(groupId)
  const permissions: any = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:group_read',
    'cloudnet_rest:group_get',
    'global:admin',
  ]
  const requiredDeletePermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_config_get',
    'global:admin',
  ]

  // Check if user has required permissions to view module config
  const hasDeletePermission = requiredDeletePermissions.some((permission) =>
    permissions.includes(permission)
  )

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!group?.name) {
    return <DoesNotExist name={'Module'} />
  }

  return (
    <PageLayout title={group?.name}>
      <GroupClientPage groupId={groupId} group={group} />
    </PageLayout>
  )
}
