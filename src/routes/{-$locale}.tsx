import { createFileRoute, notFound, Outlet } from '@tanstack/react-router'

const LOCALES = ['en', 'de', 'nl']

export const Route = createFileRoute('/{-$locale}')({
  beforeLoad: ({ params }) => {
    if (params.locale && !LOCALES.includes(params.locale)) throw notFound()
  },
  component: Outlet
})
