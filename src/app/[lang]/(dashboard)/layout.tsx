import Header from '@/components/header/header-server'
import { notFound, redirect } from 'next/navigation'
import { locales } from '@/navigation'
import { checkAuthToken } from '@/lib/server-calls'

export default async function LocaleLayout({ children, params: { lang } }) {
  // Get locales from navigation.ts
  // Validate that the incoming `locale` parameter is valid
  const isValidLocale = locales.includes(lang)
  if (!isValidLocale) notFound()

  const accountData = await checkAuthToken()
  if (accountData.status === 401) {
    redirect('/')
  }

  return (
    <>
      <Header lang={lang}>{children}</Header>
    </>
  )
}
