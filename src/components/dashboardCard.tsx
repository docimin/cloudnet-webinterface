import { getPermissions } from '@/utils/server-api/user/getPermissions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const DashboardCard = async ({ title, icon, value, permissions }) => {
  let perms: string[] = await getPermissions()

  return permissions.some((permission: string) =>
    perms.includes(permission)
  ) ? (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  ) : null
}
