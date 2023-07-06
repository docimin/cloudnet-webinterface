'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Service() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getCookie('token');
    const uniqueId = window.location.pathname.split('/').pop();
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    if (token) {
      fetch(process.env.NEXT_PUBLIC_DEV_PROXY_URL + `/service/${uniqueId}`, {
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
          console.log(data.snapshot);
          setServices([data.snapshot]);
        })
        .catch((error) => setError(error.message));
    }
  }, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  if (error) {
    return (
      <main className="flex flex-col items-center justify-between p-24">
        <h1>Error: {error}</h1>
      </main>
    );
  }

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Service name:{' '}
              <span className="text-blurple">
                {services?.[0]?.configuration?.serviceId?.taskName}
                {services?.[0]?.configuration?.serviceId?.nameSplitter}
                {services?.[0]?.configuration?.serviceId?.taskServiceId}
              </span>
            </h1>
            <p className="mt-2 text-sm text-gray-700">IP: test</p>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Node:
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Environment
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Memory
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Version
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Version Type
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                    >
                      <span className="sr-only">Edit</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr key="test">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {services?.[0]?.configuration?.serviceId?.nodeUniqueId}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {
                        services?.[0]?.configuration?.serviceId?.environment
                          ?.name
                      }
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      test / test
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      test
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      test
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <Link href="">Edit</Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-gray-900">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-sm font-medium leading-6 text-gray-400">
                name
              </p>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-4xl font-semibold tracking-tight text-black">
                  value
                </span>
                test
              </p>
            </div>
            <div className="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8">
              <p className="text-sm font-medium leading-6 text-gray-400">
                name
              </p>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-4xl font-semibold tracking-tight text-black">
                  value
                </span>
                test
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
