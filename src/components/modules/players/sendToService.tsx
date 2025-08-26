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
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { playerApi } from '@/lib/client-api'
import { useTranslations } from 'gt-next/client'

type Type = 'service' | 'task' | 'group'
type ServerSelector = 'LOWEST_PLAYERS' | 'HIGHEST_PLAYERS' | 'RANDOM'

export default function SendToService({ player }: { player: OnlinePlayer }) {
  const playersT = useTranslations('Players')
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
      toast.success(playersT('playerSentToService'))
    } else if (type === 'task' || type === 'group') {
      await playerApi.sendTaskGroup(
        player.networkPlayerProxyInfo.uniqueId,
        target,
        serverSelector,
        type
      )
      toast.success(playersT('playerSentToType', { type }))
    }
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button>{playersT('sendToService')}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {playersT('sendPlayerToServer', { playerName: player?.name })}
          </DialogTitle>
          <DialogDescription className={'pb-4'}>
            {playersT('confirmSendPlayer', { playerName: player?.name })}
          </DialogDescription>
          <div>
            <Label htmlFor={'target'}>{playersT('selectService')}</Label>
            <Input
              name={'target'}
              type={'text'}
              placeholder={playersT('enterServiceName')}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={'type'}>{playersT('type')}</Label>
            <Select
              name={'type'}
              defaultValue={'service'}
              onValueChange={(value) => setType(value as Type)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={playersT('selectType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="service">{playersT('service')}</SelectItem>
                  <SelectItem value="task">{playersT('task')}</SelectItem>
                  <SelectItem value="group">{playersT('group')}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {(type === 'task' || type === 'group') && (
            <div>
              <Label htmlFor={'serverSelector'}>
                {playersT('serverSelector')}
              </Label>
              <Select
                name={'serverSelector'}
                defaultValue={'LOWEST_PLAYERS'}
                onValueChange={(value) =>
                  setServerSelector(value as ServerSelector)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={playersT('selectType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="LOWEST_PLAYERS">
                      {playersT('lowestPlayers')}
                    </SelectItem>
                    <SelectItem value="HIGHEST_PLAYERS">
                      {playersT('highestPlayers')}
                    </SelectItem>
                    <SelectItem value="RANDOM">{playersT('random')}</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          )}
        </DialogHeader>
        <Button variant={'destructive'} type={'button'} onClick={handleSend}>
          {playersT('send')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
