import {
  createLocalizedPathnamesNavigation,
  Pathnames,
} from 'next-intl/navigation'

export const locales = ['nl', 'de', 'en'] as const

// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same pathname, a
  // single external path can be provided.
  '/': '/',
  '/blog': '/blog',

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
