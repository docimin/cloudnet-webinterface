'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from '@/i18n/routing'
import { toast } from 'sonner'

export default function RefreshButton() {
  const router = useRouter()

  const refresh = () => {
    router.refresh()
    toast.info('Refreshing...')
  }

  return (
    <Button variant={'ghost'} onClick={refresh}>
      Refresh
    </Button>
  )
}
