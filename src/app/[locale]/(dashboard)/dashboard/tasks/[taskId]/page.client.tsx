'use client'
import { Button } from '@/components/ui/button'
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
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Terminal } from 'lucide-react'
import { toast } from 'sonner'
import { taskApi } from '@/lib/client-api'
import { useTranslations } from 'gt-next/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import TaskFormEditor from '@/components/editors/taskFormEditor'

function DeleteButton({ taskId }: { taskId: string }) {
  const router = useRouter()
  const taskT = useTranslations('Tasks')

  const handleDelete = async () => {
    const data = await taskApi.delete(taskId)
    if (data.status === 204) {
      router.push('/dashboard/tasks')
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant={'destructive'}>{taskT('deleteTask')}</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{taskT('deleteConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {taskT('deleteConfirmDescription')}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{taskT('cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>
            {taskT('delete')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function UpdateButton({
  body,
  originalName,
  router
}: {
  body: any
  originalName: string
  router: any
}) {
  const taskT = useTranslations('Tasks')

  const handleUpdate = async () => {
    try {
      const updatedTask = JSON.parse(body)
      if (updatedTask.name !== originalName) {
        toast.warning(taskT('taskNameChanged'))
        return
      }
      const response = await taskApi.update(updatedTask)
      if (response.status === 204) {
        toast.success(taskT('taskUpdated'))
        router.refresh()
      } else {
        toast.error(taskT('updateFailed'))
      }
    } catch (error) {
      toast.error(taskT('invalidJson'))
    }
  }

  return <Button onClick={handleUpdate}>{taskT('updateTask')}</Button>
}

export default function TaskClientPage({
  taskName,
  taskId,
  hasEditPermissions,
  hasDeletePermissions,
  taskConfigData,
  children
}: {
  taskName: string
  taskId: string
  hasEditPermissions: boolean
  hasDeletePermissions: boolean
  taskConfigData: any
  children: any
}) {
  const [body, setBody] = useState(taskConfigData)
  const router = useRouter()
  const taskT = useTranslations('Tasks')

  return (
    <div>
      <div className={'flex items-center justify-between'}>
        {hasEditPermissions && (
          <UpdateButton body={body} originalName={taskName} router={router} />
        )}
        {hasDeletePermissions && <DeleteButton taskId={taskId} />}
      </div>
      <Alert className={'mt-8'}>
        <Terminal className="h-4 w-4" />
        <AlertTitle>{taskT('headsUp')}</AlertTitle>
        <AlertDescription>{taskT('nameChangeWarning')}</AlertDescription>
      </Alert>
      {children}
      <div className="w-full mt-8">
        <Tabs defaultValue="form">
          <TabsList>
            <TabsTrigger value="form">Form</TabsTrigger>
            <TabsTrigger value="json">{taskT('json')}</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="mt-4">
            <TaskFormEditor task={JSON.parse(taskConfigData)} taskName={taskName} />
          </TabsContent>
          <TabsContent value="json" className="mt-4">
            <Label htmlFor="json">{taskT('json')}</Label>
            <Textarea
              name="json"
              id="json"
              className={'h-96 font-mono text-xs mt-2'}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
