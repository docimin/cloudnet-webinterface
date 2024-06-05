import PageLayout from '@/components/pageLayout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import { getUser } from '@/utils/server-api/users/getUser'
import { User } from '@/utils/types/users'
import UserClientPage from '@/app/[lang]/(dashboard)/dashboard/users/[userId]/page.client'
import NoAccess from '@/components/static/noAccess'
import DoesNotExist from '@/components/static/doesNotExist'

export const runtime = 'edge'

export default async function UserPage({ params: { lang, userId } }) {
  const user: User = await getUser(userId)
  const permissions: any = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:user_read',
    'cloudnet_rest:user_get',
    'global:admin',
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!user?.id) {
    return <DoesNotExist name={'User'} />
  }

  return (
    <PageLayout title={`Edit ${user.username}`}>
      <UserClientPage user={user} userId={userId} />
    </PageLayout>
  )
}
