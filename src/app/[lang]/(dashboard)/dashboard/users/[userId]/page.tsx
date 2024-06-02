import PageLayout from '@/components/pageLayout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import { getUser } from '@/utils/server-api/users/getUser'
import { Users } from '@/utils/types/users'
import UserClientPage from '@/app/[lang]/(dashboard)/dashboard/users/[userId]/page.client'
import NoAccess from '@/components/static/noAccess'

export const runtime = 'edge'

export default async function UserPage({ params: { lang, userId } }) {
  const user: Users = await getUser(userId)
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
    return (
      <div className="h-svh">
        <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
          <h1 className="text-[7rem] font-bold leading-tight">401</h1>
          <span className="font-medium">User not found!</span>
          <p className="text-center text-muted-foreground">
            It looks like you&apos;re trying to access a user that doesn&apos;t
            exist.
          </p>
          <div className="mt-6 flex gap-4">
            <Link href={'.'}>
              <Button variant="outline">Go back</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageLayout title={user.id}>
      <UserClientPage user={user} userId={userId} />
    </PageLayout>
  )
}
