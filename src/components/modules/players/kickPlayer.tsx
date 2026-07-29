import { useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { type MouseEvent, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { playerKick } from '@/server/player'

export default function KickPlayer({ player }: { player: OnlinePlayer }) {
  const playersT = useTranslations('Players')
  const [kickReason, setKickReason] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const navigate = useNavigate()
  const handleKick = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    try {
      await playerKick({
        data: {
          id: player.networkPlayerProxyInfo.uniqueId,
          message: kickReason ? kickReason : 'Bye!'
        }
      })
      navigate({ to: '/{-$locale}/dashboard/players' })
      toast.success(playersT('playerKicked'))
    } catch {
      toast.error(playersT('kickFailed'))
    }
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant={'destructive'} size={'sm'}>
          {playersT('kickPlayer')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {playersT('kickPlayerTitle', { playerName: player?.name })}
          </DialogTitle>
          <DialogDescription>
            {playersT('confirmKickPlayer', { playerName: player?.name })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={'kickReason'}>{playersT('kickReason')}</Label>
          <Input
            id={'kickReason'}
            value={kickReason}
            onChange={(e) => setKickReason(e.target.value)}
            type={'text'}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={'outline'}>{playersT('cancel')}</Button>
          </DialogClose>
          <Button variant={'destructive'} onClick={handleKick}>
            {playersT('kickPlayer')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
