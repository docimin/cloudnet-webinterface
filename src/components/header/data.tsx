import {
  AlertCircle,
  CircleUserIcon,
  CogIcon,
  File,
  Inbox,
  MessagesSquare,
  ShoppingCart,
  Users2,
  UsersIcon,
} from 'lucide-react'

export const Nav1 = [
  {
    title: 'Dashboard',
    label: '',
    icon: Inbox,
    variant: 'default' as const,
    href: '/dashboard',
    permission: ['any'],
  },
  {
    title: 'Employees',
    label: '',
    icon: UsersIcon,
    variant: 'ghost' as const,
    href: '/employees',
    permission: ['owner', 'hr-read'],
  },
  {
    title: 'MRP',
    label: '',
    icon: File,
    variant: 'ghost' as const,
    href: '/mrp',
    permission: ['owner', 'mrp-read'],
  },
]

export const Nav2 = [
  {
    title: 'Social',
    label: '',
    icon: Users2,
    variant: 'ghost' as const,
    href: '/social',
    permission: ['owner', 'social-read'],
  },
  {
    title: 'Updates',
    label: '',
    icon: AlertCircle,
    variant: 'ghost' as const,
    href: '/updates',
    permission: ['owner', 'system-updates-read'],
  },
  {
    title: 'Forums',
    label: '',
    icon: MessagesSquare,
    variant: 'ghost' as const,
    href: '/forums',
    permission: ['owner', 'forums-read'],
  },
  {
    title: 'Shopping',
    label: '',
    icon: ShoppingCart,
    variant: 'ghost' as const,
    href: '/shopping',
    permission: ['owner', 'shopping-read'],
  },
  {
    title: 'Settings',
    label: '',
    icon: CogIcon,
    variant: 'default' as const,
    href: '/settings',
    permission: ['owner'],
  },
]

export const NavFooter = [
  {
    title: 'Account',
    label: '',
    icon: CircleUserIcon,
    variant: 'default' as const,
    href: '/account',
    permission: ['any'],
  },
]
