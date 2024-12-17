'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'
import { unstable_noStore } from 'next/cache'

export async function createTicket() {
  unstable_noStore()
  const requiredPermissions = []

  const data = await postWithPermissions(`/auth/ticket`, requiredPermissions, {
    scopes: ['cloudnet_rest:service_read'],
  })

  if (data.secret) {
    return data.secret
  } else {
    return data
  }
}
