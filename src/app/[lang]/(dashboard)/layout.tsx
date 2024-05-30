import Header from '@/components/header/header-server'
import { notFound, redirect } from 'next/navigation'
import { locales } from '@/navigation'

export default async function LocaleLayout({ children, params: { lang } }) {
  // Get locales from navigation.ts
  // Validate that the incoming `locale` parameter is valid
  const isValidLocale = locales.includes(lang)
  if (!isValidLocale) notFound()

  return (
    <>
      <Header>{children}</Header>
    </>
  )
}
