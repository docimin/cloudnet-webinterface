import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import {
  DownloadIcon,
  InfoIcon,
  LayersIcon,
  UploadIcon,
  WorkflowIcon
} from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { toast } from 'sonner'
import { DashboardCard } from '@/components/dashboardCard'
import PageLayout from '@/components/pageLayout'
import DoesNotExist from '@/components/static/doesNotExist'
import NoAccess from '@/components/static/noAccess'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { currentPermissions } from '@/server/auth'
import { groupDelete, groupGet, groupUpdate } from '@/server/group'

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
    return {
      hasPermissions,
      group: hasPermissions
        ? await groupGet({ data: { id: params.groupId } })
        : null
    }
  },
  component: GroupPage
})

function GroupClientPage({
  group,
  groupId
}: {
  group: Group
  groupId: string
}) {
  const groupsT = useTranslations('Groups')
  const mainT = useTranslations('Main')

  const navigate = useNavigate()
  const [groupConfigData, setGroupConfigData] = useState(
    JSON.stringify(group, null, 2)
  )
  const handleModuleConfigSave = async (event: FormEvent) => {
    event.preventDefault()

    try {
      const updatedGroup = JSON.parse(groupConfigData)
      if (updatedGroup.name !== group.name) {
        toast.warning(groupsT('groupNameChanged'))
        return
      }

      const response = await groupUpdate({ data: updatedGroup })

      if (response) {
        toast.success(groupsT('groupConfigUpdated'))
      }
    } catch {
      toast.error(mainT('invalidJson'))
    }
  }

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
          {groupConfigData && (
            <Button type="button" size="sm" onClick={handleModuleConfigSave}>
              {mainT('save')}
            </Button>
          )}
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

      {groupConfigData && (
        <div className="mt-6 w-full">
          <Label htmlFor="json">{groupsT('configuration')}</Label>
          <div className="mt-2">
            <Textarea
              name="json"
              id="json"
              className="h-96 font-mono text-xs"
              required
              value={groupConfigData}
              onChange={(event) => setGroupConfigData(event.target.value)}
            />
          </div>
        </div>
      )}
    </>
  )
}

function GroupPage() {
  const { groupId } = Route.useParams()
  const { hasPermissions, group } = Route.useLoaderData()
  const navigationT = useTranslations('Navigation')

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!group?.name) {
    return <DoesNotExist name={navigationT('groups')} />
  }

  return (
    <PageLayout title={group?.name}>
      <GroupClientPage groupId={groupId} group={group} />
    </PageLayout>
  )
}
