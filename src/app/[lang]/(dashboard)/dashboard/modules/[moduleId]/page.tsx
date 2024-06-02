import PageLayout from '@/components/pageLayout'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import { Module } from '@/utils/types/modules'
import { getModule } from '@/utils/server-api/modules/getModule'
import ModuleClientPage from '@/app/[lang]/(dashboard)/dashboard/modules/[moduleId]/page.client'
import NoAccess from '@/components/static/noAccess'
import { getModuleConfig } from '@/utils/server-api/modules/getModuleConfig'

export const runtime = 'edge'

export default async function NodePage({ params: { lang, moduleId } }) {
  const moduleSingle: Module = await getModule(moduleId)
  const moduleConfig = await getModuleConfig(moduleId)
  const permissions: any = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_get',
    'global:admin',
  ]

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!moduleSingle?.configuration?.name) {
    return (
      <div className="h-svh">
        <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
          <h1 className="text-[7rem] font-bold leading-tight">401</h1>
          <span className="font-medium">Module not found!</span>
          <p className="text-center text-muted-foreground">
            It looks like you&apos;re trying to access a module that
            doesn&apos;t exist.
          </p>
          <div className="mt-6 flex gap-4">
            <Link href={'.'}>
              <Button variant="outline">Go back</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <PageLayout title={moduleSingle.configuration.name}>
      <ModuleClientPage
        module={moduleSingle}
        moduleId={moduleId}
        moduleConfig={moduleConfig}
      />
    </PageLayout>
  )
}
