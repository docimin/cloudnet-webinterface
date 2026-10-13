import * as Sentry from '@sentry/tanstackstart-react'
import {
  createFileRoute,
  useLoaderData,
  useRouter
} from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { AppearanceSettings } from '@/components/appearance/appearanceSettings'
import PageLayout from '@/components/pageLayout'
import { resetAppearance, setAppearance } from '@/server/appearance'

export const Route = createFileRoute(
  '/{-$locale}/_authed/dashboard/appearance/'
)({
  component: AppearancePage
})

function AppearancePage() {
  const { appearance } = useLoaderData({ from: '__root__' })
  const router = useRouter()
  const appearanceT = useTranslations('Appearance')

  // the choice is already stored by now, so a failed refresh is not a failed save
  const refresh = () => {
    router.invalidate().catch((error) => Sentry.captureException(error))
  }

  return (
    <PageLayout title={appearanceT('title')}>
      <AppearanceSettings
        host={appearance.host}
        user={appearance.user}
        save={async (next) => {
          await setAppearance({ data: next })
          refresh()
        }}
        reset={async () => {
          await resetAppearance()
          refresh()
        }}
      />
    </PageLayout>
  )
}
