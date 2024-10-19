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
  WorkflowIcon,
} from 'lucide-react'

export const Nav1 = (translations) => [
  {
    title: translations.dashboard,
    label: '',
    icon: LayoutDashboardIcon,
    variant: 'default' as const,
    href: `/dashboard`,
    permission: ['any'],
  },
  {
    title: 'Nodes',
    label: '',
    icon: WorkflowIcon,
    variant: 'ghost' as const,
    href: `/dashboard/nodes`,
    permission: [
      'global:admin',
      'cloudnet_rest:node_read',
      'cloudnet_rest:node_info',
    ],
  },
  {
    title: 'Modules',
    label: '',
    icon: PackageIcon,
    variant: 'ghost' as const,
    href: `/dashboard/modules`,
    permission: [
      'global:admin',
      'cloudnet_rest:module_read',
      'cloudnet_rest:module_list_loaded',
    ],
  },
]

export const Nav2 = (translations) => [
  {
    title: 'Players',
    label: '',
    icon: BlendIcon,
    variant: 'ghost' as const,
    href: `/dashboard/players`,
    permission: ['global:admin', 'owner', 'social-read'],
  },
  {
    title: 'Tasks',
    label: '',
    icon: UngroupIcon,
    variant: 'ghost' as const,
    href: `/dashboard/tasks`,
    permission: ['global:admin', 'owner', 'social-read'],
  },
  {
    title: 'Groups',
    label: '',
    icon: GroupIcon,
    variant: 'ghost' as const,
    href: `/dashboard/groups`,
    permission: ['global:admin', 'owner', 'social-read'],
  },
  {
    title: 'Services',
    label: '',
    icon: DatabaseZapIcon,
    variant: 'ghost' as const,
    href: `/dashboard/services`,
    permission: [
      'global:admin',
      'cloudnet_rest:service_read',
      'cloudnet_rest:service_list',
    ],
  },
  {
    title: 'Templates',
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
]

export const Nav3 = (translations) => [
  {
    title: 'Users',
    label: '',
    icon: UsersIcon,
    variant: 'default' as const,
    href: `/dashboard/users`,
    permission: [
      'global:admin',
      'cloudnet_rest:user_read',
      'cloudnet_rest:user_get',
    ],
  },
]

export const NavFooter = (translations) => {
  return [
    {
      title: 'Account',
      label: '',
      icon: CircleUserIcon,
      variant: 'ghost' as const,
      href: `/account/settings`,
    },
    {
      title: 'Logout',
      label: '',
      icon: LogOutIcon,
      variant: 'ghost' as const,
      href: `/logout`,
    },
  ]
}
