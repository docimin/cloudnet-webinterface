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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { executeCommand } from '@/utils/actions/commands/executeCommand'
import { toast } from 'sonner'

export default function ExecuteCommand({ player }: { player: OnlinePlayer }) {
  const [command, setCommand] = useState<string>('')
  const [isProxy, setIsProxy] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const handleSend = async (event: any) => {
    event.preventDefault()

    const requiredPermissions = [
      'cloudnet_bridge:player_write',
      'cloudnet_bridge:player_disconnect',
      'global:admin',
    ]

    const data = await executeCommand(
      `/player/online/${player.networkPlayerProxyInfo.uniqueId}/command?redirectToServer=${isProxy ? 'false' : 'true'}`,
      command,
      requiredPermissions
    )

    if (data) {
      toast.success('Command has been executed')
    } else {
      toast.error('Failed to execute command')
    }
    setDialogOpen(false)
    setCommand('')
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button>Execute command</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Execute command for {player?.name}</DialogTitle>
          <DialogDescription className={'pb-4'}>
            You are about to execute a command for {player?.name}
          </DialogDescription>
          <div className={'pb-4'}>
            <Label htmlFor={'command'}>Command:</Label>
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
            <Label htmlFor={'command'}>Proxy command?</Label>
            <Select
              defaultValue={'false'}
              onValueChange={(value) => setIsProxy(value === 'true')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </DialogHeader>
        <Button variant={'destructive'} onClick={handleSend}>
          Execute
        </Button>
      </DialogContent>
    </Dialog>
  )
}
