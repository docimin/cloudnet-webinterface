'use server'

import { createAdminDatabasesClient } from '@/app/appwrite-management'

export async function createSetupPreferencesAttributes(databaseId: string) {
  const { databases } = await createAdminDatabasesClient()

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-preferences',
      'slogan',
      128,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createStringAttribute(
      `${databaseId}`,
      'setup-preferences',
      'notes',
      8192,
      false
    )
    .catch((error) => {
      return error
    })

  await databases
    .createDatetimeAttribute(
      `${databaseId}`,
      'setup-preferences',
      'averageDeliveryTime',
      false
    )
    .catch((error) => {
      return error
    })
}
