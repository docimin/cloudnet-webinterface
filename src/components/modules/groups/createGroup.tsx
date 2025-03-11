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
import { updateGroup } from '@/utils/actions/groups/updateGroup'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function CreateGroup() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const handleSubmit = async (event: any) => {
    event.preventDefault()
    const data = await updateGroup({
      name: name,
      jvmOptions: [],
      processParameters: [],
      environmentVariables: {},
      targetEnvironments: [],
      templates: [],
      deployments: [],
      includes: [],
      properties: {},
    })
    if (data) {
      toast.success('Group has been created')
    } else {
      toast.error('Failed to create group')
    }
    router.refresh()
    setDialogOpen(false)
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button>Add new</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add group</DialogTitle>
          <DialogDescription className={'pb-4'}>
            Are you sure you want to add a new group?
          </DialogDescription>
          <Label htmlFor={'name'}>Name</Label>
          <Input
            id={'name'}
            value={name}
            onChange={(e) => setName(e.target.value)}
            type={'text'}
          />
        </DialogHeader>
        <Button onClick={handleSubmit}>Create</Button>
      </DialogContent>
    </Dialog>
  )
}
