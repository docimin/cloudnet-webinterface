'use server'
import { postWithPermissions } from '@/utils/actions/postWithPermissions'

export async function executeCommand(
  path: string,
  command: string,
  requiredPermissions: string[]
) {
  const data = await postWithPermissions(
    path,
    requiredPermissions,
    {
      command: command,
    },
    false
  )
  return data.ok
}
