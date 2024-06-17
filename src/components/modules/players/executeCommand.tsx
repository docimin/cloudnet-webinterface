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
import { useToast } from '@/components/ui/use-toast'
import { executeCommand } from '@/utils/actions/players/executeCommand'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function ExecuteCommand({ player }: { player: OnlinePlayer }) {
  const { toast } = useToast()
  const [command, setMessage] = useState<string>('')
  const [isProxy, setIsProxy] = useState<boolean>(false)
  const [dialogOpen, setDialogOpen] = useState<boolean>(false)

  const handleSend = async (event: any) => {
    event.preventDefault()
    const data = await executeCommand(
      player.networkPlayerProxyInfo.uniqueId,
      command,
      isProxy
    )

    if (data) {
      toast({
        description: 'Command has been executed',
      })
    } else {
      toast({
        title: 'Failed',
        description: 'Failed to execute command',
        variant: 'destructive',
      })
    }
    setDialogOpen(false)
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
                onChange={(e) => setMessage(e.target.value)}
                type={'text'}
                className="border-0 pl-0 align-middle bg-transparent ml-1 focus:ring-0 focus:outline-none focus:border-0 focus-visible:ring-0 focus-visible:outline-none focus-visible:border-0 focus-visible:ring-offset-0"
              />
            </div>
          </div>
          <div>
            <Select onValueChange={(value) => setIsProxy(value === 'true')}>
              <SelectTrigger>
                <SelectValue placeholder="Proxy command?" />
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
