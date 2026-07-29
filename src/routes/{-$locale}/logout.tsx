import * as Sentry from '@sentry/tanstackstart-react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { useEffect, useState } from 'react'
import { logout } from '@/server/auth'

export const Route = createFileRoute('/{-$locale}/logout')({
  component: LogoutPage
})

function LogoutPage() {
  const [error, setError] = useState<Error | null>(null)
  const navigate = useNavigate()
  const authT = useTranslations('Auth')

  useEffect(() => {
    logout()
      .then(() => {
        Sentry.addBreadcrumb({
          category: 'auth',
          message: 'Logged out',
          level: 'info'
        })
        navigate({ to: '/{-$locale}' })
      })
      .catch((err) => {
        setError(err)
      })
  }, [navigate])

  if (error) {
    return (
      <div>
        {authT('logoutError')}: {error.message}
      </div>
    )
  }

  return null
}
