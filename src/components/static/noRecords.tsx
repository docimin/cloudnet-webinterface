'use client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useDict } from 'gt-next/client'

export default function NoRecords() {
  const router = useRouter()
  const mainT = useDict('Main')
  
  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">204</h1>
        <span className="font-medium">{mainT('nothingFound')}</span>
        <p className="text-center text-muted-foreground">
          {mainT('noRecords')}
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
