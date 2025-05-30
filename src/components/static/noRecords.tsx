'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useDict } from 'gt-next/client'
import { FrownIcon } from 'lucide-react'

export default function NoRecords() {
  const router = useRouter()
  const mainT = useDict('Main')

  return (
    <div className="h-svh flex flex-col items-center justify-center gap-4 text-center">
      <FrownIcon className="h-24 w-24 text-muted-foreground" />
      <h1 className="text-[7rem] font-extrabold leading-tight">204</h1>
      <span className="text-lg font-medium">{mainT('nothingFound')}</span>
      <p className="text-muted-foreground">{mainT('noRecords')}</p>
      <div className="mt-6">
        <Button variant="outline" onClick={() => router.back()}>
          {mainT('goBack')}
        </Button>
      </div>
    </div>
  )
}
