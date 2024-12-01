import Header from '@/components/header/header-server'
import { redirect } from '@/i18n/routing'
import { checkAuthToken } from '@/lib/server-calls'
import { getTranslations } from 'next-intl/server'

export default async function LocaleLayout(props) {
  const params = await props.params

  const { locale } = params

  const accountData = await checkAuthToken()
  if (accountData.status === 401) {
    redirect({ href: '/', locale })
  }

  const navigation = await getTranslations({ locale, namespace: 'Navigation' })

  return (
    <>
      <Header locale={locale} dashboard={navigation('dashboard')}>
        {props.children}
      </Header>
    </>
  )
}
