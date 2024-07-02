'use client'
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
import { SiGithub } from '@icons-pack/react-simple-icons'
import Image from 'next/image'
import * as React from 'react'

export default function ContextMenuProvider({ children }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <a href={'https://cloudnetservice.eu/'} target={'_blank'}>
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
        </a>
        <a
          href={'https://github.com/docimin/cloudnet-webinterface'}
          target={'_blank'}
        >
          <ContextMenuItem inset>
            GitHub
            <ContextMenuShortcut>
              <SiGithub size={16} />
            </ContextMenuShortcut>
          </ContextMenuItem>
        </a>
      </ContextMenuContent>
    </ContextMenu>
  )
}
