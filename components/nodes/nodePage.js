'use client';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMemory, faCoffee, faCodeBranch, faCircleExclamation } from '@fortawesome/free-solid-svg-icons'

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
          //console.log(response);
          return response.json();
        })
        .then((data) => {
          //console.log(data);
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
      icon: faMemory,
      canEdit: false,
      value1: node?.nodeInfoSnapshot?.usedMemory,
      value2: node?.nodeInfoSnapshot?.maxMemory,
      value1Name: 'Used Memory',
      value2Name: 'Max Memory'
    },
    {
      id: 2,
      name: 'Amount of services',
      icon: faCoffee,
      canEdit: true,
      value1: node?.nodeInfoSnapshot?.currentServicesCount,
      value2: '',
      value1Name: 'Current Services Count',
      value2Name: ''
    },
    {
      id: 3,
      name: 'Drain Status',
      icon: faCircleExclamation,
      canEdit: true,
      value1: node?.nodeInfoSnapshot?.drain ? 'Draining' : 'Not Draining',
      value2: '',
      value1Name: 'Drain status',
      value2Name: ''
    },
    {
      id: 4,
      name: 'Version',
      icon: faCodeBranch,
      canEdit: true,
      value1: node?.nodeInfoSnapshot?.version?.major,
      value2: node?.nodeInfoSnapshot?.version?.versionType,
      value1Name: 'Major version',
      value2Name: 'Type'
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
          <div className="flex items-center gap-x-4 border-b bg-gray-50 dark:bg-transparent p-6 divider">
          <FontAwesomeIcon icon={stats.icon} className="h-4 w-4 p-2 flex-none rounded-lg bg-white object-cover ring-1 ring-gray-900/10" />
            <div className="text-sm font-medium leading-6 dark:text-light-color">
              {stats.name}
            </div>
          </div>
          <dl className="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <dt className="dark:text-light-color">{stats.value1Name}</dt>
              <dd className="dark:text-light-color">
                <span>
                  <input
                    type="text"
                    className="text-sm rounded dark:bg-transparent"
                    defaultValue={stats.value1}
                    disabled={stats.canEdit === false}
                    hidden={!stats.value1}
                  />
                </span>
              </dd>
            </div>

            {stats.value2 && (
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="dark:text-light-color">{stats.value2Name}</dt>
                <dd className="flex items-start gap-x-2">
                  <div className="dark:text-light-color">
                    <input
                      type="text"
                      className="text-sm rounded dark:bg-transparent"
                      defaultValue={stats.value2}
                      disabled={stats.canEdit === false}
                    />
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </li>
      ))}
    </ul>
  );
}
