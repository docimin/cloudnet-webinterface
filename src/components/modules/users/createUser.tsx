import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import InputField from '@/components/fields/InputField'
import MultiSelectField from '@/components/fields/MultiSelectField'
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
import { useOptions } from '@/routes/{-$locale}/_authed/dashboard/users/-options'
import { userCreate } from '@/server/user'

const buildUserSchema = (usernameRequired: string, passwordRequired: string) =>
  z.object({
    username: z.string().min(1, usernameRequired),
    password: z.string().min(1, passwordRequired),
    scopes: z.array(
      z.object({
        label: z.string(),
        value: z.string(),
        group: z.string()
      })
    )
  })

type UserFormData = z.infer<ReturnType<typeof buildUserSchema>>

export default function CreateUser() {
  const router = useRouter()
  const options = useOptions()
  const usersT = useTranslations('Users')
  const mainT = useTranslations('Main')
  const [dialogOpen, setDialogOpen] = useState(false)
  const userSchema = buildUserSchema(
    mainT('required', { field: usersT('username') }),
    mainT('required', { field: usersT('password') })
  )

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
      const response = await userCreate({ data: transformedData })
      if (response) {
        toast.success(usersT('userCreated'))
        form.reset()
        setDialogOpen(false)
        router.invalidate()
      } else {
        toast.error(usersT('createFailed'))
      }
    } catch {
      toast.error(usersT('createFailed'))
    }
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={(open) => setDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="mr-2 size-4" />
          {usersT('addUser')}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{usersT('addUser')}</DialogTitle>
          <DialogDescription>{usersT('addUserDescription')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <InputField
                  label={usersT('username')}
                  description={usersT('usernameDescription')}
                  placeholder={usersT('usernamePlaceholder')}
                  field={field}
                />
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <InputField
                  label={usersT('password')}
                  description={usersT('newPasswordDescription')}
                  placeholder={usersT('passwordPlaceholder')}
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
                  label={usersT('scopes')}
                  description={usersT('permissionsDescription')}
                  options={options}
                  field={field}
                  placeholder={usersT('permissionsPlaceholder')}
                  groupBy="group"
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
