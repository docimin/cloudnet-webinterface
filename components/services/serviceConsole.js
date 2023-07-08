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
      <h1 className="dark:text-light-color">Console</h1>
      <div className="divide-y divide-gray-200 overflow-hidden rounded-lg  bg-white dark:bg-gray-800 shadow">
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
