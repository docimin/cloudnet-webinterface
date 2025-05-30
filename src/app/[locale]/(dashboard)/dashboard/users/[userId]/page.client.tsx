'use client'
import { Button } from '@/components/ui/button'
import { useOptions } from './options'
import { toast } from 'sonner'
import { userApi } from '@/lib/client-api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormField } from '@/components/ui/form'
import InputField from '@/components/fields/InputField'
import MultiSelectField from '@/components/fields/MultiSelectField'
import { useRouter } from 'next/navigation'

const scopeSchema = z
  .object({
    value: z.string(),
    label: z.string(),
    group: z.union([z.string(), z.boolean()]).optional(),
    disable: z.boolean().optional(),
    fixed: z.boolean().optional()
  })
  .catchall(z.union([z.string(), z.boolean()]).optional())

const userSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().optional(),
  scopes: z.array(scopeSchema)
})

type UserFormData = z.infer<typeof userSchema>

export default function UserClientPage({ user }: { user: User }) {
  const router = useRouter()
  const options = useOptions()

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: user.username,
      password: '',
      scopes: user.scopes.map((scope) => {
        const option = options.find((opt) => opt.value === scope)
        return {
          label: option?.label || scope,
          value: scope,
          group: option?.group || 'Other'
        }
      })
    }
  })

  const onSubmit = async (data: UserFormData) => {
    // Only include password if it's not empty
    const transformedData = {
      id: user.id,
      scopes: data.scopes.map((scope) => scope.value),
      ...(data.password && { password: data.password })
    }

    try {
      await userApi.update(user.id, transformedData)
      toast.success('User updated successfully')
    } catch (error) {
      if (error.status === 401) {
        toast.error('No permission to update user.')
      } else {
        toast.error('Failed to update user')
      }
    }
  }

  const deleteUser = async () => {
    try {
      await userApi.delete(user.id)
      toast.success('User deleted successfully')
      router.push('/dashboard/users')
    } catch (error) {
      if (error.status === 401) {
        toast.error('No permission to delete user.')
      } else {
        toast.error('Failed to delete user')
      }
    }
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex gap-2">
          <div>
            <Button variant="outline" type="submit">
              Save
            </Button>
          </div>
          <div>
            <Button variant="destructive" onClick={deleteUser} type="button">
              Delete
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-8">
          <div className="col-span-6 sm:col-span-6 md:col-span-2">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <InputField
                  label="Username"
                  description="The username of the user"
                  placeholder=""
                  disabled
                  field={field}
                />
              )}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-8">
          <div className="col-span-6 sm:col-span-6 md:col-span-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <InputField
                  label="Password"
                  description="Enter a new password (leave empty to keep current password)"
                  placeholder="Enter password"
                  type="password"
                  field={field}
                />
              )}
            />
          </div>
        </div>

        <div className="mt-6 w-full">
          <FormField
            control={form.control}
            name="scopes"
            render={({ field }) => (
              <MultiSelectField
                label="Permissions / Scopes"
                description="Select the scopes for this user"
                options={options}
                field={field}
                placeholder="Select scopes..."
                groupBy="group"
              />
            )}
          />
        </div>
      </form>
    </Form>
  )
}
