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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { playerApi } from '@/lib/client-api'
import { toast } from 'sonner'
import { useTranslations } from 'gt-next/client'

export default function ExecuteCommand({ player }: { player: OnlinePlayer }) {
  const playersT = useTranslations('Players')
  const [command, setCommand] = useState<string>('')
  const [isProxy, setIsProxy] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const handleSend = async (event: any) => {
    event.preventDefault()

    const data = await playerApi.execute(
      player.networkPlayerProxyInfo.uniqueId,
      command,
      isProxy
    )

    if (data) {
      toast.success(playersT('commandExecuted'))
    } else {
      toast.error(playersT('commandFailed'))
    }
    setDialogOpen(false)
    setCommand('')
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button>{playersT('executeCommand')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {playersT('executeCommandTitle', { playerName: player?.name })}
          </DialogTitle>
          <DialogDescription className={'pb-4'}>
            {playersT('confirmExecuteCommand', { playerName: player?.name })}
          </DialogDescription>
          <div className={'pb-4'}>
            <Label htmlFor={'command'}>{playersT('command')}:</Label>
            <div className="flex rounded-md bg-background ring-1 ring-offset-background ring-inset focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-black/10 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-500 dark:ring-white/10">
              <span className="flex select-none items-center pl-3 text-gray-400 sm:text-sm">
                /
              </span>
              <Input
                id={'command'}
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                type={'text'}
                className="border-0 pl-0 align-middle bg-transparent ml-1 focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
          <div>
            <Label htmlFor={'command'}>{playersT('proxyCommand')}</Label>
            <Select
              defaultValue={'false'}
              onValueChange={(value) => setIsProxy(value === 'true')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{playersT('true')}</SelectItem>
                <SelectItem value="false">{playersT('false')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>
        <Button variant={'destructive'} onClick={handleSend}>
          {playersT('execute')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
