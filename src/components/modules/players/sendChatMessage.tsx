'use client'
import { useEffect, useState } from 'react'
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
import { toast } from 'sonner'
import { playerApi } from '@/lib/client-api'
import { useDict } from 'gt-next/client'

export default function SendChatMessage({ player }: { player: OnlinePlayer }) {
  const playersT = useDict('Players')
  const [message, setMessage] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const handleSend = async (event: any) => {
    event.preventDefault()
    try {
      await playerApi.sendMessage(
        player.networkPlayerProxyInfo.uniqueId,
        message
      )
      toast.success(playersT('messageSent'))
    } catch (error) {
      toast.error(playersT('messageFailed'))
    }
    setDialogOpen(false)
    setMessage('')
  }

  useEffect(() => {
    if (!dialogOpen) {
      setMessage('')
    }
  }, [dialogOpen])

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button>{playersT('sendChatMessage')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {playersT('messagePlayer', {
              variables: { playerName: player?.name }
            })}
          </DialogTitle>
          <DialogDescription className={'pb-4'}>
            {playersT('confirmMessagePlayer', {
              variables: { playerName: player?.name }
            })}
          </DialogDescription>
          <Label htmlFor={'message'}>{playersT('message')}:</Label>
          <Input
            id={'message'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type={'text'}
          />
        </DialogHeader>
        <Button variant={'destructive'} onClick={handleSend}>
          {playersT('send')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
