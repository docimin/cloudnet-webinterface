import Client from './page.client'
import { redirect } from 'next/navigation'
import { checkAuthToken } from '@/lib/server-calls'

export default async function Page() {
  return (
    <div className={'h-full w-full'}>
      <Client />
    </div>
  )
}
