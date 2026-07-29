import { zodResolver } from '@hookform/resolvers/zod'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import InputField from '@/components/fields/InputField'
import { formatDate } from '@/components/formatDate'
import PageLayout from '@/components/pageLayout'
import DoesNotExist from '@/components/static/doesNotExist'
import NoAccess from '@/components/static/noAccess'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { Option } from '@/components/ui/custom/multi-select'
import { Form, FormField } from '@/components/ui/form'
import { cn } from '@/lib/utils'
import { currentPermissions } from '@/server/auth'
import { userDelete, userGet, userUpdate } from '@/server/user'
import { useOptions } from './-options'

const requiredPermissions = [
  'cloudnet_rest:user_read',
  'cloudnet_rest:user_get',
  'global:admin'
]

const scopeSchema = z
  .object({
    value: z.string(),
    label: z.string(),
    group: z.union([z.string(), z.boolean()]).optional(),
    disable: z.boolean().optional(),
    fixed: z.boolean().optional()
  })
  .catchall(z.union([z.string(), z.boolean()]).optional())

const buildUserSchema = (usernameRequired: string) =>
  z.object({
    username: z.string().min(1, usernameRequired),
    password: z.string().optional(),
    scopes: z.array(scopeSchema)
  })

type UserFormData = z.infer<ReturnType<typeof buildUserSchema>>

export const Route = createFileRoute(
  '/{-$locale}/_authed/dashboard/users/$userId'
)({
  loader: async ({ params }) => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )

    if (!hasPermissions) {
      return { hasPermissions, user: null }
    }

    let user: User | null = null
    try {
      user = await userGet({ data: { id: params.userId } })
    } catch {
      return { hasPermissions, user: null }
    }

    return { hasPermissions, user }
  },
  component: UserPage
})

function UserPage() {
  const { hasPermissions, user } = Route.useLoaderData()
  const usersT = useTranslations('Users')

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!user) {
    return <DoesNotExist name={usersT('title')} />
  }

  return (
    <PageLayout
      title={usersT('editTitle', {
        username: user?.username
      })}
    >
      <UserClientPage user={user} />
    </PageLayout>
  )
}

function UserClientPage({ user }: { user: User }) {
  const navigate = useNavigate()
  const options = useOptions()
  const usersT = useTranslations('Users')
  const mainT = useTranslations('Main')

  const groups = useMemo(() => {
    const byGroup = new Map<string, Option[]>()
    for (const option of options) {
      const group = String(option.group ?? '')
      const bucket = byGroup.get(group)
      if (bucket) bucket.push(option)
      else byGroup.set(group, [option])
    }
    return [...byGroup]
  }, [options])

  const userSchema = buildUserSchema(
    mainT('required', { field: usersT('username') })
  )

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
      await userUpdate({ data: transformedData })
      toast.success(usersT('userUpdated'))
    } catch (error) {
      if (error.status === 401) {
        toast.error(usersT('noPermissionUpdate'))
      } else {
        toast.error(usersT('updateFailed'))
      }
    }
  }

  const deleteUser = async () => {
    try {
      await userDelete({ data: { id: user.id } })
      toast.success(usersT('userDeleted'))
      navigate({ to: '/{-$locale}/dashboard/users' })
    } catch (error) {
      if (error.status === 401) {
        toast.error(usersT('noPermissionDelete'))
      } else {
        toast.error(usersT('deleteFailed'))
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <dl className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
            <div>
              <dt className="text-muted-foreground">{usersT('id')}</dt>
              <dd className="font-mono">{user.id}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{usersT('createdAt')}</dt>
              <dd className="font-mono tabular-nums">
                {user.createdAt ? formatDate(new Date(user.createdAt)) : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{usersT('modifiedAt')}</dt>
              <dd className="font-mono tabular-nums">
                {user.modifiedAt ? formatDate(new Date(user.modifiedAt)) : '—'}
              </dd>
            </div>
          </dl>
          <div className="flex gap-2">
            <Button size="sm" type="submit">
              {mainT('save')}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={deleteUser}
              type="button"
            >
              {mainT('delete')}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:max-w-2xl md:grid-cols-2">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <InputField
                label={usersT('username')}
                description={usersT('usernameDescription')}
                placeholder=""
                disabled
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
                description={usersT('passwordDescription')}
                placeholder={usersT('passwordPlaceholder')}
                type="password"
                field={field}
              />
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="scopes"
          render={({ field }) => {
            const selected: UserFormData['scopes'] = field.value ?? []
            const isSelected = (value: string) =>
              selected.some((scope) => scope.value === value)

            const toggle = (option: Option) =>
              field.onChange(
                isSelected(option.value)
                  ? selected.filter((scope) => scope.value !== option.value)
                  : [
                      ...selected,
                      {
                        label: option.label,
                        value: option.value,
                        group: String(option.group ?? '')
                      }
                    ]
              )

            return (
              <section className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-medium">
                      {usersT('permissions')}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {usersT('permissionsDescription')}
                    </p>
                  </div>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">
                    {usersT('scopesSelected', {
                      selected: selected.length,
                      total: options.length
                    })}
                  </span>
                </div>

                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {groups.map(([group, groupOptions]) => {
                    const count = groupOptions.filter((option) =>
                      isSelected(option.value)
                    ).length

                    return (
                      <Card key={group}>
                        <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 p-3">
                          <CardTitle className="text-sm font-medium">
                            {group}
                          </CardTitle>
                          <span
                            className={cn(
                              'font-mono text-xs tabular-nums',
                              count
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                            )}
                          >
                            {count}/{groupOptions.length}
                          </span>
                        </CardHeader>
                        <CardContent className="space-y-0.5 p-2 pt-0">
                          {groupOptions.map((option) => {
                            const checked = isSelected(option.value)

                            return (
                              <label
                                key={option.value}
                                htmlFor={`scope-${option.value}`}
                                className={cn(
                                  'flex cursor-pointer items-start gap-2.5 rounded-md border-l-2 px-2 py-1.5 transition-colors',
                                  checked
                                    ? 'border-l-accent-bar bg-muted/50'
                                    : 'border-l-transparent hover:bg-muted/50'
                                )}
                              >
                                <Checkbox
                                  id={`scope-${option.value}`}
                                  className="mt-0.5"
                                  checked={checked}
                                  onCheckedChange={() => toggle(option)}
                                />
                                <span className="min-w-0">
                                  <span className="block text-sm leading-tight">
                                    {option.label}
                                  </span>
                                  <span className="block truncate font-mono text-xs text-muted-foreground">
                                    {option.value}
                                  </span>
                                </span>
                              </label>
                            )
                          })}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </section>
            )
          }}
        />
      </form>
    </Form>
  )
}
