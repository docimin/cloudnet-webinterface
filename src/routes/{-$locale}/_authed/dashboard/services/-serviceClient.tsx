import { useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { PlayIcon, RotateCwIcon, SquareIcon, Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { serviceDelete, serviceLifecycle } from '@/server/service'

function DeleteButton({
  serviceId,
  name
}: {
  serviceId: string
  name: string
}) {
  const navigate = useNavigate()
  const servicesT = useTranslations('Services')
  const [typed, setTyped] = useState('')

  const handleDelete = async () => {
    // re-checked here so the gate survives losing the disabled attribute
    if (typed !== name) return
    try {
      await serviceDelete({ data: { id: serviceId } })
      navigate({ to: '/{-$locale}/dashboard/services' })
    } catch {
      toast.error(servicesT('deleteFailed'))
    }
  }

  return (
    <AlertDialog onOpenChange={() => setTyped('')}>
      <AlertDialogTrigger asChild>
        <Button variant={'destructive'} size={'sm'}>
          <Trash2Icon className="mr-2 size-4" />
          {servicesT('delete')}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{servicesT('deleteTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {servicesT('deleteDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="delete-service-confirm">
            {servicesT('typeNameToConfirm')}
          </Label>
          <Input
            id="delete-service-confirm"
            className="font-mono"
            value={typed}
            onChange={(event) => setTyped(event.target.value)}
          />
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>{servicesT('cancel')}</AlertDialogCancel>
          <AlertDialogAction disabled={typed !== name} onClick={handleDelete}>
            {servicesT('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function StartButton({
  serviceId,
  lifeCycle
}: {
  serviceId: string
  lifeCycle: LifeCycle
}) {
  const servicesT = useTranslations('Services')

  const handleStart = async () => {
    if (lifeCycle !== 'RUNNING') {
      await serviceLifecycle({ data: { id: serviceId, target: 'start' } })
    }
  }
  return (
    <Button variant={'default'} size={'sm'} onClick={handleStart}>
      <PlayIcon className="mr-2 size-4" />
      {servicesT('start')}
    </Button>
  )
}

function RestartButton({ serviceId }: { serviceId: string }) {
  const servicesT = useTranslations('Services')

  const handleRestart = async () =>
    await serviceLifecycle({ data: { id: serviceId, target: 'restart' } })
  return (
    <Button variant={'outline'} size={'sm'} onClick={handleRestart}>
      <RotateCwIcon className="mr-2 size-4" />
      {servicesT('restart')}
    </Button>
  )
}

function StopButton({ serviceId }: { serviceId: string }) {
  const navigate = useNavigate()
  const servicesT = useTranslations('Services')

  const handleStop = async () => {
    await serviceLifecycle({ data: { id: serviceId, target: 'stop' } })
    navigate({ to: '/{-$locale}/dashboard/services' })
  }
  return (
    <Button variant={'outline'} size={'sm'} onClick={handleStop}>
      <SquareIcon className="mr-2 size-4" />
      {servicesT('stop')}
    </Button>
  )
}

export default function ServiceActions({
  serviceId,
  name,
  lifeCycle,
  hasLifecyclePermissions,
  hasDeletePermissions
}: {
  serviceId: string
  name: string
  lifeCycle: LifeCycle
  hasLifecyclePermissions: boolean
  hasDeletePermissions: boolean
}) {
  return (
    <div className={'flex flex-wrap items-center gap-2'}>
      {hasLifecyclePermissions && (
        <>
          <StartButton serviceId={serviceId} lifeCycle={lifeCycle} />
          <RestartButton serviceId={serviceId} />
          <StopButton serviceId={serviceId} />
        </>
      )}
      {hasDeletePermissions && (
        <DeleteButton serviceId={serviceId} name={name} />
      )}
    </div>
  )
}
