'use client'
import { Button } from '../ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '../ui/sheet'
import { MenuIcon } from 'lucide-react'
import * as React from 'react'
import { Separator } from '../ui/separator'
import { Nav1, Nav2, Nav3, NavFooter } from '@/components/header/data'
import { Nav } from '@/components/header/header-nav'
import { ScrollArea } from '@/components/ui/scroll-area'
import Image from 'next/image'
import { useTranslations } from 'gt-next/client'

export default function MobileNav({
  permissions,
  children
}): React.JSX.Element {
  const [isOpen, setIsOpen] = React.useState(false)
  const mainT = useTranslations('Main')

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
    <>
      <header className={'border-b'}>
        <div className={'flex align-middle justify-between items-center px-2'}>
          <div className={'flex h-[52px] items-center ml-2'}>
            <Image
              src={process.env.NEXT_PUBLIC_LOGO_PATH || '/logos/logo.svg'}
              width={32}
              height={32}
              alt={`${process.env.NEXT_PUBLIC_NAME || 'CloudNet'} logo`}
              className={'rounded-full'}
            />
            <span className={'ml-2'}>
              {process.env.NEXT_PUBLIC_NAME || 'CloudNet'}
            </span>
          </div>
          <Sheet onOpenChange={(open) => setIsOpen(open)} open={isOpen}>
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
                <SheetTitle>{mainT('menu')}</SheetTitle>
                <SheetDescription>{mainT('menuDescription')}</SheetDescription>
              </SheetHeader>

              <Separator className={'mt-2'} />

              <ScrollArea className={'flex-grow'}>
                <div
                  className={
                    'mt-8 w-full h-full justify-items-center text-center'
                  }
                >
                  <div>
                    {filteredNav1.length > 0 && (
                      <Nav
                        isCollapsed={false}
                        links={filteredNav1}
                        setIsOpen={setIsOpen}
                      />
                    )}
                    {filteredNav1.length > 0 && filteredNav2.length > 0 && (
                      <Separator />
                    )}
                    {filteredNav2.length > 0 && (
                      <Nav
                        isCollapsed={false}
                        links={filteredNav2}
                        setIsOpen={setIsOpen}
                      />
                    )}
                    {filteredNav2.length > 0 && filteredNav3.length > 0 && (
                      <Separator />
                    )}
                    {filteredNav3.length > 0 && (
                      <Nav
                        isCollapsed={false}
                        links={filteredNav3}
                        setIsOpen={setIsOpen}
                      />
                    )}
                  </div>
                </div>
              </ScrollArea>
              <div className={'mt-auto'}>
                <Separator className={'mb-2'} />
                <Nav
                  isCollapsed={false}
                  links={NavFooter()}
                  setIsOpen={setIsOpen}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main>{children}</main>
    </>
  )
}
