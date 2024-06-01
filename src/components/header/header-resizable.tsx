'use client'

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
import { Nav1, Nav2, Nav3, NavFooter } from '@/components/header/data'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { checkToken } from '@/utils/actions/user/jwt'
import Image from 'next/image'

export default function SidebarResizable({
  defaultLayout = [265, 440, 655],
  defaultCollapsed = false,
  navCollapsedSize,
  permissions,
  lang,
  children,
}) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(defaultCollapsed)
  const router = useRouter()

  const filteredNav1 = Nav1(lang, '').filter((link) =>
    link.permission.some(
      (permission) => permissions.includes(permission) || permission === 'any'
    )
  )
  const filteredNav2 = Nav2(lang, '').filter((link) =>
    link.permission.some(
      (permission) => permissions.includes(permission) || permission === 'any'
    )
  )
  const filteredNav3 = Nav3(lang, '').filter((link) =>
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
                <Image
                  src={'/logos/logo.svg'}
                  width={32}
                  height={32}
                  alt={'CloudNet logo'}
                  className={'rounded-full'}
                />
                <span className={cn('ml-2', isCollapsed && 'hidden')}>
                  CloudNet
                </span>
              </div>
              <Separator />
            </div>
            <ScrollArea className={'h-full'}>
              <div>
                <Nav isCollapsed={isCollapsed} links={filteredNav1} />
                <Separator />
                <Nav isCollapsed={isCollapsed} links={filteredNav2} />
                <Separator />
                <Nav isCollapsed={isCollapsed} links={filteredNav3} />
              </div>
            </ScrollArea>
            <div className={'mt-auto relative bottom-0 block'}>
              <Separator />
              <Nav isCollapsed={isCollapsed} links={NavFooter(lang, '')} />
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={defaultLayout[1]} minSize={30}>
          {children}
        </ResizablePanel>
      </ResizablePanelGroup>
    </TooltipProvider>
  )
}