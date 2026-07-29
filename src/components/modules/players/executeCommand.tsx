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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { playerCommand } from '@/server/player'

export default function ExecuteCommand({ player }: { player: OnlinePlayer }) {
  const playersT = useTranslations('Players')
  const [command, setCommand] = useState<string>('')
  const [isProxy, setIsProxy] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const handleSend = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    try {
      await playerCommand({
        data: {
          id: player.networkPlayerProxyInfo.uniqueId,
          command,
          isProxy
        }
      })
      toast.success(playersT('commandExecuted'))
    } catch {
      toast.error(playersT('commandFailed'))
    }
    setDialogOpen(false)
    setCommand('')
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant={'outline'} size={'sm'}>
          {playersT('executeCommand')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {playersT('executeCommandTitle', { playerName: player?.name })}
          </DialogTitle>
          <DialogDescription>
            {playersT('confirmExecuteCommand', { playerName: player?.name })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={'command'}>{playersT('command')}</Label>
            <div className="flex items-center rounded-md border border-input bg-background ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
              <span className="select-none pl-3 font-mono text-sm text-muted-foreground">
                /
              </span>
              <Input
                id={'command'}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                type={'text'}
                className="border-0 bg-transparent pl-1 font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={'proxyCommand'}>{playersT('proxyCommand')}</Label>
            <Select
              defaultValue={'false'}
              onValueChange={(value) => setIsProxy(value === 'true')}
            >
              <SelectTrigger id={'proxyCommand'} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{playersT('true')}</SelectItem>
                <SelectItem value="false">{playersT('false')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={'outline'}>{playersT('cancel')}</Button>
          </DialogClose>
          <Button onClick={handleSend}>{playersT('execute')}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
