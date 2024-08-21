'use client';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/alert-dialog';
import { useRouter } from '@/navigation';
import { deleteService } from '@/utils/actions/services/deleteService';
import { updateLifecycle } from '@/utils/actions/modules/updateLifecycle';
import { ServiceLifeCycleUpdate } from '@/utils/actions/services/updateServiceLifecycle';

function DeleteButton({ serviceId }: { serviceId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    const data = await deleteService(serviceId);
    if (data.status === 204) {
      router.push('/dashboard/services');
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'destructive'}>Delete service</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your task
            and remove your data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function StartButton({ serviceId, lifeCycle }: { serviceId: string, lifeCycle: LifeCycle }) {
  const handleStart = async () => {
    if (lifeCycle !== LifeCycle.RUNNING) {
      await updateLifecycle(serviceId, ServiceLifeCycleUpdate.START);
    }
  };
  return (
    <Button variant={'default'} onClick={handleStart}>Start service</Button>
  );
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
      <div className={'flex items-center justify-between'}>
        {hasLifecyclePermissions && (
          <StartButton serviceId={serviceId} lifeCycle={lifeCycle} />
        )}{' '}
        {hasDeletePermissions && <DeleteButton serviceId={serviceId} />}
      </div>
      {children}
    </div>
  );
}
