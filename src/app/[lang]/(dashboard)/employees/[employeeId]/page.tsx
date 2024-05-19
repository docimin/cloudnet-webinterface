import PageLayout from '@/components/pageLayout'
import { getSingleEmployeeData } from '@/utils/server-api/employees/getEmployeeData'
import { notFound } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getTeamMemberships } from '@/utils/server-api/account/user'
import { cookies } from 'next/headers'

export default async function Page({ params: { employeeId } }) {
  const employeeData = await getSingleEmployeeData(employeeId).catch(notFound)
  const orgId = cookies().get('orgId')

  const teamRolesResponse = await getTeamMemberships(orgId.value)
  const teamRoles =
    teamRolesResponse && teamRolesResponse.memberships
      ? teamRolesResponse.memberships[0]?.roles
      : []

  const managerRoles = ['owner', 'hr-write']

  return (
    <PageLayout title={`Employees - ${employeeData.name}`}>
      <Tabs defaultValue="general" className="">
        <TabsList className={'mb-2'}>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <div
            className={'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}
          >
            <div></div>
            <div></div>
            <div></div>
          </div>
        </TabsContent>
        <TabsContent value="settings">Change your password here.</TabsContent>
        <TabsContent value="hours">Change your password here.</TabsContent>
      </Tabs>
    </PageLayout>
  )
}
