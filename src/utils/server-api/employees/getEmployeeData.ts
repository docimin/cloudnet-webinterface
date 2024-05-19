import { createSessionServerClient } from '@/app/appwrite-session'
import { cookies } from 'next/headers'
import { EmployeesData, EmployeesTotal } from '@/utils/types/employees'

export async function getSelfEmployeeData() {
  const orgId = cookies().get('orgId').value
  const { account, databases } = await createSessionServerClient()
  const userResponse = await account.get()
  const data: EmployeesData = await databases.getDocument(
    `${orgId}`,
    'employees',
    `${userResponse.$id}`
  )
  return data
}

export async function getSingleEmployeeData(employeeId: string) {
  const orgId = cookies().get('orgId').value
  const { databases } = await createSessionServerClient()
  const data: EmployeesData = await databases.getDocument(
    `${orgId}`,
    'employees',
    `${employeeId}`
  )
  return data
}

export async function getAllEmployeeData() {
  const orgId = cookies().get('orgId').value
  const { databases } = await createSessionServerClient()
  const data: EmployeesTotal = await databases.listDocuments(
    `${orgId}`,
    'employees'
  )
  return data
}
