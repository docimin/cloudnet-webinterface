import {
  BlendIcon,
  BookDashedIcon,
  CircleUserIcon,
  DatabaseZapIcon,
  GroupIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  PackageIcon,
  UngroupIcon,
  UsersIcon,
  WorkflowIcon
} from 'lucide-react'
import { useTranslations } from 'gt-next/client'

export const Nav1 = () => {
  const navigationT = useTranslations('Navigation')
  return [
    {
      title: navigationT('dashboard'),
      label: '',
      icon: LayoutDashboardIcon,
      variant: 'default' as const,
      href: `/dashboard`,
      permission: ['any']
    },
    {
      title: navigationT('nodes'),
      label: '',
      icon: WorkflowIcon,
      variant: 'ghost' as const,
      href: `/dashboard/nodes`,
      permission: [
        'global:admin',
        'cloudnet_rest:node_read',
        'cloudnet_rest:node_info'
      ]
    },
    {
      title: navigationT('modules'),
      label: '',
      icon: PackageIcon,
      variant: 'ghost' as const,
      href: `/dashboard/modules`,
      permission: [
        'global:admin',
        'cloudnet_rest:module_read',
        'cloudnet_rest:module_list_loaded'
      ]
    }
  ]
}

export const Nav2 = () => {
  const navigationT = useTranslations('Navigation')
  return [
    {
      title: navigationT('players'),
      label: '',
      icon: BlendIcon,
      variant: 'ghost' as const,
      href: `/dashboard/players`,
      permission: ['global:admin', 'owner', 'social-read']
    },
    {
      title: navigationT('tasks'),
      label: '',
      icon: UngroupIcon,
      variant: 'ghost' as const,
      href: `/dashboard/tasks`,
      permission: ['global:admin', 'owner', 'social-read']
    },
    {
      title: navigationT('groups'),
      label: '',
      icon: GroupIcon,
      variant: 'ghost' as const,
      href: `/dashboard/groups`,
      permission: ['global:admin', 'owner', 'social-read']
    },
    {
      title: navigationT('services'),
      label: '',
      icon: DatabaseZapIcon,
      variant: 'ghost' as const,
      href: `/dashboard/services`,
      permission: [
        'global:admin',
        'cloudnet_rest:service_read',
        'cloudnet_rest:service_list'
      ]
    }
    /*
    {
      title: navigationT('templates'),
      label: '',
      icon: BookDashedIcon,
      variant: 'ghost' as const,
      href: `/dashboard/templates`,
      permission: [
        'global:admin',
        'cloudnet_rest:template_storage_read',
        'cloudnet_rest:template_storage_list',
      ],
    },
     */
  ]
}

export const Nav3 = () => {
  const navigationT = useTranslations('Navigation')
  return [
    {
      title: navigationT('users'),
      label: '',
      icon: UsersIcon,
      variant: 'default' as const,
      href: `/dashboard/users`,
      permission: [
        'global:admin',
        'cloudnet_rest:user_read',
        'cloudnet_rest:user_get'
      ]
    }
  ]
}

export const NavFooter = () => {
  const navigationT = useTranslations('Navigation')
  return [
    {
      title: navigationT('logout'),
      label: '',
      icon: LogOutIcon,
      variant: 'ghost' as const,
      href: `/logout`
    }
  ]
}
