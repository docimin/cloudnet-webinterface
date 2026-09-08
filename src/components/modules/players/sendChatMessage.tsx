import { useTranslations } from 'gt-tanstack-start'
import { type MouseEvent, useEffect, useState } from 'react'
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
import { playerMessage } from '@/server/player'

export default function SendChatMessage({ player }: { player: OnlinePlayer }) {
  const playersT = useTranslations('Players')
  const [message, setMessage] = useState<string>('')
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const handleSend = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()
    try {
      await playerMessage({
        data: { id: player.networkPlayerProxyInfo.uniqueId, message }
      })
      toast.success(playersT('messageSent'))
    } catch {
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
        <Button variant={'outline'} size={'sm'}>
          {playersT('sendChatMessage')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {playersT('messagePlayer', { playerName: player?.name })}
          </DialogTitle>
          <DialogDescription>
            {playersT('confirmMessagePlayer', { playerName: player?.name })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor={'message'}>{playersT('message')}</Label>
          <Input
            id={'message'}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            type={'text'}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={'outline'}>{playersT('cancel')}</Button>
          </DialogClose>
          <Button onClick={handleSend}>{playersT('send')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
