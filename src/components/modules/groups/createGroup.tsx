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
import { Button } from '@/components/ui/button'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { groupApi } from '@/lib/client-api'
import { Form } from '@/components/ui/form'
import InputField from '@/components/fields/InputField'

const groupSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  jvmOptions: z.array(z.string()).default([]),
  processParameters: z.array(z.string()).default([]),
  environmentVariables: z.record(z.string()).default({}),
  targetEnvironments: z.array(z.string()).default([]),
  templates: z.array(z.string()).default([]),
  deployments: z.array(z.string()).default([]),
  includes: z.array(z.string()).default([]),
  properties: z.record(z.string()).default({})
})

type GroupFormData = z.infer<typeof groupSchema>

export default function CreateGroup() {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: '',
      jvmOptions: [],
      processParameters: [],
      environmentVariables: {},
      targetEnvironments: [],
      templates: [],
      deployments: [],
      includes: [],
      properties: {}
    }
  })

  const onSubmit = async (data: GroupFormData) => {
    try {
      const response = await groupApi.update(data)
      if (response) {
        toast.success('Group has been created')
        form.reset()
        setDialogOpen(false)
        router.refresh()
      } else {
        toast.error('Failed to create group')
      }
    } catch (error) {
      toast.error('Failed to create group')
    }
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
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <InputField
                label="Name"
                description="Enter the name of the group"
                placeholder="Enter group name"
                field={form.register('name')}
              />
              <Button type="submit">Create</Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
