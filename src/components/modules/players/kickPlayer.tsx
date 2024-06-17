'use client'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { kickPlayer } from '@/utils/actions/players/kickPlayer'
import { useToast } from '@/components/ui/use-toast'

export default function KickPlayer({ player }: { player: OnlinePlayer }) {
  const { toast } = useToast()
  const [kickReason, setKickReason] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleKick = async (event: any) => {
    event.preventDefault()
    const data = await kickPlayer(
      player.networkPlayerProxyInfo.uniqueId,
      kickReason
    )
    if (data.status === 204) {
      toast({
        title: 'Kicked',
        description: 'Player has been kicked',
      })
    } else {
      toast({
        title: 'Failed',
        description: 'Failed to kick player',
        variant: 'destructive',
      })
    }
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant={'destructive'}>Kick player</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kick {player?.name}</DialogTitle>
          <DialogDescription className={'pb-4'}>
            Are you sure you want to kick {player?.name}?
          </DialogDescription>
          <Label htmlFor={'kickReason'}>Kick reason</Label>
          <Input
            id={'kickReason'}
            value={kickReason}
            onChange={(e) => setKickReason(e.target.value)}
            type={'text'}
          />
        </DialogHeader>
        <Button variant={'destructive'} onClick={handleKick}>
          Kick
        </Button>
      </DialogContent>
    </Dialog>
  )
}
