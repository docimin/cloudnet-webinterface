import { useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'

export default function RefreshButton() {
  const router = useRouter()
  const mainT = useTranslations('Main')

  const refresh = () => {
    router.invalidate()
    toast.info(mainT('refreshing'))
  }

  return (
    <Button variant={'ghost'} onClick={refresh}>
      {mainT('refresh')}
    </Button>
  )
}
