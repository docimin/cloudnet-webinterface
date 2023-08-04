'use client';
import { useEffect } from 'react';
import io from 'socket.io-client';
import Link from 'next/link';

const WebSocketClient = ({ onDataReceived, token }) => {
  useEffect(() => {
    const token = getCookie('token');
    const pathParts = window.location.pathname.split('/');
    const uniqueId = pathParts[2];
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    if (token) {
      const socket = new WebSocket(
        'wss://proxy-api.fayevr.dev/api/v2/service/lobby-1/liveLog',
        token
      );

      socket.addEventListener('open', (event) => {
        console.log('WebSocket connected');
      });

      socket.addEventListener('message', (event) => {
        console.log('Received data:', event.data);
        onDataReceived(event.data);
      });

      socket.addEventListener('close', (event) => {
        console.log('WebSocket disconnected:', event.reason);
      });

      socket.addEventListener('error', (event) => {
        console.error('WebSocket error:', event);
      });

      return () => {
        socket.close();
      };
    }
  }, [onDataReceived, token]);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const pathParts = window.location.pathname.split('/');
  const uniqueId = pathParts[2];

  const tabs = [
    { name: 'Configuration', href: '#', current: false },
    { name: 'Console', href: `${uniqueId}/console`, current: false }
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="mt-4">
        <div className="sm:hidden">
          <label htmlFor="current-tab" className="sr-only">
            Select a tab
          </label>
          <select
            id="current-tab"
            name="current-tab"
            className="block w-full rounded-md border-0 py-1.5 pl-3 pr-10 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
          ></select>
        </div>
        <div className="hidden sm:block pb-2">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <Link key={tab.name} href={tab.href}>
                <button
                  key={tab.name}
                  className={
                    'text-white hover:border-indigo-500 whitespace-nowrap px-1 text-sm font-medium'
                  }
                  aria-current={tab.current ? 'page' : undefined}
                >
                  <span className="">{tab.name}</span>
                </button>
              </Link>
            ))}
          </nav>
        </div>
      </div>
      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg border shadow">
        <div className="px-4 py-5 sm:px-6 min-h-[600px]">
          <span className="text-white">Test</span>
        </div>
        <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
      </div>
    </div>
  );
};

export default WebSocketClient;
