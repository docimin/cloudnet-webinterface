import { createSessionServerClient } from '@/app/appwrite-session'

export async function getSetupSettings(orgId: string) {
  const { databases } = await createSessionServerClient()
  const data = await databases
    .listDocuments(`${orgId}`, 'setup-settings')
    .catch((error) => {
      return error
    })
  
  return data.documents[0] || []
}
