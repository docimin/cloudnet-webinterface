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
import { userApi } from '@/lib/client-api'
import { Form, FormField } from '@/components/ui/form'
import InputField from '@/components/fields/InputField'
import MultiSelectField from '@/components/fields/MultiSelectField'
import { useOptions } from '@/app/[locale]/(dashboard)/dashboard/users/[userId]/options'

const userSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  scopes: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      group: z.string()
    })
  )
})

type UserFormData = z.infer<typeof userSchema>

export default function CreateUser() {
  const router = useRouter()
  const options = useOptions()
  const [dialogOpen, setDialogOpen] = useState(false)

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: '',
      password: '',
      scopes: []
    }
  })

  const onSubmit = async (data: UserFormData) => {
    // Transform scopes to just the values
    const transformedData = {
      username: data.username,
      password: data.password,
      scopes: data.scopes.map((scope) => scope.value)
    }

    try {
      const response = await userApi.create(transformedData)
      if (response) {
        toast.success('User has been created')
        form.reset()
        setDialogOpen(false)
        router.refresh()
      } else {
        toast.error('Failed to create user')
      }
    } catch (error) {
      toast.error('Failed to create user')
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button>Add new</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add user</DialogTitle>
          <DialogDescription className={'pb-4'}>
            Are you sure you want to add a new user?
          </DialogDescription>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <InputField
                    label="Username"
                    description="Enter the username of the user"
                    placeholder="Enter username"
                    field={field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <InputField
                    label="Password"
                    description="Enter the password of the user"
                    placeholder="Enter password"
                    type="password"
                    field={field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="scopes"
                render={({ field }) => (
                  <MultiSelectField
                    label="Scopes"
                    description="Select the scopes of the user"
                    options={options}
                    field={field}
                    placeholder="Select scopes"
                    groupBy="group"
                  />
                )}
              />
              <Button type="submit">Create</Button>
            </form>
          </Form>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  )
}
