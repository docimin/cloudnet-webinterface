'use server'
import { createAdminDatabasesClient } from '@/app/appwrite-management'
import { createSessionServerClient } from '@/app/appwrite-session'

export async function deleteDatabase(databaseId: string) {
  try {
    await deleteDatabasesData(databaseId)
    await deleteDatabasesTeam(databaseId)
    await deleteManagementData(databaseId)
    await deleteManagementCompanyData(databaseId)
    await deleteManagementTeam(databaseId)
    return { status: 200 }
  } catch (error) {
    return error
  }
}

async function deleteDatabasesData(databaseId: string) {
  const { databases } = await createAdminDatabasesClient()
  return await databases.delete(databaseId).catch((error) => {
    return error
  })
}

async function deleteDatabasesTeam(teamId: string) {
  const { teams } = await createAdminDatabasesClient()
  return await teams.delete(teamId).catch((error) => {
    return error
  })
}

async function deleteManagementData(databaseId: string) {
  const { databases } = await createSessionServerClient()
  return await databases
    .deleteDocument('production-main', 'databases', `${databaseId}`)
    .catch((error) => {
      return error
    })
}

async function deleteManagementCompanyData(databaseId: string) {
  const { databases } = await createSessionServerClient()
  return await databases
    .deleteDocument('production-main', 'companydata', `${databaseId}`)
    .catch((error) => {
      return error
    })
}

async function deleteManagementTeam(teamId: string) {
  const { teams } = await createSessionServerClient()
  return await teams.delete(teamId).catch((error) => {
    return error
  })
}
