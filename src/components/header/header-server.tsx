import { cookies } from 'next/headers'
import SidebarResizable from '@/components/header/header-resizable'
import MobileNav from '@/components/header/mobile-nav'
import { getSetupSettings } from '@/lib/setup/setup'
import { getTeamMemberships } from '@/utils/server-api/account/user'
import OrgChecks from '@/components/header/checks'
import { getPermissionsServer } from '@/lib/server-calls'

export default async function HeaderServer({ children }) {
  const layout = cookies().get('react-resizable-panels:layout')
  const collapsed = cookies().get('react-resizable-panels:collapsed')
  const viewMode = cookies().get('viewMode')
  const orgId = cookies().get('orgId')

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined
  const defaultViewMode = viewMode ? viewMode.value : undefined
  const defaultOrgId = orgId ? orgId.value : undefined
  const navCollapsedSize = 4

  if (!defaultOrgId) {
    return <OrgChecks />
  }

  const setupSettings = (await getSetupSettings(defaultOrgId)) || []

  const teamRolesResponse = await getTeamMemberships(defaultOrgId)
  const teamRoles =
    teamRolesResponse && teamRolesResponse.memberships
      ? teamRolesResponse.memberships[0]?.roles
      : []

  const permissionsResponse = await getPermissionsServer(
    defaultOrgId,
    teamRoles[0]
  )
  const permissions = permissionsResponse?.documents[0]?.permissions

  if (!teamRoles) {
    return null
  }

  return (
    <>
      <div className={'min-h-full'}>
        <div className="md:hidden">
          <MobileNav
            defaultViewMode={defaultViewMode}
            setupSettings={setupSettings}
            permissions={permissions}
          >
            {children}
          </MobileNav>
        </div>
        <div className="hidden flex-col md:flex">
          <SidebarResizable
            defaultLayout={defaultLayout}
            defaultCollapsed={defaultCollapsed}
            navCollapsedSize={navCollapsedSize}
            defaultViewMode={defaultViewMode}
            setupSettings={setupSettings}
            permissions={permissions}
          >
            {children}
          </SidebarResizable>
        </div>
      </div>
    </>
  )
}
