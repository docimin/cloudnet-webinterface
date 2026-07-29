import { useState } from 'react'
import { type Layout, usePanelRef } from 'react-resizable-panels'
import { Nav1, Nav2, Nav3, NavFooter } from '@/components/header/data'
import { Nav } from '@/components/header/header-nav'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup
} from '@/components/ui/resizable'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export default function SidebarResizable({
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
  permissions,
  children
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed)
  const navPanel = usePanelRef()

  const filteredNav1 = Nav1().filter((link) =>
    link.permission.some(
      (permission) => permissions.includes(permission) || permission === 'any'
    )
  )
  const filteredNav2 = Nav2().filter((link) =>
    link.permission.some(
      (permission) => permissions.includes(permission) || permission === 'any'
    )
  )
  const filteredNav3 = Nav3().filter((link) =>
    link.permission.some(
      (permission) => permissions.includes(permission) || permission === 'any'
    )
  )

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        orientation="horizontal"
        onLayoutChanged={(layout: Layout) => {
          // biome-ignore lint/suspicious/noDocumentCookie: SSR reads this in _authed.tsx, so it has to be a browser-written cookie; setCookie() is server-only and cookieStore is not in Safari yet
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            Object.values(layout)
          )}; path=/`
        }}
        className="h-full max-h-full items-stretch flex fixed"
      >
        <ResizablePanel
          panelRef={navPanel}
          defaultSize={`${defaultLayout[0]}%`}
          collapsedSize={`${navCollapsedSize}%`}
          collapsible={true}
          minSize="15%"
          maxSize="20%"
          onResize={() => {
            const collapsed = navPanel.current?.isCollapsed() ?? false
            if (collapsed === isCollapsed) return
            setIsCollapsed(collapsed)
            // biome-ignore lint/suspicious/noDocumentCookie: same as the layout cookie above - written client-side because SSR reads it
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(collapsed)}; path=/`
          }}
          className={cn(
            'h-screen', // Add this class
            isCollapsed &&
              'min-w-12.5 max-w-12.5 transition-all duration-300 ease-in-out'
          )}
        >
          <div
            className={cn(
              'flex flex-col h-full w-full z-50',
              isCollapsed && 'items-center',
              'sticky top-0' // Make the header sticky
            )}
          >
            <div>
              <div
                className={cn(
                  'flex h-13 items-center',
                  isCollapsed ? 'h-13 justify-center' : 'px-2 ml-2'
                )}
              >
                <img
                  src={import.meta.env.VITE_LOGO_PATH || '/logos/logo.svg'}
                  width={32}
                  height={32}
                  alt={`${import.meta.env.VITE_NAME || 'CloudNet'} logo`}
                  className={'rounded-full'}
                />
                <span className={cn('ml-2', isCollapsed && 'hidden')}>
                  {import.meta.env.VITE_NAME || 'CloudNet'}
                </span>
              </div>
              <Separator />
            </div>
            <ScrollArea className={'h-full overflow-auto'}>
              <div>
                {filteredNav1.length > 0 && (
                  <Nav isCollapsed={isCollapsed} links={filteredNav1} />
                )}
                {filteredNav1.length > 0 && filteredNav2.length > 0 && (
                  <Separator />
                )}
                {filteredNav2.length > 0 && (
                  <Nav isCollapsed={isCollapsed} links={filteredNav2} />
                )}
                {filteredNav2.length > 0 && filteredNav3.length > 0 && (
                  <Separator />
                )}
                {filteredNav3.length > 0 && (
                  <Nav isCollapsed={isCollapsed} links={filteredNav3} />
                )}
              </div>
            </ScrollArea>
            <div className={'mt-auto relative bottom-0 block'}>
              <Separator />
              <Nav isCollapsed={isCollapsed} links={NavFooter()} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={`${defaultLayout[1]}%`} minSize="30%">
          <ScrollArea className={'h-full w-full'}>{children}</ScrollArea>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
