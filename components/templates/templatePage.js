'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function TemplateList() {
  const [templateBrowser, setTemplateBrowser] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getCookie('token');
    const address = getCookie('address');
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    const pathParts = window.location.pathname.split('/');
    const uniqueId = pathParts[2];
    const prefix = pathParts[3];
    const name = pathParts[4];

    if (token) {
      const domainurl = address.includes('localhost' || '127.0.0.1')
        ? ''
        : `${process.env.NEXT_PUBLIC_CORS_PROXY_URL}/`;

      fetch(
        `${domainurl}${address}/template/${uniqueId}/${prefix}/${name}/directory/list?deep=true`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(response.statusText);
          }
          return response.json();
        })
        .then((data) => {
          setTemplateBrowser(data.files);
        })
        .catch((error) => {
          //deleteCookie('token');
          //deleteCookie('username');
          //deleteCookie('address');
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

  const pathParts = window.location.pathname.split('/');
  const uniqueId = pathParts[2];
  const prefix = pathParts[3];
  const name = pathParts[4];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-light-color">
            File Browser
          </h1>
          <p className="mt-2 text-sm text-light-color">
            A list of all the files and their info about them.
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
                    Prefix
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                  >
                    Name
                  </th>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                  >
                    Copy to Static Services
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-light-color">
                {templateBrowser.map((files) => (
                    <tr key={`${files.name}`}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                        {files.name}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                        {files.name}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                        {files.alwaysCopyToStaticServices
                          ? 'True'
                          : 'False'}{' '}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <Link
                          className="hover:text-blurple pr-4"
                          href={`/templates/${uniqueId}/${prefix}/${name}/${files.path}`}
                        >
                          Edit
                        </Link>
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
