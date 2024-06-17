'use client'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { SiGithub } from '@icons-pack/react-simple-icons'
import Image from 'next/image'
import * as React from 'react'
import Link from 'next/link'

export default function ContextMenuProvider({ children }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <Link href={'https://cloudnetservice.eu/'} passHref target={'_blank'}>
          <ContextMenuItem inset>
            CloudNet
            <ContextMenuShortcut>
              <Image
                src={`/logos/logo.svg`}
                width={16}
                height={16}
                alt={'CloudNet logo'}
                className={'rounded-full'}
              />
            </ContextMenuShortcut>
          </ContextMenuItem>
        </Link>
        <Link
          href={'https://github.com/docimin/cloudnet-webinterface'}
          passHref
          target={'_blank'}
        >
          <ContextMenuItem inset>
            GitHub
            <ContextMenuShortcut>
              <SiGithub size={16} />
            </ContextMenuShortcut>
          </ContextMenuItem>
        </Link>
      </ContextMenuContent>
    </ContextMenu>
  )
}
