import Header from '@/components/header/header-server'
import { notFound, redirect } from 'next/navigation'
import { locales } from '@/navigation'
import { checkAuthToken } from '@/lib/server-calls'
import { getTranslations } from 'next-intl/server'

export default async function LocaleLayout({ children, params: { locale } }) {
  // Get locales from navigation.ts
  // Validate that the incoming `locale` parameter is valid
  const isValidLocale = locales.includes(locale)
  if (!isValidLocale) notFound()

  const accountData = await checkAuthToken()
  if (accountData.status === 401) {
    redirect('/')
  }

  const navigation = await getTranslations({ locale, namespace: 'Navigation' })

  return (
    <>
      <Header locale={locale} dashboard={navigation('dashboard')}>
        {children}
      </Header>
    </>
  )
}
