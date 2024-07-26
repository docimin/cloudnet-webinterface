'use client'

import { Button } from '@/components/ui/button'
import { useRouter } from '@/navigation'
import { useToast } from '@/components/ui/use-toast'

export default function RefreshButton() {
  const router = useRouter()
  const { toast } = useToast()

  const refresh = () => {
    router.refresh()
    toast({
      title: 'Refreshing...',
    })
  }

  return (
    <Button variant={'ghost'} onClick={refresh}>
      Refresh
    </Button>
  )
}
