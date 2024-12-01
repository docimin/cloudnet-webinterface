import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'de', 'nl'],
  localePrefix: 'always',
  localeCookie: {
    name: 'USER_LOCALE',
  },

  // Used when no locale matches
  defaultLocale: 'en',

  pathnames: {
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
      en: '/about',
      de: '/ueber-uns',
      nl: '/over-ons',
    },
  },
})

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
