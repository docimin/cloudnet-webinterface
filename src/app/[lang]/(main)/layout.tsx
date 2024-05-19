import Header from '@/components/header/header-server'
import Footer from '@/components/footer'
import { notFound } from 'next/navigation'
import { locales } from '@/navigation'
import { getTranslations } from 'next-intl/server'

export default async function LocaleLayout({ children, params: { lang } }) {
  const main = await getTranslations({ lang, namespace: 'Main' })

  // Get locales from navigation.ts
  // Validate that the incoming `locale` parameter is valid
  const isValidLocale = locales.includes(lang)
  if (!isValidLocale) notFound()

  return (
    <>
      <Header>{children}</Header>
      <Footer />
    </>
  )
}
