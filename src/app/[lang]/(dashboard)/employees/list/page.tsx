import PageLayout from '@/components/pageLayout'
import AddEmployeeModal from '@/components/employees/addEmployeeModal'
import TableView from '@/components/employees/tableView'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { LayoutGridIcon, TableIcon, UserCogIcon } from 'lucide-react'
import { getAllEmployeeData } from '@/utils/server-api/employees/getEmployeeData'
import CardView from '@/components/employees/cardView'
import Link from 'next/link'
import React from 'react'
import { Separator } from '@/components/ui/separator'

export default async function Page() {
  const employees = await getAllEmployeeData()

  return (
    <PageLayout title="Employees">
      <Tabs defaultValue="list">
        <div className={'flex justify-between'}>
          <div
            className={
              'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6'
            }
          >
            {/* AddEmployeeModal is a modal that is displayed when the user clicks on the "Add new Employee" button */}
            <AddEmployeeModal />

            {/* The employee settings page for the employees module */}
            <Link
              className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-start gap-4"
              href={'/employees/settings'}
            >
              <UserCogIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Employee Settings
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  The settings for the employees module.
                </p>
              </div>
            </Link>
          </div>

          <TabsList>
            <HoverCard>
              <HoverCardTrigger>
                <TabsTrigger value="list">
                  <TableIcon />
                </TabsTrigger>
              </HoverCardTrigger>
              <HoverCardContent className={'w-auto text-center'}>
                Table
              </HoverCardContent>
            </HoverCard>
            <HoverCard>
              <HoverCardTrigger>
                <TabsTrigger value="grid">
                  <LayoutGridIcon />
                </TabsTrigger>
              </HoverCardTrigger>
              <HoverCardContent className={'w-auto text-center'}>
                Grid
              </HoverCardContent>
            </HoverCard>
          </TabsList>
        </div>

        <Separator className={'mb-6'} />

        <TabsContent value="list">
          <TableView employees={employees} />
        </TabsContent>
        <TabsContent value="grid">
          <CardView employees={employees} />
        </TabsContent>
      </Tabs>
    </PageLayout>
  )
}
