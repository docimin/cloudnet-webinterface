import Header from '@/components/header/header-server'
import { redirect } from 'next/navigation'
import { checkAuthToken } from '@/lib/server-calls'
import { getDict } from 'gt-next/server'

export default async function LocaleLayout(props) {
  const accountData = await checkAuthToken()
  if (accountData.status === 401) {
    redirect('/')
  }

  const navigation = await getDict('Navigation')

  return (
    <>
      <Header dashboard={navigation('dashboard')}>{props.children}</Header>
    </>
  )
}
