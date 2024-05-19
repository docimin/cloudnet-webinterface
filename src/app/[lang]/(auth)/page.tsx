import Client from './page.client'
import { redirect } from 'next/navigation'
import { getAccountServer } from '@/lib/server-calls'

export default async function Page() {
  const accountData = await getAccountServer()

  return (
    <div className={'h-full w-full'}>
      {accountData.code !== 401 ? redirect('/dashboard') : <Client />}
    </div>
  )
}
