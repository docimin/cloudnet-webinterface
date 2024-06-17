import PageLayout from '@/components/pageLayout'
import { getPermissions } from '@/utils/server-api/user/getPermissions'
import { Module } from '@/utils/types/modules'
import { getModule } from '@/utils/server-api/modules/getModule'
import ModuleClientPage from '@/app/[lang]/(dashboard)/dashboard/modules/[moduleId]/page.client'
import NoAccess from '@/components/static/noAccess'
import { getModuleConfig } from '@/utils/server-api/modules/getModuleConfig'
import DoesNotExist from '@/components/static/doesNotExist'

export const runtime = 'edge'

export default async function NodePage({ params: { lang, moduleId } }) {
  const moduleSingle: Module = await getModule(moduleId)
  let moduleConfig = {}
  const permissions: any = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_get',
    'global:admin',
  ]
  const requiredConfigPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_config_get',
    'global:admin',
  ]

  // Check if user has required permissions to view module config
  const hasConfigPermissions = requiredConfigPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (hasConfigPermissions) {
    moduleConfig = await getModuleConfig(moduleId)
  }

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!moduleSingle?.configuration?.name) {
    return <DoesNotExist name={'Module'} />
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
