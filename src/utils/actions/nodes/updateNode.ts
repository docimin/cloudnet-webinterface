'use server'
import { getCookies } from '@/lib/server-calls'
import { checkToken } from '@/utils/actions/user/jwt'

export async function updateNode(
  nodeId: string,
  ip: FormDataEntryValue,
  port: FormDataEntryValue
) {
  const cookies = await getCookies()

  if (!cookies['at'] || !cookies['add']) {
    checkToken().then()
  }

  const updatedNode = {
    properties: {},
    uniqueId: `${nodeId}`,
    listeners: [
      {
        host: ip,
        port: port,
      },
    ],
  }

  try {
    const decodedUrl = decodeURIComponent(cookies['add'])

    const response = await fetch(`${decodedUrl}/cluster`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookies['at']}`,
      },
      body: JSON.stringify(updatedNode),
    })

    return response.ok
      ? { success: 'Node updated successfully', status: 200 }
      : {
          error: 'Failed to update node',
          status: 500,
        }
  } catch (error) {
    return { error: 'Failed to update node', status: 500 }
  }
}
