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
  const [fileExtension, setFileExtension] = useState('');
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

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
    const lastPart = pathParts[pathParts.length - 1];
    const querystring =
      pathParts.length > 5 && !/\.\w+$/.test(lastPart)
        ? pathParts.slice(5).join('/')
        : pathParts.slice(5, -1).join('/');

    const extension = lastPart.split('.').pop().toLowerCase();
    setFileExtension(extension);

    if (!fileExtension) {
      return;
    }

    const domainurl = address.includes('localhost' || '127.0.0.1')
      ? ''
      : `${process.env.NEXT_PUBLIC_CORS_PROXY_URL}/`;

    // Build the API URL for template browsing
    let url = `${domainurl}${address}/template/${uniqueId}/${prefix}/${name}/directory/list?deep=true`;

    if (querystring) {
      url += `&directory=${querystring}`;
    }

    // Fetch template browser data
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
        setError(error.message);
        //console.log(error);
      });

    // Fetch file data if fileExtension exists
    const path = querystring ? `${querystring}/${lastPart}` : lastPart;
    const modifiedPath = `?path=${path}`;
    const apiURL = `${domainurl}${address}/template/${uniqueId}/${prefix}/${name}/file/download${modifiedPath}`;

    fetch(apiURL, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.text();
      })
      .then((data) => {
        setInputValue(data);
        //console.log(data);
      })
      .catch((error) => {
        setError(error.message);
        //console.log(error);
      });
  }, [fileExtension]);

  const handleSave = (target) => {
    const token = getCookie('token');
    const address = getCookie('address');
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    const domainurl = address.includes('localhost' || '127.0.0.1')
    ? ''
    : `${process.env.NEXT_PUBLIC_CORS_PROXY_URL}/`;

    const textareaValue = document.querySelector('textarea').value;
    const pathParts = window.location.pathname.split('/');
    const uniqueId = pathParts[2];
    const prefix = pathParts[3];
    const name = pathParts[4];
    const lastPart = pathParts[pathParts.length - 1];
    const querystring =
      pathParts.length > 5 && !/\.\w+$/.test(lastPart)
        ? pathParts.slice(5).join('/')
        : pathParts.slice(5, -1).join('/');

    const path = querystring ? `${querystring}/${lastPart}` : lastPart;
    const modifiedPath = `?path=${path}`;

    const apiURL = `${domainurl}${address}/template/${uniqueId}/${prefix}/${name}/file/create${modifiedPath}`;

    fetch(apiURL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: textareaValue
    })
      .then((response) => {
        if (!response.ok) {
          //console.log(response);
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then((data) => {
        window.location.reload();
        //console.log(data);
      })
      .catch((error) => {
        //console.log(error);
      });
  };

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const deleteCookie = (name) => {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  };

  function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  const pathParts = window.location.pathname.split('/');
  const uniqueId = pathParts[2];
  const prefix = pathParts[3];
  const name = pathParts[4];
  const lastPart = pathParts[pathParts.length - 1];
  let filename = lastPart.includes('.')
    ? lastPart
    : pathParts[pathParts.length - 2];
  const querystring =
    pathParts.length > 5 && !/\.\w+$/.test(lastPart)
      ? pathParts.slice(5).join('/')
      : pathParts.slice(5, -1).join('/');

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
          <p className="mt-4 text-sm text-light-color">
            Path:{' '}
            <span className="text-blurple">
              templates/{uniqueId}/{prefix}/{name}/{querystring}
            </span>
          </p>
          <button className="pt-4">
            <Link className="text-white hover:text-blurple" href=".">
              <FontAwesomeIcon icon={faArrowLeft} className="pr-2" />
              <span className="">Back</span>
            </Link>
          </button>
        </div>
      </div>
      <div className="flow-root">
        {['txt', 'yml', 'conf', 'json', 'properties', 'mcmeta'].includes(
          fileExtension
        ) ? (
          <>
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="mt-4">
                <div className="hidden sm:block pb-2">
                  <nav className="-mb-px flex space-x-8">
                    <span className="text-white hover:border-indigo-500 whitespace-nowrap px-1 text-sm font-medium">
                      {filename}
                    </span>
                  </nav>
                </div>
              </div>
              <div className="divide-y divide-gray-200 ">
                <div className="">
                  <textarea
                    className="bg-transparent text-white px-4 py-2 w-full min-h-[1000px] border border-white"
                    value={inputValue}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
            <div className="mt-3 ml-5 flex">
              <button
                type="button"
                className="ml-3 inline-flex items-center rounded-md bg-blurple hover:bg-blurple/50 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                onClick={() => handleSave()}
              >
                Save
              </button>
            </div>
          </>
        ) : (
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
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0"
                    >
                      Last modified
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                    >
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
                      const fileSegments = files.path
                        .split('/')
                        .filter(Boolean);
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
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                          {new Date(files.lastModified).toLocaleString()}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <Link
                            className="hover:text-blurple pr-4"
                            href={`/templates/${uniqueId}/${prefix}/${name}/${querystring}/${files.path.replace(
                              /^.*\/(?!.*\/)/,
                              ''
                            )}`}
                          >
                            {files.directory
                              ? 'Open'
                              : files.name.match(
                                  /\.(jpeg|jpg|gif|png|dat|dat_old|mca|jar|jar_old|zip|rar|7z|tar|gz|bz2)$/i
                                )
                              ? ''
                              : 'Edit'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
