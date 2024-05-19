'use server'

import { createAdminDatabasesClient } from '@/app/appwrite-management'

export async function createConfigAttributes(databaseId: string) {
  const { databases } = await createAdminDatabasesClient()

  await databases
    .createStringAttribute(`${databaseId}`, 'config', 'companyType', 128, true)
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(`${databaseId}`, 'config', 'license', 128, true)
    .catch((error) => {
      return error
    })

  return { status: 200 }
}
