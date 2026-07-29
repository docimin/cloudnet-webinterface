import * as Sentry from '@sentry/tanstackstart-react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { DownloadCloudIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'
import PageHeader from '@/components/pageHeader'
import PageLayout from '@/components/pageLayout'
import NoAccess from '@/components/static/noAccess'
import { StatusIndicator } from '@/components/status'
import TableEmpty from '@/components/tableEmpty'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { serviceVersionStatus } from '@/lib/cloudnetStatus'
import { cn } from '@/lib/utils'
import { currentPermissions } from '@/server/auth'
import {
  serviceEnvironmentList,
  serviceVersionGet,
  serviceVersionList,
  serviceVersionLoad
} from '@/server/serviceVersion'
import type {
  ServiceEnvironmentType,
  ServiceVersionType
} from '@/utils/types/serviceVersions'

const ALL_ENVIRONMENTS = 'all'

const searchSchema = z.object({
  tab: z
    .enum(['versions', 'environments'])
    .default('versions')
    .catch('versions'),
  environment: z
    .string()
    .default(ALL_ENVIRONMENTS)
    .transform((value) => value || ALL_ENVIRONMENTS),
  type: z.string().optional()
})

const requiredPermissions = [
  'cloudnet_rest:service_version_read',
  'cloudnet_rest:service_version_list',
  'global:admin'
]

export const Route = createFileRoute('/{-$locale}/_authed/dashboard/versions/')(
  {
    validateSearch: searchSchema,
    loaderDeps: ({ search }) => ({ type: search.type }),
    loader: async ({ deps }) => {
      const permissions = await currentPermissions()
      const hasPermissions = requiredPermissions.some((permission) =>
        permissions.includes(permission)
      )

      if (!hasPermissions) {
        return {
          permissions,
          hasPermissions,
          types: [] as ServiceVersionType[],
          environments: [] as ServiceEnvironmentType[],
          selected: null as ServiceVersionType | null
        }
      }

      const [types, environments] = await Promise.all([
        serviceVersionList().catch(() => ({ serviceVersionTypes: [] })),
        serviceEnvironmentList().catch(() => ({ environments: [] }))
      ])

      const selected = deps.type
        ? await serviceVersionGet({ data: { version: deps.type } }).catch(
            () => null
          )
        : null

      return {
        permissions,
        hasPermissions,
        types: types.serviceVersionTypes ?? [],
        environments: environments.environments ?? [],
        selected
      }
    },
    component: VersionsPage
  }
)

