'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faFolder,
  faFileAlt
} from '@fortawesome/free-solid-svg-icons';

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
    const querystring =
      pathParts.length > 5 && !/\.\w+$/.test(pathParts[5])
        ? pathParts.slice(5).join('/')
        : '';

    if (token) {
      const domainurl = address.includes('localhost' || '127.0.0.1')
        ? ''
        : `${process.env.NEXT_PUBLIC_CORS_PROXY_URL}/`;

      let url = `${domainurl}${address}/template/${uniqueId}/${prefix}/${name}/directory/list?deep=true`;

      if (querystring) {
        url += `&directory=${querystring}`;
      }

      console.log(`URL: ${url}`);

      fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
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
  const querystring =
    pathParts.length > 5 && !/\.\w+$/.test(pathParts[pathParts.length - 1])
      ? pathParts.slice(5).join('/')
      : '';

  console.log(`Query String: ${querystring}`);

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

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
          <button className="pt-4">
            {querystring && (
              <Link className="text-white hover:text-blurple" href=".">
                <FontAwesomeIcon icon={faArrowLeft} className="pr-2" />
                <span className="">Back</span>
              </Link>
            )}
          </button>
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
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                  >
                    Size
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Edit</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-light-color">
                {templateBrowser
                  .filter((files) => {
                    // Get the path segments of the current directory
                    const currentPathSegments = querystring
                      .split('/')
                      .filter(Boolean);
                    // Get the path segments of the file
                    const fileSegments = files.path.split('/').filter(Boolean);
                    // Check if the file is directly under the current directory
                    return (
                      fileSegments.length === currentPathSegments.length + 1
                    );
                  })
                  .sort((a, b) => {
                    if (a.directory && !b.directory) {
                      return -1;
                    } else if (!a.directory && b.directory) {
                      return 1;
                    } else {
                      return a.name.localeCompare(b.name);
                    }
                  })
                  .sort((a, b) => {
                    if (a.directory && !b.directory) {
                      return -1;
                    } else if (!a.directory && b.directory) {
                      return 1;
                    } else {
                      return a.name.localeCompare(b.name);
                    }
                  })
                  .map((files) => (
                    <tr key={`${files.name}`}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0 flex items-center">
                        <FontAwesomeIcon
                          icon={files.directory ? faFolder : faFileAlt}
                          className="mr-2 h-5 w-5"
                        />
                        <span className="h-5">{files.name}</span>
                      </td>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                        {files.directory ? '-' : formatBytes(files.size)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <Link
                          className="hover:text-blurple pr-4"
                          href={[
                            '/templates',
                            uniqueId,
                            prefix,
                            name,
                            querystring,
                            files.path
                          ].join('/')}
                        >
                          {files.directory ? 'Open' : 'Edit'}
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
