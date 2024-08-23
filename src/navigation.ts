import { createLocalizedPathnamesNavigation } from 'next-intl/navigation'
import { Pathnames } from 'next-intl/routing'

export const locales = ['nl', 'de', 'en'] as const

// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same pathname, a
  // single external path can be provided.
  '#': '#',
  '.': '.',
  '/': '/',

  '/dashboard': '/dashboard',

  '/dashboard/users': '/dashboard/users',
  '/dashboard/users/[userId]': '/dashboard/users/[userId]',

  '/dashboard/players': '/dashboard/players',
  '/dashboard/players/[playerId]': '/dashboard/players/[playerId]',

  '/dashboard/nodes': '/dashboard/nodes',
  '/dashboard/nodes/[nodeId]': '/dashboard/nodes/[nodeId]',

  '/dashboard/modules': '/dashboard/modules',
  '/dashboard/modules/[moduleId]': '/dashboard/modules/[moduleId]',

  '/dashboard/tasks': '/dashboard/tasks',
  '/dashboard/tasks/[taskId]': '/dashboard/tasks/[taskId]',

  '/dashboard/services': '/dashboard/services',
  '/dashboard/services/[serviceId]': '/dashboard/services/[serviceId]',

  '/dashboard/groups': '/dashboard/groups',
  '/dashboard/groups/[groupId]': '/dashboard/groups/[groupId]',

  '/dashboard/templates': '/dashboard/templates',
  '/dashboard/templates/[storageId]': '/dashboard/templates/[storageId]',
  '/dashboard/templates/[storageId]/[templatePrefix]':
    '/dashboard/templates/[storageId]/[templatePrefix]',
  '/dashboard/templates/[storageId]/[storagePrefix]/[templateId]':
    '/dashboard/templates/[storageId]/[storagePrefix]/[templateId]',

  // If locales use different paths, you can
  // specify each external path per locale.
  '/about': {
    nl: '/over-ons',
    de: '/ueber-uns',
    en: '/about',
  },
} satisfies Pathnames<typeof locales>

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({ locales, pathnames })
