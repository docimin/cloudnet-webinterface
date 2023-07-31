'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Nodes() {
  const [nodes, setNodes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getCookie('token');
    const address = getCookie('address');
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    if (token) {
      //fetch(process.env.NEXT_PUBLIC_DEV_PROXY_URL + '/service', {

        const domainurl = address.includes('localhost' || '127.0.0.1')
        ? ''
        : `${process.env.NEXT_PUBLIC_CORS_PROXY_URL}/`;

      fetch(
        `${domainurl}${address}/cluster`, {
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
        .then((data) => setNodes(data.nodes))
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
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-light-color">
            Nodes
          </h1>
          <p className="mt-2 text-sm text-light-color">
            A list of all the nodes and their info about them.
          </p>
        </div>
      </div>
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300 text-light-color">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold"
                  >
                    Status
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
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-light-color">
                {nodes.map((node) => (
                  <tr key={node.node.uniqueId}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                      {node.node.uniqueId}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {node.state}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {(node.nodeInfoSnapshot && node.nodeInfoSnapshot.usedMemory) || 0} MB /{' '}
                      {(node.nodeInfoSnapshot && node.nodeInfoSnapshot.maxMemory) || 0} MB
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      {(node.nodeInfoSnapshot && node.nodeInfoSnapshot.version.major) || 0}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      { (node.nodeInfoSnapshot && node.nodeInfoSnapshot.version.versionType) || 0}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <Link className="hover:text-blurple" href={`/nodes/${node.node.uniqueId}`}>Edit</Link>
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