function VersionsPage() {
  const { permissions, hasPermissions, types, environments, selected } =
    Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const versionsT = useTranslations('Versions')
  const [loadOpen, setLoadOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)

  if (!hasPermissions) {
    return <NoAccess />
  }

  const mayLoad =
    permissions.includes('global:admin') ||
    permissions.includes('cloudnet_rest:service_version_write') ||
    permissions.includes('cloudnet_rest:service_version_load')

  const environmentIds = [...environments]
    .map((environment) => environment.name)
    .sort((a, b) => a.localeCompare(b))

  const sortedTypes = [...types].sort((a, b) => a.name.localeCompare(b.name))
  const visibleTypes =
    search.environment === ALL_ENVIRONMENTS
      ? sortedTypes
      : sortedTypes.filter(
          (type) => type.environmentType === search.environment
        )

  // the detail request only refires when the id changes, so fall back to the list
  const detail =
    selected ?? sortedTypes.find((type) => type.name === search.type) ?? null
  const installSteps = stringList(detail?.installSteps)

  const load = async () => {
    setLoading(true)
    try {
      await serviceVersionLoad({ data: { url: url.trim() || undefined } })
      toast.success(versionsT('loaded'))
      setLoadOpen(false)
      setUrl('')
      router.invalidate()
    } catch (error) {
      Sentry.captureException(error)
      toast.error(versionsT('loadFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageLayout title={versionsT('title')}>
      <div className="flex flex-col gap-4">
        <PageHeader count={types.length} caption={versionsT('tableCaption')}>
          {mayLoad && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setLoadOpen(true)}
            >
              <DownloadCloudIcon className="mr-2 size-4" />
              {versionsT('loadVersions')}
            </Button>
          )}
        </PageHeader>

        <Tabs
          value={search.tab}
          onValueChange={(tab) =>
            navigate({
              search: (previous) => ({
                ...previous,
                tab: tab as 'versions' | 'environments'
              })
            })
          }
        >
          <TabsList>
            <TabsTrigger value="versions">{versionsT('versions')}</TabsTrigger>
            <TabsTrigger value="environments">
              {versionsT('environments')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="versions">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-panel">
              <div className="flex min-w-0 flex-col gap-2">
                <Select
                  value={search.environment}
                  onValueChange={(environment) =>
                    navigate({
                      search: (previous) => ({ ...previous, environment })
                    })
                  }
                >
                  <SelectTrigger aria-label={versionsT('environment')}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_ENVIRONMENTS}>
                      {versionsT('allEnvironments')}
                    </SelectItem>
                    {environmentIds.map((id) => (
                      <SelectItem key={id} value={id} className="font-mono">
                        {id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead>{versionsT('name')}</TableHead>
                        <TableHead className="text-right">
                          {versionsT('versionCount')}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visibleTypes.length === 0 && (
                        <TableEmpty
                          colSpan={2}
                          title={versionsT('noTypes')}
                          description={versionsT('noTypesDescription')}
                        />
                      )}
                      {visibleTypes.map((type) => (
                        <TableRow
                          key={type.name}
                          onClick={() =>
                            navigate({
                              search: (previous) => ({
                                ...previous,
                                type: type.name
                              })
                            })
                          }
                          className={cn(
                            'cursor-pointer hover:bg-muted/50',
                            type.name === search.type && 'bg-muted'
                          )}
                        >
                          <TableCell className="font-mono font-medium">
                            {type.name}
                            <span className="block text-xs text-muted-foreground">
                              {type.environmentType}
                            </span>
                          </TableCell>
                          <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                            {type.versions?.length ?? 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="min-w-0 overflow-hidden rounded-lg border">
                {detail ? (
                  <>
                    <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-b px-4 py-3">
                      <span className="font-mono text-sm font-medium">
                        {detail.name}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {detail.environmentType}
                      </span>
                      {installSteps.length > 0 && (
                        <span className="font-mono text-xs text-muted-foreground">
                          {versionsT('installSteps')}:{' '}
                          {installSteps.join(' / ')}
                        </span>
                      )}
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-32">
                            {versionsT('state')}
                          </TableHead>
                          <TableHead>{versionsT('version')}</TableHead>
                          <TableHead className="text-right">
                            {versionsT('java')}
                          </TableHead>
                          <TableHead className="text-right">
                            {versionsT('cached')}
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(detail.versions ?? []).length === 0 && (
                          <TableEmpty
                            colSpan={4}
                            title={versionsT('noVersions')}
                            description={versionsT('noVersionsDescription')}
                          />
                        )}
                        {(detail.versions ?? []).map((version) => (
                          <TableRow
                            key={version.name}
                            className="hover:bg-transparent"
                          >
                            <TableCell>
                              <StatusIndicator
                                status={serviceVersionStatus(
                                  version.deprecated
                                )}
                                label={
                                  version.deprecated
                                    ? versionsT('deprecated')
                                    : versionsT('available')
                                }
                                showLabel
                              />
                            </TableCell>
                            <TableCell className="font-mono font-medium">
                              {version.name}
                            </TableCell>
                            <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
                              {javaRange(
                                version.minJavaVersion,
                                version.maxJavaVersion
                              )}
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {version.cacheFiles
                                ? versionsT('yes')
                                : versionsT('no')}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                ) : (
                  <div className="px-4 py-10 text-center">
                    <div className="text-sm font-medium">
                      {versionsT('noTypeSelected')}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {versionsT('noTypeSelectedDescription')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="environments">
            <div className="overflow-hidden rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{versionsT('name')}</TableHead>
                    <TableHead className="text-right">
                      {versionsT('startPort')}
                    </TableHead>
                    <TableHead>{versionsT('processArguments')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {environments.length === 0 && (
                    <TableEmpty
                      colSpan={3}
                      title={versionsT('noEnvironments')}
                      description={versionsT('noEnvironmentsDescription')}
                    />
                  )}
                  {[...environments]
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((environment) => (
                      <TableRow
                        key={environment.name}
                        className="hover:bg-transparent"
                      >
                        <TableCell className="font-mono font-medium">
                          {environment.name}
                        </TableCell>
                        <TableCell className="text-right font-mono tabular-nums">
                          {environment.defaultServiceStartPort}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {stringList(environment.defaultProcessArguments).join(
                            ' '
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={loadOpen} onOpenChange={setLoadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{versionsT('loadVersions')}</DialogTitle>
            <DialogDescription>{versionsT('loadHint')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="version-load-url">{versionsT('loadUrl')}</Label>
            <Input
              id="version-load-url"
              className="font-mono"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLoadOpen(false)}
            >
              {versionsT('cancel')}
            </Button>
            <Button type="button" disabled={loading} onClick={load}>
              {versionsT('load')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}

// withNames() only normalises `name`, so a node answering these as a bare string
// where the spec documents a list would blow up on .join
function stringList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  return typeof value === 'string' && value ? [value] : []
}

function javaRange(min?: number, max?: number) {
  if (min && max) return `${min}-${max}`
  if (min) return `${min}+`
  if (max) return `<=${max}`
  return '-'
}
