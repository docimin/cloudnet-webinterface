'use client';
import { useEffect } from 'react';
import io from 'socket.io-client';

const WebSocketClient = ({ onDataReceived, token }) => {
  useEffect(() => {
    const token = getCookie('token');
    const uniqueId = window.location.pathname.split('/').pop();
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    if (token) {
      const socket = io(
        'ws://i-am-waiting-for-cors:2812/api/v2/service/test-1/liveLog',
        {
          extraHeaders: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      socket.on('connect', () => {
        console.log('WebSocket connected');
      });

      socket.on('data', (data) => {
        console.log('Received data:', data);
        onDataReceived(data);
      });

      socket.on('disconnect', (reason) => {
        console.log('WebSocket disconnected:', reason);
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [onDataReceived, token]);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  return (
    <main>
      <div className="relative border-b border-gray-200 pb-5 sm:pb-0">
        <div className="md:flex md:items-center md:justify-between">
          <h3 className="text-base font-semibold leading-6 text-gray-900">
            Console
          </h3>
          <div className="mt-3 flex md:absolute md:right-0 md:top-3 md:mt-0">
            <button
              type="button"
              className="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
              onClick="{handleSave}"
            >
              Save
            </button>
          </div>
        </div>
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
        </div>
      </div>
      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-800 shadow">
        <div className="px-4 py-5 sm:px-6 min-h-[600px]">
          {/* Content goes here */}
          {/* We use less vertical padding on card headers on desktop than on body sections */}
        </div>
        <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
      </div>
    </main>
  );
};

export default WebSocketClient;
