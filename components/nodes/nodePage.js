'use client';
import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react';
import { EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

export default function Node() {
  const [node, setNode] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    const uniqueId = window.location.pathname.split('/').pop();
    if (token) {
      fetch(process.env.NEXT_PUBLIC_DEV_PROXY_URL + `/cluster/${uniqueId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          console.log(response);
          return response.json();
        })
        .then((data) => {
          console.log(data);
          setNode(data.node);
        })
        .catch((error) => {
          //deleteCookie('token');
          //deleteCookie('username');
          //window.location.href = '/auth';
          setError(error.message);
        });
    }
  }, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  if (error) {
    return (
      <main className="flex flex-col items-center justify-between p-24">
        <h1>Error: {error}</h1>
      </main>
    );
  }

  const stats = [
    {
      id: 1,
      name: 'Memory',
      imageUrl: 'https://tailwindui.com/img/logos/48x48/tuple.svg',
      value1: node?.nodeInfoSnapshot?.usedMemory,
      value2: node?.nodeInfoSnapshot?.maxMemory
    },
    {
      id: 2,
      name: 'SavvyCal',
      imageUrl: 'https://tailwindui.com/img/logos/48x48/savvycal.svg',
      value1: '',
      value2: ''
    }
  ];

  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-x-6 gap-y-8 lg:grid-cols-3 xl:gap-x-8"
    >
      {stats.map((stats) => (
        <li
          key={stats.id}
          className="overflow-hidden rounded-xl border border-gray-200"
        >
          <div className="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-6">
            <img
              src={stats.imageUrl}
              alt={stats.name}
              className="h-12 w-12 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10"
            />
            <div className="text-sm font-medium leading-6 text-gray-900">
              {stats.name}
            </div>
          </div>
          <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Last invoice</dt>
              <dd className="text-gray-700">
                <span>
                <input type="text" className="text-sm" defaultValue={stats.value1} disabled={!stats.value1} hidden={!stats.value1} />
                </span>
              </dd>
            </div>
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="text-gray-500">Amount</dt>
              <dd className="flex items-start gap-x-2">
                <div className="text-gray-900">
                <input type="text" className="text-sm" defaultValue={stats.value2} disabled={!stats.value2} hidden={!stats.value2} />
                </div>
              </dd>
            </div>
          </dl>
        </li>
      ))}
    </ul>
  );
}
