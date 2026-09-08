import { useTranslations } from 'gt-tanstack-start'
import { useState } from 'react'
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
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { playerConnect, playerConnectService } from '@/server/player'

type Type = 'service' | 'task' | 'group'
type ServerSelector = 'LOWEST_PLAYERS' | 'HIGHEST_PLAYERS' | 'RANDOM'

export default function SendToService({ player }: { player: OnlinePlayer }) {
  const playersT = useTranslations('Players')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [target, setTarget] = useState('')
  const [type, setType] = useState<Type>('service')
  const [serverSelector, setServerSelector] =
    useState<ServerSelector>('LOWEST_PLAYERS')

  const handleSend = async () => {
    if (type === 'service') {
      await playerConnectService({
        data: { id: player.networkPlayerProxyInfo.uniqueId, target }
      })
      toast.success(playersT('playerSentToService'))
    } else if (type === 'task' || type === 'group') {
      await playerConnect({
        data: {
          id: player.networkPlayerProxyInfo.uniqueId,
          target,
          serverSelector,
          type
        }
      })
      toast.success(playersT('playerSentToType', { type }))
    }
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant={'outline'} size={'sm'}>
          {playersT('sendToService')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {playersT('sendPlayerToServer', { playerName: player?.name })}
          </DialogTitle>
          <DialogDescription>
            {playersT('confirmSendPlayer', { playerName: player?.name })}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={'target'}>{playersT('selectService')}</Label>
            <Input
              id={'target'}
              name={'target'}
              type={'text'}
              className="font-mono"
              placeholder={playersT('enterServiceName')}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={'type'}>{playersT('type')}</Label>
            <Select
              name={'type'}
              defaultValue={'service'}
              onValueChange={(value) => setType(value as Type)}
            >
              <SelectTrigger id={'type'} className="w-full">
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
            <div className="space-y-2">
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
                <SelectTrigger id={'serverSelector'} className="w-full">
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
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={'outline'}>{playersT('cancel')}</Button>
          </DialogClose>
          <Button type={'button'} onClick={handleSend}>
            {playersT('send')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
