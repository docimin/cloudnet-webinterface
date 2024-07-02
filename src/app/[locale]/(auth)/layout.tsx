import { notFound } from 'next/navigation'
import { locales } from '@/navigation'

export default async function LocaleLayout({ children, params: { locale } }) {
  // Get locales from navigation.ts
  // Validate that the incoming `locale` parameter is valid
  const isValidLocale = locales.includes(locale)
  if (!isValidLocale) notFound()

  return <>{children}</>
}
