'use client'
import { Button } from '../ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet'
import { MenuIcon, Triangle } from 'lucide-react'
import * as React from 'react'
import { Separator } from '../ui/separator'
import { Nav1, Nav2, NavFooter } from '@/components/header/data'
import { Nav } from '@/components/header/header-nav'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs } from '@/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { setOrgId } from '@/utils/actions/system/setOrgId'

export default function MobileNav({
  defaultViewMode,
  setupSettings,
  permissions,
  children,
}): React.JSX.Element {
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
    <>
      <header className={'border-b'}>
        <div className={'flex align-middle justify-between items-center px-2'}>
          <div className={'flex h-[52px] items-center ml-2'}>
            <Triangle />
            <span className={'ml-2'}>
              {setupSettings?.shortName || 'Name not set'}
            </span>
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size={'icon'}>
                <MenuIcon />
              </Button>
            </SheetTrigger>
            <SheetContent
              side={'left'}
              className={'min-w-full lg:min-w-[800px] flex flex-col'}
            >
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Interested in checking stuff out? Click on a link!
                </SheetDescription>
              </SheetHeader>

              <Separator className={'mt-2'} />

              <ScrollArea className={'flex-grow'}>
                <div
                  className={
                    'mt-8 w-full h-full justify-items-center text-center'
                  }
                >
                  <h1 className={'border-b pb-2'}>Pages</h1>
                  <div>
                    <Nav isCollapsed={false} links={filteredNav1} />
                    <Separator />
                    <Nav isCollapsed={false} links={filteredNav2} />
                  </div>
                </div>
              </ScrollArea>
              <div className={'mt-auto'}>
                <Separator className={'mb-2'} />
                <Nav isCollapsed={false} links={NavFooter} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main>
        <Tabs
          defaultValue={defaultViewMode || 'normal'}
          onValueChange={(value) => {
            document.cookie = `viewMode=${value}; path=/`
            router.refresh()
          }}
        >
          {children}
        </Tabs>
      </main>
    </>
  )
}
