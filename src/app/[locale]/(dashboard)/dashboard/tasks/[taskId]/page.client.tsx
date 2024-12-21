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
import { useRouter } from '@/i18n/routing'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'
import { toast } from 'sonner'

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

function UpdateButton({
  taskId,
  body,
  originalName,
}: {
  taskId: string
  body: any
  originalName: string
}) {
  const handleUpdate = async () => {
    try {
      const updatedTask = JSON.parse(body) // Assuming `body` is a JSON string of your task data
      if (updatedTask.name !== originalName) {
        toast.warning('Task name has been changed!')
        // Optionally, update the original name to the new name here or handle accordingly
        return // Stop the update process or handle accordingly
      }
      // Proceed with your update logic here if the name hasn't changed
      await updateTask(taskId, updatedTask)
      toast.success('Task updated successfully')
    } catch (error) {
      toast.error('Invalid JSON format.')
    }
  }

  return <Button onClick={handleUpdate}>Update task</Button>
}

export default function TaskClientPage({
  taskName,
  taskId,
  hasEditPermissions,
  hasDeletePermissions,
  taskConfigData,
  children,
}: {
  taskName: string
  taskId: string
  hasEditPermissions: boolean
  hasDeletePermissions: boolean
  taskConfigData: any
  children: any
}) {
  const [body, setBody] = useState(taskConfigData)

  return (
    <div>
      <div className={'flex items-center justify-between'}>
        {hasEditPermissions && (
          <UpdateButton taskId={taskId} body={body} originalName={taskName} />
        )}
        {hasDeletePermissions && <DeleteButton taskId={taskId} />}
      </div>
      <Alert className={'mt-8'}>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          Editing the &quot;name&quot; field will not change the task name.
          Instead, it will create a new task with the new name.
        </AlertDescription>
      </Alert>
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
