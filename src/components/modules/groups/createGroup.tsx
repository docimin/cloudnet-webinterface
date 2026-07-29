import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import InputField from '@/components/fields/InputField'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Form, FormField } from '@/components/ui/form'
import { groupUpdate } from '@/server/group'

const buildGroupSchema = (nameRequired: string) =>
  z.object({
    name: z.string().min(1, nameRequired),
    jvmOptions: z.array(z.string()).default([]),
    processParameters: z.array(z.string()).default([]),
    environmentVariables: z.record(z.string(), z.string()).default({}),
    targetEnvironments: z.array(z.string()).default([]),
    templates: z.array(z.string()).default([]),
    deployments: z.array(z.string()).default([]),
    includes: z.array(z.string()).default([]),
    properties: z.record(z.string(), z.string()).default({})
  })

type GroupSchema = ReturnType<typeof buildGroupSchema>
type GroupFormData = z.infer<GroupSchema>

export default function CreateGroup() {
  const router = useRouter()
  const groupsT = useTranslations('Groups')
  const mainT = useTranslations('Main')
  const [dialogOpen, setDialogOpen] = useState(false)
  const groupSchema = buildGroupSchema(
    mainT('required', { field: groupsT('name') })
  )

  // zod v4 defaults make the schema input differ from its output
  const form = useForm<z.input<GroupSchema>, unknown, GroupFormData>({
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
      const response = await groupUpdate({ data })
      if (response) {
        toast.success(groupsT('groupCreated'))
        form.reset()
        setDialogOpen(false)
        router.invalidate()
      } else {
        toast.error(groupsT('groupCreateFailed'))
      }
    } catch {
      toast.error(groupsT('groupCreateFailed'))
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="mr-2 size-4" />
          {groupsT('addNew')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{groupsT('addGroup')}</DialogTitle>
          <DialogDescription>
            {groupsT('addGroupDescription')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <InputField
                  label={groupsT('name')}
                  description={groupsT('nameDescription')}
                  placeholder={groupsT('namePlaceholder')}
                  field={field}
                />
              )}
            />
            <DialogFooter>
              <Button type="submit">{mainT('create')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
