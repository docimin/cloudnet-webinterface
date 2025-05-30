'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { playerApi } from '@/lib/client-api'
import { useDict } from 'gt-next/client'

export default function KickPlayer({ player }: { player: OnlinePlayer }) {
  const playersT = useDict('Players')
  const [kickReason, setKickReason] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const router = useRouter()
  const handleKick = async (event: any) => {
    event.preventDefault()
    const response = await playerApi.kick(
      player.networkPlayerProxyInfo.uniqueId,
      kickReason ? kickReason : 'Bye!'
    )

    if (response.status === 204) {
      router.push('/dashboard/players')
      toast.success(playersT('playerKicked'))
    } else {
      toast.error(playersT('kickFailed'))
    }
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant={'destructive'}>{playersT('kickPlayer')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {playersT('kickPlayerTitle', {
              variables: { playerName: player?.name }
            })}
          </DialogTitle>
          <DialogDescription className={'pb-4'}>
            {playersT('confirmKickPlayer', {
              variables: { playerName: player?.name }
            })}
          </DialogDescription>
          <Label htmlFor={'kickReason'}>{playersT('kickReason')}</Label>
          <Input
            id={'kickReason'}
            value={kickReason}
            onChange={(e) => setKickReason(e.target.value)}
            type={'text'}
          />
        </DialogHeader>
        <Button variant={'destructive'} onClick={handleKick}>
          {playersT('kickPlayer')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
