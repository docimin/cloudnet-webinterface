'use server'
import { createSessionServerClient } from '@/app/appwrite-session'
import { createAdminDatabasesClient } from '@/app/appwrite-management'

async function turnRealDatabaseOn(databaseId: string) {
  const { databases } = await createAdminDatabasesClient()
  return await databases.update(`${databaseId}`, '', true).catch((error) => {
    return error
  })
}

export async function turnDatabaseOn(databaseId: string) {
  const { databases } = await createSessionServerClient()
  await turnRealDatabaseOn(databaseId)
  return await databases
    .updateDocument('production-main', 'databases', `${databaseId}`, {
      active: true,
    })
    .catch((error) => {
      return error
    })
}

async function turnRealDatabaseOff(databaseId: string) {
  const { databases } = await createAdminDatabasesClient()
  return await databases.update(`${databaseId}`, '', false).catch((error) => {
    return error
  })
}

export async function turnDatabaseOff(databaseId: string) {
  const { databases } = await createSessionServerClient()
  await turnRealDatabaseOff(databaseId)
  return await databases
    .updateDocument('production-main', 'databases', `${databaseId}`, {
      active: false,
    })
    .catch((error) => {
      return error
    })
}
