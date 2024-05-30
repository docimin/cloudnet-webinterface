import Client from './page.client'
import { redirect } from 'next/navigation'
import { checkAuthToken } from '@/lib/server-calls'

export default async function Page() {
  const accountData = await checkAuthToken()
  console.log(accountData)
  if (accountData.status !== 401) {
    //redirect('/dashboard')
  }

  return (
    <div className={'h-full w-full'}>
      <Client />
    </div>
  )
}
