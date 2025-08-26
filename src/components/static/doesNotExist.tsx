'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'gt-next/client'

export default function DoesNotExist({ name }) {
  const router = useRouter()
  const mainT = useTranslations('Main')

  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">401</h1>
        <span className="font-medium">{mainT('notFound', { name })}</span>
        <p className="text-center text-muted-foreground">
          {mainT('notFoundDescription', { name })}
        </p>
        <div className="mt-6 flex gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            {mainT('goBack')}
          </Button>
        </div>
      </div>
    </div>
  )
}
