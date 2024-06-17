'use client'
import { Button } from '@/components/ui/button'
import { deleteTask } from '@/utils/actions/tasks/deleteTask'
import { updateTask } from '@/utils/actions/tasks/updateTask'
import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'

function DeleteButton({ taskId }: { taskId: string }) {
  const router = useRouter()

  const handleDelete = async () => {
    const data = await deleteTask(taskId)
    if (data.status === 204) {
      router.push('/dashboard/tasks')
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'destructive'}>Delete task</Button>
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
  )
}

function UpdateButton({ taskId, body }: { taskId: string; body: any }) {
  const handleUpdate = async () => {
    await updateTask(taskId, body)
  }

  return <Button onClick={handleUpdate}>Update task</Button>
}

export default function TaskClientPage({
  taskId,
  hasEditPermissions,
  hasDeletePermissions,
  taskConfigData,
  children,
}: {
  taskId: string
  hasEditPermissions: boolean
  hasDeletePermissions: boolean
  taskConfigData: string
  children: any
}) {
  const [body, setBody] = useState(taskConfigData)
  return (
    <div>
      <div className={'flex items-center justify-between'}>
        {hasEditPermissions && <UpdateButton taskId={taskId} body={body} />}
        {hasDeletePermissions && <DeleteButton taskId={taskId} />}
      </div>
      {children}
      <div className="w-full mt-8">
        <Label htmlFor="json">JSON</Label>
        <div className="mt-2">
          <Textarea
            name="json"
            id="json"
            className={'h-96'}
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
