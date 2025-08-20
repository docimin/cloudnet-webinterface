'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'gt-next/client'
import { LockIcon } from 'lucide-react'

export default function NoAccess() {
  const router = useRouter()
  const mainT = useTranslations('Main')

  return (
    <div className="h-svh flex flex-col items-center justify-center gap-4 text-center">
      <LockIcon className="h-24 w-24 text-muted-foreground" />
      <h1 className="text-[7rem] font-extrabold leading-tight">401</h1>
      <span className="text-lg font-medium">{mainT('unauthorized')}</span>
      <p className="text-muted-foreground">{mainT('noAccess')}</p>
      <div className="mt-6">
        <Button variant="outline" onClick={() => router.back()}>
          {mainT('goBack')}
        </Button>
      </div>
    </div>
  )
}
