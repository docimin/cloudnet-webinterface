'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'
import { unstable_noStore } from 'next/cache'

type TicketType = 'service' | 'node'

export async function createTicket(type: TicketType) {
  unstable_noStore()
  const requiredPermissions = []

  const scopes =
    type === 'node'
      ? ['cloudnet_rest:node_live_console']
      : ['cloudnet_rest:service_live_log']

  const data = await postWithPermissions(`/auth/ticket`, requiredPermissions, {
    scopes,
  })

  if (data.secret) {
    return data.secret
  } else {
    return data
  }
}
