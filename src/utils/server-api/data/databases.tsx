import { createSessionServerClient } from '@/app/appwrite-session'
import { CompanyData, DatabaseTotal } from '@/utils/types/global-types'

export async function getDatabases() {
  const { databases } = await createSessionServerClient()
  const databasesResponse: DatabaseTotal = await databases.listDocuments(
    'production-main',
    'databases'
  )
  return databasesResponse
}

export async function getSingleDatabase(databaseId: string) {
  const { databases } = await createSessionServerClient()
  return await databases.getDocument(
    'production-main',
    'databases',
    `${databaseId}`
  )
}

export async function getCompanyData(databaseId: string) {
  const { databases } = await createSessionServerClient()
  const companyDataResponse: CompanyData = await databases.getDocument(
    'production-main',
    'companydata',
    `${databaseId}`
  )
  return companyDataResponse
}
