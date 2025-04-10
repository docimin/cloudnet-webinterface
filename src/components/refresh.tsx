'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useDict } from 'gt-next/client'

export default function RefreshButton() {
  const router = useRouter()
  const mainT = useDict('Main')

  const refresh = () => {
    router.refresh()
    toast.info(mainT('refreshing'))
  }

  return (
    <Button variant={'ghost'} onClick={refresh}>
      {mainT('refresh')}
    </Button>
  )
}
