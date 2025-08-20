import PageLayout from '@/components/pageLayout'
import { getPermissions } from '@/utils/server-api/getPermissions'
import { Module } from '@/utils/types/modules'
import NoAccess from '@/components/static/noAccess'
import DoesNotExist from '@/components/static/doesNotExist'
import ModuleClientPage from './page.client'
import { serverModuleApi } from '@/lib/server-api'
import { getTranslations } from 'gt-next/server'

export default async function NodePage(props) {
  const params = await props.params
  const { moduleId } = params

  const navigationT = await getTranslations('Navigation')

  const moduleSingle: Module = await serverModuleApi.get(moduleId)
  const permissions: any = await getPermissions()
  const requiredPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_get',
    'global:admin'
  ]
  const requiredConfigPermissions = [
    'cloudnet_rest:module_read',
    'cloudnet_rest:module_config_get',
    'global:admin'
  ]

  // Check if user has required permissions to view module config
  const hasConfigPermissions = requiredConfigPermissions.some((permission) =>
    permissions.includes(permission)
  )

  let moduleConfig = {}
  if (hasConfigPermissions) {
    moduleConfig = await serverModuleApi.getConfig(moduleId)
  }

  // check if user has required permissions
  const hasPermissions = requiredPermissions.some((permission) =>
    permissions.includes(permission)
  )

  if (!hasPermissions) {
    return <NoAccess />
  }

  if (!moduleSingle?.configuration?.name) {
    return <DoesNotExist name={navigationT('modules')} />
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
