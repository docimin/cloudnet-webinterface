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

  '/register': {
    nl: '/registreren',
    de: '/registrieren',
    en: '/register',
  },

  '/contact': {
    nl: '/contact',
    de: '/kontakt',
    en: '/contact',
  },

  '/vacancies': {
    nl: '/vacatures',
    de: '/stellenangebote',
    en: '/vacancies',
  },

  '/privacy-policy': {
    nl: '/privacyverklaring',
    de: '/datenschutz',
    en: '/privacy-policy',
  },

  '/terms-and-conditions': {
    nl: '/algemene-voorwaarden',
    de: '/allgemeine-geschaeftsbedingungen',
    en: '/terms-and-conditions',
  },

  '/cookie-settings': {
    nl: '/cookie-instellingen',
    de: '/cookie-einstellungen',
    en: '/cookie-settings',
  },
} satisfies Pathnames<typeof locales>

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createLocalizedPathnamesNavigation({ locales, pathnames })
