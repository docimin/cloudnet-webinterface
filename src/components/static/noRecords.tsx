import { useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { FrownIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NoRecords() {
  const router = useRouter()
  const mainT = useTranslations('Main')

  const goBack = () => {
    if (router.history.canGoBack()) router.history.back()
    else router.navigate({ to: '/{-$locale}' })
  }

  return (
    <div className="h-svh flex flex-col items-center justify-center gap-4 text-center">
      <FrownIcon className="h-24 w-24 text-muted-foreground" />
      <h1 className="text-status-code font-extrabold leading-tight">204</h1>
      <span className="text-lg font-medium">{mainT('nothingFound')}</span>
      <p className="text-muted-foreground">{mainT('noRecords')}</p>
      <div className="mt-6">
        <Button variant="outline" onClick={goBack}>
          {mainT('goBack')}
        </Button>
      </div>
    </div>
  )
}
