import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import { CommandPalette } from '@/components/commandPalette'
import SidebarResizable from '@/components/header/header-resizable'
import MobileNav from '@/components/header/mobile-nav'
import { currentPermissions, jwt } from '@/server/auth'

const panelLayout = createServerFn({ method: 'GET' }).handler(async () => {
  const layout = getCookie('react-resizable-panels:layout')
  const collapsed = getCookie('react-resizable-panels:collapsed')

  return {
    defaultLayout: layout ? JSON.parse(layout) : undefined,
    defaultCollapsed: collapsed ? JSON.parse(collapsed) : undefined
  }
})

export const Route = createFileRoute('/{-$locale}/_authed')({
  beforeLoad: async () => {
    // jwt() verifies and, when only the access token expired, refreshes in
    // place; verifying alone bounced the user to login and lost the page
    const session = await jwt()
    if (session.status === 401) {
      throw redirect({ to: '/{-$locale}' })
    }

    return { permissions: await currentPermissions() }
  },
  loader: () => panelLayout(),
  component: AuthedLayout
})

function AuthedLayout() {
  const { permissions } = Route.useRouteContext()
  const { defaultLayout, defaultCollapsed } = Route.useLoaderData()

  return (
    <div className={'min-h-full'}>
      <CommandPalette />
      <div className="md:hidden">
        <MobileNav permissions={permissions}>
          <Outlet />
        </MobileNav>
      </div>
      <div className="hidden flex-col md:flex">
        <SidebarResizable
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
          permissions={permissions}
        >
          <Outlet />
        </SidebarResizable>
      </div>
    </div>
  )
}
