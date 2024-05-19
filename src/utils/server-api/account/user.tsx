import { createSessionServerClient } from '@/app/appwrite-session'

export async function getUser() {
  const { account } = await createSessionServerClient()
  return await account.get().catch((error) => {
    return error
  })
}

export async function getTeams() {
  const { teams } = await createSessionServerClient()
  return await teams.list().catch((error) => {
    return error
  })
}

export async function getTeamMemberships(teamId: string) {
  const { teams } = await createSessionServerClient()
  return await teams.listMemberships(teamId).catch((error) => {
    return error
  })
}
