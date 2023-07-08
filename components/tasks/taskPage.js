'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Task() {
  const [task, setTask] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getCookie('token');
    const uniqueId = window.location.pathname.split('/').pop();
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    if (token) {
      fetch(process.env.NEXT_PUBLIC_DEV_PROXY_URL + `/task/${uniqueId}`, {
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
          console.log('data:', data); // log the value of the data object
          setTask(data.task); // update the task state with the fetched data
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

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Task name:{' '}
              <span className="text-blurple">
                {task.name}
              </span>
            </h1>
            <p className="mt-2 text-sm text-gray-700">IP: test</p>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300 dark:text-light-color">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                    >
                      Node:
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold"
                    >
                      Environment
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold"
                    >
                      Memory
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold"
                    >
                      Version
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold"
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
                <tbody className="divide-y divide-gray-200 dark:text-light-color">
                  <tr key="test">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                      test
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      test
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      test / test
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      test
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
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
    </>
  );
}
