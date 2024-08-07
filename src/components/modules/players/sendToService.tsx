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
import { connectPlayerToService } from '@/utils/actions/players/connectPlayerToService'

export default function SendToService({ player }: { player: OnlinePlayer }) {
  const { toast } = useToast()
  const [kickReason, setKickReason] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [event, setEvent] = useState('')
  const [target, setTarget] = useState('')

  const handleSend = async () => {
    if (event === 'service') {
      await connectPlayerToService(
        player.networkPlayerProxyInfo.uniqueId,
        target
      )
    }
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button>Send to server</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send {player?.name} to somewhere..</DialogTitle>
          <DialogDescription className={'pb-4'}>
            Are you sure you want to send {player?.name} to a different server?
          </DialogDescription>
          <Label htmlFor={'kickReason'}>Kick reason</Label>
          <Input
            id={'kickReason'}
            value={kickReason}
            onChange={(e) => setKickReason(e.target.value)}
            type={'text'}
          />
        </DialogHeader>
        <Button variant={'destructive'} type={'button'} onClick={handleSend}>
          Send to server
        </Button>
      </DialogContent>
    </Dialog>
  )
}
