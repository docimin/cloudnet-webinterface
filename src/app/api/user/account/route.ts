import { createSessionClient } from '@/app/appwrite-session'

export const runtime = 'edge'

export async function GET(request: Request) {
  if (
    request.headers
      .get('referer')
      ?.includes(process.env.NEXT_PUBLIC_DOMAIN_CLOUD as string)
  ) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { account } = await createSessionClient(request)

  try {
    const user = await account.get()
    return Response.json({ user: user })
  } catch (error) {
    return Response.json(error)
  }
}
