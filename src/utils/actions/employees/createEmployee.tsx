'use server'
import { createSessionServerClient } from '@/app/appwrite-session'
import { cookies } from 'next/headers'
import { ID } from 'node-appwrite'

function getTeamId() {
  return cookies().get('orgId').value
}

export async function createEmployee(employeeName: string, department: string) {
  const { databases } = await createSessionServerClient()
  return await databases.createDocument(getTeamId(), 'employees', ID.unique(), {
    name: employeeName,
    department: department,
  })
}
