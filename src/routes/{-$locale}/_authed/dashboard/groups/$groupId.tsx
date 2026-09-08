import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import {
  DownloadIcon,
  InfoIcon,
  LayersIcon,
  UploadIcon,
  WorkflowIcon
} from 'lucide-react'
import { toast } from 'sonner'
import { DashboardCard } from '@/components/dashboardCard'
import GroupFormEditor from '@/components/editors/groupFormEditor'
import PageLayout from '@/components/pageLayout'
import DoesNotExist from '@/components/static/doesNotExist'
import NoAccess from '@/components/static/noAccess'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { currentPermissions } from '@/server/auth'
import { groupDelete, groupGet } from '@/server/group'
import { serviceEnvironmentList } from '@/server/serviceVersion'
import type { ServiceEnvironmentType } from '@/utils/types/serviceVersions'

const requiredPermissions = [
  'cloudnet_rest:group_read',
  'cloudnet_rest:group_get',
  'global:admin'
]

export const Route = createFileRoute(
  '/{-$locale}/_authed/dashboard/groups/$groupId'
)({
  loader: async ({ params }) => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )
    // the environment list needs its own scopes, so the editor falls back to the
    // values the group already carries rather than failing the whole route
    const environments = hasPermissions
      ? await serviceEnvironmentList()
          .then((payload) => payload.environments)
          .catch(() => [] as ServiceEnvironmentType[])
      : []

    return {
      hasPermissions,
      environments,
      group: hasPermissions
        ? await groupGet({ data: { id: params.groupId } })
        : null
    }
  },
  component: GroupPage
})

function GroupClientPage({
  group,
  groupId,
  environments
}: {
  group: Group
  groupId: string
  environments: ServiceEnvironmentType[]
}) {
  const groupsT = useTranslations('Groups')
  const mainT = useTranslations('Main')

  const navigate = useNavigate()

  const handleUninstall = async () => {
    await groupDelete({ data: { id: groupId } })
    toast.success(groupsT('groupUninstalled'))
    navigate({ to: '/{-$locale}/dashboard/groups' })
  }

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <span className="font-mono text-lg font-semibold">{group.name}</span>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={handleUninstall}
          >
            {mainT('delete')}
          </Button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardCard
          title={groupsT('templates')}
          icon={<LayersIcon className="size-4" />}
          value={group.templates?.length ?? 0}
          permissions={requiredPermissions}
        />
        <DashboardCard
          title={groupsT('deployments')}
          icon={<UploadIcon className="size-4" />}
          value={group.deployments?.length ?? 0}
          permissions={requiredPermissions}
        />
        <DashboardCard
          title={groupsT('includes')}
          icon={<DownloadIcon className="size-4" />}
          value={group.includes?.length ?? 0}
          permissions={requiredPermissions}
        />
        <DashboardCard
          title={groupsT('environments')}
          icon={<WorkflowIcon className="size-4" />}
          value={group.targetEnvironments?.length ?? 0}
          permissions={requiredPermissions}
        />
      </div>

      <Alert className="mt-6">
        <InfoIcon className="size-4" />
        <AlertTitle>{groupsT('headsUp')}</AlertTitle>
        <AlertDescription>{groupsT('editingGroupName')}</AlertDescription>
      </Alert>

      <div className="mt-6 w-full">
        <GroupFormEditor group={group} environments={environments} />
      </div>
    </>
  )
}

function GroupPage() {
  const { groupId } = Route.useParams()
  const { hasPermissions, group, environments } = Route.useLoaderData()
  const navigationT = useTranslations('Navigation')

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!group?.name) {
    return <DoesNotExist name={navigationT('groups')} />
  }

  return (
    <PageLayout title={group?.name}>
      <GroupClientPage
        groupId={groupId}
        group={group}
        environments={environments}
      />
    </PageLayout>
  )
}
