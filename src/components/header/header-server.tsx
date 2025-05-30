import { cookies } from 'next/headers'
import SidebarResizable from '@/components/header/header-resizable'
import MobileNav from '@/components/header/mobile-nav'
import { getPermissions } from '@/utils/server-api/getPermissions'

export default async function HeaderServer({ children, ...translations }) {
  const layout = (await cookies()).get('react-resizable-panels:layout')
  const collapsed = (await cookies()).get('react-resizable-panels:collapsed')

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined
  const navCollapsedSize = 4
  const permissions = await getPermissions()

  return (
    <>
      <div className={'min-h-full'}>
        <div className="md:hidden">
          <MobileNav permissions={permissions}>{children}</MobileNav>
        </div>
        <div className="hidden flex-col md:flex">
          <SidebarResizable
            defaultLayout={defaultLayout}
            defaultCollapsed={defaultCollapsed}
            navCollapsedSize={navCollapsedSize}
            permissions={permissions}
          >
            {children}
          </SidebarResizable>
        </div>
      </div>
    </>
  )
}
