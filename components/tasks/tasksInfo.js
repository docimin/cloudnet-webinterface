'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Nodes() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    if (token) {
      fetch(process.env.NEXT_PUBLIC_DEV_PROXY_URL + '/task', {
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
        .then((data) => setTasks(data.tasks))
        .catch((error) => {
          deleteCookie('token');
          deleteCookie('username');
          window.location.href = '/auth';
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
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 dark:text-light-color">
            Tasks
          </h1>
          <p className="mt-2 text-sm dark:text-light-color">
            A list of all the tasks and their info about them.
          </p>
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
                    ID
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Splitter
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Smart
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Min. Count
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Start port
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Static
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tasks.map((task) => (
                  <tr key="test">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium dark:text-light-color sm:pl-0">
                      {task.name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm dark:text-light-color">
                      {task.nameSplitter}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm dark:text-light-color">
                      {task.properties.smartConfig.enabled
                        ? 'Enabled'
                        : 'Disabled'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm dark:text-light-color">
                      {task.minServiceCount}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm dark:text-light-color">
                      {task.startPort}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 dark:text-light-color">
                      test
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <Link href={`/tasks/${task.name}`}>Edit</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
