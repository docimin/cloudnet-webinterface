import Header from '@/components/header/header-server'
import { notFound, redirect } from 'next/navigation'
import { locales } from '@/navigation'
import { getAccountServer } from '@/lib/server-calls'

export default async function LocaleLayout({ children, params: { lang } }) {
  // Get locales from navigation.ts
  // Validate that the incoming `locale` parameter is valid
  const isValidLocale = locales.includes(lang)
  if (!isValidLocale) notFound()

  // Check if user is logged in
  const accountData = await getAccountServer()
  if (accountData.code === 401) redirect('/')

  return (
    <>
      <Header>{children}</Header>
    </>
  )
}
