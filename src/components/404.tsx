import Link from 'next/link'
import Image from 'next/image'
import { SiDiscord, SiGithub } from '@icons-pack/react-simple-icons'
import { ChevronRightIcon, HomeIcon, ImageIcon } from 'lucide-react'

const links = [
  {
    name: 'Home',
    href: '/',
    description: 'Can we call this Home?',
    icon: HomeIcon,
  },
  {
    name: 'Gallery',
    href: '/gallery',
    description: 'Gallery images posted by the loving Community.',
    icon: ImageIcon,
  },
]
const social = [
  {
    name: 'Discord',
    href: 'https://discord.gg/headpat',
    icon: (props) => <SiDiscord className="h-6 w-6" {...props} />,
  },
  {
    name: 'GitHub',
    href: 'https://github.com/Headpat-Community/headpat.de',
    icon: (props) => <SiGithub className="h-6 w-6" {...props} />,
  },
]

export default function NotFoundComponent() {
  return (
    <div className="flex h-screen flex-col items-center justify-center">
      <main className="mx-auto w-full max-w-7xl px-6 pb-8 pt-10 sm:pb-12 lg:px-8">
        <Image
          className="mx-auto h-36 w-auto sm:h-72"
          priority
          height={256}
          width={256}
          src="/images/404.webp"
          alt="Headpat Community"
        />
        <div className="mx-auto mt-4 max-w-2xl text-center sm:mt-8">
          <p className="text-base font-semibold leading-8 text-indigo-600">
            404
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Wo bist du denn gelandet?
          </h1>
          <p className="mt-4 text-base leading-7 text-white/70 sm:mt-6 sm:text-lg sm:leading-8">
            Sorry, die Seite wurde nicht gefunden!
          </p>
        </div>
        <div className="mx-auto mt-16 flow-root max-w-lg sm:mt-20">
          <h2 className="sr-only">Popular pages</h2>
          <ul
            role="list"
            className="-mt-6 divide-y divide-gray-900/5 border-b border-gray-900/5"
          >
            {links.map((link, linkIdx) => (
              <li key={linkIdx} className="relative flex gap-x-6 py-6">
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg shadow-sm ring-1 ring-white/50">
                  <link.icon
                    className="h-6 w-6 text-indigo-600"
                    aria-hidden="true"
                  />
                </div>
                <div className="flex-auto">
                  <h3 className="text-sm font-semibold leading-6 text-indigo-600">
                    <Link href={link.href}>
                      <span className="absolute inset-0" aria-hidden="true" />
                      {link.name}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-white">
                    {link.description}
                  </p>
                </div>
                <div className="flex-none self-center">
                  <ChevronRightIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-10 flex justify-center">
            <Link
              href="#"
              className="text-sm font-semibold leading-6 text-indigo-600"
            >
              <span aria-hidden="true">&larr;</span>
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <footer className="border-t border-gray-100 py-6 sm:py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-6 sm:flex-row lg:px-8">
          <p className="text-sm leading-7 text-white">
            &copy; Headpat Community.
          </p>
          <div className="hidden sm:block sm:h-7 sm:w-px sm:flex-none sm:bg-gray-200" />
          <div className="flex gap-x-4">
            {social.map((item, itemIdx) => (
              <Link
                key={itemIdx}
                href={item.href}
                className="text-white hover:text-gray-500"
              >
                <span className="sr-only">{item.name}</span>
                <item.icon className="h-6 w-6" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
