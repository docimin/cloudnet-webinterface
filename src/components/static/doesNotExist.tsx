import { useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { Button } from '@/components/ui/button'

export default function DoesNotExist({ name }: { name: string }) {
  const router = useRouter()
  const mainT = useTranslations('Main')

  const goBack = () => {
    if (router.history.canGoBack()) router.history.back()
    else router.navigate({ to: '/{-$locale}' })
  }

  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-status-code font-bold leading-tight">404</h1>
        <span className="font-medium">{mainT('notFound', { name })}</span>
        <p className="text-center text-muted-foreground">
          {mainT('notFoundDescription', { name })}
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={goBack}>
            {mainT('goBack')}
          </Button>
        </div>
      </div>
    </div>
  )
}
