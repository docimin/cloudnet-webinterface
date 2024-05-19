'use client'

import { Triangle } from 'lucide-react'

import { cn } from '@/lib/utils'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable'
import { Separator } from '@/components/ui/separator'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Nav } from '@/components/header/header-nav'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Nav1, Nav2, NavFooter } from '@/components/header/data'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Tabs } from '@/components/ui/tabs'

export default function SidebarResizable({
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
  defaultViewMode,
  setupSettings,
  permissions,
  children,
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed)
  const router = useRouter()

  const filteredNav1 = Nav1.filter((link) =>
    link.permission.some(
      (permission) => permissions.includes(permission) || permission === 'any'
    )
  )
  const filteredNav2 = Nav2.filter((link) =>
    link.permission.some(
      (permission) => permissions.includes(permission) || permission === 'any'
    )
  )

  return (
    <TooltipProvider delayDuration={0}>
      <ResizablePanelGroup
        direction="horizontal"
        onLayout={(sizes: number[]) => {
          document.cookie = `react-resizable-panels:layout=${JSON.stringify(
            sizes
          )}; path=/`
        }}
        className="h-full max-h-[full] items-stretch flex"
      >
        <ResizablePanel
          defaultSize={defaultLayout[0]}
          collapsedSize={navCollapsedSize}
          collapsible={true}
          minSize={15}
          maxSize={20}
          onCollapse={() => {
            setIsCollapsed(true)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(true)}; path=/`
          }}
          onExpand={() => {
            setIsCollapsed(false)
            document.cookie = `react-resizable-panels:collapsed=${JSON.stringify(false)}; path=/`
          }}
          className={cn(
            'h-screen', // Add this class
            isCollapsed &&
              'min-w-[50px] max-w-[50px] transition-all duration-300 ease-in-out'
          )}
        >
          <div
            className={cn(
              'flex flex-col h-full w-full',
              isCollapsed && 'items-center'
            )}
          >
            <div>
              <div
                className={cn(
                  'flex h-[52px] items-center',
                  isCollapsed ? 'h-[52px] justify-center' : 'px-2 ml-2'
                )}
              >
                {/*  */}
                <Triangle />
                <span className={cn('ml-2', isCollapsed && 'hidden')}>
                  {setupSettings?.shortName || 'Name not set'}
                </span>
              </div>
              <Separator />
            </div>
            <ScrollArea className={'h-full'}>
              <div>
                <Nav isCollapsed={isCollapsed} links={filteredNav1} />
                <Separator />
                <Nav isCollapsed={isCollapsed} links={filteredNav2} />
              </div>
            </ScrollArea>
            <div className={'mt-auto relative bottom-0 block'}>
              <Separator />
              <Nav isCollapsed={isCollapsed} links={NavFooter} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          <Tabs
            defaultValue={defaultViewMode || 'normal'}
            onValueChange={(value) => {
              document.cookie = `viewMode=${value}; path=/`
              router.refresh()
            }}
          >
            {children}
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}
