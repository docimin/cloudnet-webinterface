import { useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function ErrorScreen({ reset }: { reset?: () => void }) {
  const router = useRouter()
  const mainT = useTranslations('Main')

  const goBack = () => {
    if (router.history.canGoBack()) router.history.back()
    else router.navigate({ to: '/{-$locale}' })
  }

  return (
    <div className={cn('h-svh w-full')}>
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-status-code font-bold leading-tight">500</h1>
        <span className="font-medium">
          {mainT('errorTitle')} {`:')`}
        </span>
        <p className="text-center text-muted-foreground">
          {mainT('errorDescription')}
        </p>
        <div className="mt-6 flex gap-4">
          <Button
            variant="outline"
            onClick={() => (reset ? reset() : router.invalidate())}
          >
            {mainT('tryAgain')}
          </Button>
          <Button variant="outline" onClick={goBack}>
            {mainT('goBack')}
          </Button>
          <Button onClick={() => router.navigate({ to: '/{-$locale}' })}>
            {mainT('backToHome')}
          </Button>
        </div>
      </div>
    </div>
  )
}
