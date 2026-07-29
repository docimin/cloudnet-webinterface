import { useTranslations } from 'gt-tanstack-start'
import { Button } from '@/components/ui/button'

export default function Maintenance() {
  const mainT = useTranslations('Main')

  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-status-code font-bold leading-tight">503</h1>
        <span className="font-medium">{mainT('maintenance')}</span>
        <p className="text-center text-muted-foreground">
          {mainT('maintenanceDescription')}
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline">{mainT('learnMore')}</Button>
        </div>
      </div>
    </div>
  )
}
