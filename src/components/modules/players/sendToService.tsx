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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { playerApi } from '@/lib/client-api'

export default function SendToService({ player }: { player: OnlinePlayer }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [target, setTarget] = useState('')
  const [type, setType] = useState<Type>('service')
  const [serverSelector, setServerSelector] =
    useState<ServerSelector>('HIGHEST_PLAYERS')

  const handleSend = async () => {
    if (type === 'service') {
      await playerApi.sendService(
        player.networkPlayerProxyInfo.uniqueId,
        target
      )
      toast.success('Player sent to service')
    } else if (type === 'task' || type === 'group') {
      await playerApi.sendTaskGroup(
        player.networkPlayerProxyInfo.uniqueId,
        target,
        serverSelector,
        type
      )
      toast.success(`Player sent to ${type}`)
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
          <div>
            <Label htmlFor={'target'}>Target</Label>
            <Input
              name={'target'}
              type={'text'}
              placeholder={'Enter a target'}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={'type'}>Type</Label>
            <Select
              name={'type'}
              defaultValue={'service'}
              onValueChange={setType}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {(type === 'task' || type === 'group') && (
            <div>
              <Label htmlFor={'serverSelector'}>Server Selector</Label>
              <Select
                name={'serverSelector'}
                defaultValue={'LOWEST_PLAYERS'}
                onValueChange={(e) => setServerSelector(e)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="LOWEST_PLAYERS">
                      Lowest Players
                    </SelectItem>
                    <SelectItem value="HIGHEST_PLAYERS">
                      Highest Players
                    </SelectItem>
                    <SelectItem value="RANDOM">Random</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </DialogHeader>
        <Button variant={'destructive'} type={'button'} onClick={handleSend}>
          Send to server
        </Button>
      </DialogContent>
    </Dialog>
  )
}
