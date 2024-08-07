'use client'
import { useEffect, useState } from 'react'
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
import { useToast } from '@/components/ui/use-toast'
import { sendMessage } from '@/utils/actions/players/sendMessage'

export default function SendChatMessage({ player }: { player: OnlinePlayer }) {
  const { toast } = useToast()
  const [message, setMessage] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const handleSend = async (event: any) => {
    event.preventDefault()
    try {
      await sendMessage(player.networkPlayerProxyInfo.uniqueId, message)
      toast({
        description: 'Message has been sent',
      })
    } catch (error) {
      toast({
        title: 'Failed',
        description: 'Failed to send message',
        variant: 'destructive',
      })
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
        <Button>Send message</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message {player?.name}</DialogTitle>
          <DialogDescription className={'pb-4'}>
            You are about to send a message to {player?.name}
          </DialogDescription>
          <Label htmlFor={'message'}>Message:</Label>
          <Input
            id={'message'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type={'text'}
          />
        </DialogHeader>
        <Button variant={'destructive'} onClick={handleSend}>
          Send
        </Button>
      </DialogContent>
    </Dialog>
  )
}
