import { createSessionClient } from '@/app/appwrite-session'

export const runtime = 'edge'

export async function GET(request: Request) {
  const { teams } = await createSessionClient(request)

  try {
    const teamList = await teams.list()
    return Response.json({ teams: teamList })
  } catch (error) {
    return Response.json(error)
  }
}
