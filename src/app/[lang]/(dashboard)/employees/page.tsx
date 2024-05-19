import PageLayout from '@/components/pageLayout'
import { TextSearch } from 'lucide-react'
import Link from 'next/link'
import AddEmployeeModal from '@/components/employees/addEmployeeModal'
import SearchEmployee from '@/components/employees/searchEmployee'
import { getAllEmployeeData } from '@/utils/server-api/employees/getEmployeeData'
import { getTeamMemberships } from '@/utils/server-api/account/user'
import { cookies } from 'next/headers'

export default async function Page() {
  const orgId = cookies().get('orgId')

  const employees = await getAllEmployeeData()
  const teamRolesResponse = await getTeamMemberships(orgId.value)
  const teamRoles =
    teamRolesResponse && teamRolesResponse.memberships
      ? teamRolesResponse.memberships[0]?.roles
      : []

  const managerRoles = ['owner', 'hr-write']

  return (
    <PageLayout title="Employees">
      <main className="flex flex-col items-center justify-center min-h-screen px-4 md:px-6 pb-0 lg:pb-32">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Employees</h1>
            <p className="text-muted-foreground mt-2">
              Explore the latest updates and features.
            </p>
          </div>
          <div
            className={`grid gap-6 ${teamRoles.some((role: string) => managerRoles.includes(role)) ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : ''}`}
          >
            <SearchEmployee searchData={employees} />

            {/* Administrator only */}
            {teamRoles.some((role: string) => managerRoles.includes(role)) && (
              <>
                <AddEmployeeModal />
                <Link
                  className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-start gap-4"
                  href={'/employees/list'}
                >
                  <TextSearch className="h-8 w-8 text-gray-600 dark:text-gray-400" />
                  <div>
                    <h3 className="text-lg font-semibold">View all</h3>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      View all employees.
                    </p>
                  </div>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </PageLayout>
  )
}
