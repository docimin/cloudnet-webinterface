'use client'
import { Button } from '@/components/ui/button'
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
import { useRouter } from 'next/navigation'
import { serviceApi } from '@/lib/client-api'

function DeleteButton({ serviceId }: { serviceId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    const data = await serviceApi.delete(serviceId)
    if (data.status === 204) {
      router.push('/dashboard/services')
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'destructive'}>Delete service</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This will stop the service and temporary files are deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
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
  const handleStart = async () => {
    if (lifeCycle !== 'RUNNING') {
      await serviceApi.updateLifecycle(serviceId, 'start')
    }
  }
  return (
    <Button variant={'default'} onClick={handleStart}>
      Start service
    </Button>
  )
}

function RestartButton({ serviceId }: { serviceId: string }) {
  const handleRestart = async () =>
    await serviceApi.updateLifecycle(serviceId, 'restart')
  return (
    <Button variant={'default'} onClick={handleRestart}>
      Restart service
    </Button>
  )
}

function StopButton({ serviceId }: { serviceId: string }) {
  const router = useRouter()
  const handleStop = async () => {
    const data = await serviceApi.updateLifecycle(serviceId, 'stop')
    if (data.status === 204) {
      router.push('/dashboard/services')
    }
  }
  return (
    <Button variant={'destructive'} onClick={handleStop}>
      Stop service
    </Button>
  )
}

export default function ServiceClientPage({
  serviceId,
  lifeCycle,
  hasLifecyclePermissions,
  hasDeletePermissions,
  children
}: {
  serviceId: string
  lifeCycle: LifeCycle
  hasLifecyclePermissions: boolean
  hasDeletePermissions: boolean
  children: any
}) {
  return (
    <div>
      <div className={'flex gap-x-1'}>
        {hasLifecyclePermissions && (
          <>
            <StartButton serviceId={serviceId} lifeCycle={lifeCycle} />
            <RestartButton serviceId={serviceId} />
            <StopButton serviceId={serviceId} />
          </>
        )}
        {hasDeletePermissions && <DeleteButton serviceId={serviceId} />}
      </div>
      {children}
    </div>
  )
}
