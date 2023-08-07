'use client';
import './globals.css';
import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  Bars3Icon,
  CalendarIcon,
  DocumentDuplicateIcon,
  FolderIcon,
  HomeIcon,
  XMarkIcon,
  UserCircleIcon,
  ServerStackIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faMugHot } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon, current: false },
  { name: 'Nodes', href: '/nodes', icon: ServerStackIcon, current: false },
  { name: 'Tasks', href: '/tasks', icon: CalendarIcon, current: false },
  {
    name: 'Services',
    href: '/services',
    icon: DocumentDuplicateIcon,
    current: false
  },
  {
    name: 'Groups',
    href: '/groups',
    icon: FolderIcon,
    current: false
  },
  {
    name: 'Templates',
    href: '/templates',
    icon: ServerIcon,
    current: false
  }
];
const teams = [
  {
    id: 1,
    name: 'GitHub',
    href: 'https://github.com/docimin/cloudnet-webinterface',
    icon: faGithub,
    initial: 'GH',
    current: false
  },
  {
    id: 2,
    name: 'Ko-Fi',
    href: 'https://ko-fi.com/fayevr',
    initial: 'K-F',
    icon: faMugHot,
    current: false
  },
  {
    id: 3,
    name: 'Sponsor me',
    href: 'https://github.com/sponsors/docimin',
    icon: faHeart,
    initial: 'S',
    current: false
  }
];

const getCookie = (name) => {
  if (typeof document === 'undefined') {
    return null;
  }
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
};

