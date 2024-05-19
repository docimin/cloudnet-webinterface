import { createSessionServerClient } from '@/app/appwrite-session'
import type { AccountType } from '@/utils/types/global-types'
import { Query } from 'node-appwrite'

export async function getAccountServer() {
  const { account } = await createSessionServerClient()
  const accountData: AccountType = await account.get().catch((error) => {
    return error
  })
  return accountData
}

export async function getPermissionsServer(
  databaseId: string,
  roleName: string
) {
  const { databases } = await createSessionServerClient()
  return await databases
    .listDocuments(`${databaseId}`, 'user-roles', [
      Query.equal('name', roleName),
    ])
    .catch((error) => {
      return error
    })
}

export async function getTeamServer() {
  const { teams } = await createSessionServerClient()
  return await teams.list().catch((error) => {
    return error
  })
}