function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export default function RootLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setUsername(getCookie('username'));
  }, []);
  const notLoggedIn = 'Not logged in!';

  const handleLogout = () => {
    const token = getCookie('token');
    const address = getCookie('address');
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    const domainurl = address.includes('localhost' || '127.0.0.1')
      ? ''
      : `${process.env.NEXT_PUBLIC_CORS_PROXY_URL}/`;

    const apiURL = `${domainurl}${address}/session/logout`;

    fetch(apiURL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        return response.json();
      })
      .then((data) => {
        // Handle the response data if needed
        deleteCookie('token');
        deleteCookie('address');
        deleteCookie('username');
        window.location.href = '/auth';
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  return (
    <html className="h-full" lang="en" suppressHydrationWarning>
      <body className="h-full bg-gray-800">
        <>
          <div>
            <Transition.Root show={sidebarOpen} as={Fragment}>
              <Dialog
                as="div"
                className="relative z-50 lg:hidden"
                onClose={setSidebarOpen}
              >
                <Transition.Child
                  as={Fragment}
                  enter="transition-opacity ease-linear duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="transition-opacity ease-linear duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="fixed inset-0 bg-gray-900/80" />
                </Transition.Child>

                <div className="fixed inset-0 flex">
                  <Transition.Child
                    as={Fragment}
                    enter="transition ease-in-out duration-300 transform"
                    enterFrom="-translate-x-full"
                    enterTo="translate-x-0"
                    leave="transition ease-in-out duration-300 transform"
                    leaveFrom="translate-x-0"
                    leaveTo="-translate-x-full"
                  >
                    <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                      <Transition.Child
                        as={Fragment}
                        enter="ease-in-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in-out duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                      >
                        <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                          <button
                            type="button"
                            className="-m-2.5 p-2.5"
                            onClick={() => setSidebarOpen(false)}
                          >
                            <span className="sr-only">Close sidebar</span>
                            <XMarkIcon
                              className="h-6 w-6 text-white"
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </Transition.Child>
                      {/* Sidebar component, swap this element with another sidebar if you like */}
                      <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gray-800 px-6 pb-2">
                        <div className="flex h-16 shrink-0 items-center">
                          <img
                            className="h-8 w-auto pr-2"
                            src="/logo.svg"
                            alt="image"
                          />
                          <span className="text-white">
                            {username || notLoggedIn}
                          </span>
                        </div>

                        <nav className="flex flex-1 flex-col">
                          <ul
                            role="list"
                            className="flex flex-1 flex-col gap-y-7"
                          >
                            <li>
                              <ul role="list" className="-mx-2 space-y-1">
                                {navigation.map((item) => (
                                  <li key={item.name}>
                                    <Link
                                      href={item.href}
                                      className={classNames(
                                        item.current
                                          ? 'bg-gray-50 text-indigo-600'
                                          : 'text-light-color hover:text-indigo-600 hover:bg-gray-100',
                                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                      )}
                                    >
                                      <item.icon
                                        className={classNames(
                                          item.current
                                            ? 'text-indigo-600'
                                            : 'text-gray-300 group-hover:text-indigo-600',
                                          'h-6 w-6 shrink-0'
                                        )}
                                        aria-hidden="true"
                                      />
                                      {item.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </li>
                            {
                              <li>
                                <div className="text-xs font-semibold leading-6 text-gray-400">
                                  Your teams
                                </div>
                                <ul
                                  role="list"
                                  className="-mx-2 mt-2 space-y-1"
                                >
                                  {teams.map((team) => (
                                    <li key={team.name}>
                                      <Link
                                        href={team.href}
                                        className={classNames(
                                          team.current
                                            ? 'bg-gray-50 text-indigo-600'
                                            : 'text-light-color hover:text-indigo-600 hover:bg-gray-100',
                                          'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                        )}
                                      >
                                        <span
                                          className={classNames(
                                            team.current
                                              ? 'text-indigo-600 border-indigo-600'
                                              : 'text-white0 group-hover:border-indigo-600 group-hover:text-indigo-600',
                                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[0.625rem] font-medium bg-transparent'
                                          )}
                                        >
                                          <FontAwesomeIcon
                                            icon={team.icon}
                                            size="2xl"
                                          />
                                        </span>
                                        <span className="truncate">
                                          {team.name}
                                        </span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            }
                          </ul>
                        </nav>
                      </div>
                    </Dialog.Panel>
                  </Transition.Child>
                </div>
              </Dialog>
            </Transition.Root>

            {/* Static sidebar for desktop */}
            <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-gray-800 px-6">
                <div className="flex h-16 shrink-0 items-center">
                  <img className="h-8 w-auto" src="/logo.svg" alt="image" />
                </div>
                <nav className="flex flex-1 flex-col">
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.href}
                              className={classNames(
                                item.current
                                  ? 'bg-gray-50 text-indigo-600'
                                  : 'text-light-color hover:text-indigo-600 hover:bg-gray-100',
                                'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                              )}
                            >
                              <item.icon
                                className={classNames(
                                  item.current
                                    ? 'text-indigo-600'
                                    : 'text-gray-300 group-hover:text-indigo-600',
                                  'h-6 w-6 shrink-0'
                                )}
                                aria-hidden="true"
                              />
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                    {
                      <li>
                        <div className="text-xs font-semibold leading-6 text-gray-400">
                          Your teams
                        </div>
                        <ul role="list" className="-mx-2 mt-2 space-y-1">
                          {teams.map((team) => (
                            <li key={team.name}>
                              <Link
                                href={team.href}
                                className={classNames(
                                  team.current
                                    ? 'bg-gray-50 text-indigo-600'
                                    : 'text-light-color hover:text-indigo-600 hover:bg-gray-100',
                                  'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                                )}
                              >
                                <span
                                  className={classNames(
                                    team.current
                                      ? 'text-indigo-600 border-indigo-600'
                                      : 'text-light-color group-hover:border-indigo-600 group-hover:text-indigo-600',
                                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-[0.625rem] font-medium bg-transparent'
                                  )}
                                >
                                  <FontAwesomeIcon
                                    icon={team.icon}
                                    size="2xl"
                                  />
                                </span>
                                <span className="truncate">{team.name}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                    }
                    {
                      <li className="-mx-6 mt-auto">
                        <a
                          href="#"
                          className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-light-color hover:bg-gray-100 hover:text-black"
                        >
                          <img
                            className="h-8 w-8 rounded-full"
                            src="/logo.svg"
                            alt=""
                          />
                          <span className="sr-only">Your profile</span>
                          <span aria-hidden="true">
                            {username || notLoggedIn}
                          </span>
                          {/* Log out button */}
                          {username && (
                            <button
                              className="ml-auto px-2 py-1 text-sm font-semibold text-white bg-red-500 rounded hover:bg-red-600"
                              onClick={handleLogout}
                            >
                              Log out
                            </button>
                          )}
                        </a>
                      </li>
                    }
                  </ul>
                </nav>
              </div>
            </div>

            <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm sm:px-6 lg:hidden">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6 text-white" aria-hidden="true" />
              </button>
              <div className="flex-1 text-sm font-semibold leading-6 text-white">
                Dashboard
              </div>
              <div className="relative inline-block text-left">
                <div>
                  <button
                    type="button"
                    className="flex items-center text-gray-700"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <span className="text-white">{username}</span>
                    <UserCircleIcon
                      className="h-8 w-8 text-white"
                      aria-hidden="true"
                    />
                  </button>
                </div>
                {isOpen && username && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div
                      className="py-1"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="options-menu"
                    >
                      <button
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                        role="menuitem"
                        onClick={handleLogout}
                      >
                        Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <main className="py-10 lg:pl-72">
              <div className="px-4 sm:px-6 lg:px-8">{children}</div>
            </main>
          </div>
        </>
      </body>
    </html>
  );
}
