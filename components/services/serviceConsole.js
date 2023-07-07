'use client';
import { useEffect } from 'react';
import io from 'socket.io-client';

const WebSocketClient = ({ onDataReceived }) => {
  useEffect(() => {
    const socket = io('https://proxy-api.fayevr.dev/api/v2/service/test-1/liveLog/socket.io/?EIO=4&transport=polling&t=OalTqQ5');

    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('data', (data) => {
      onDataReceived(data);
    });

    socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    return () => {
      socket.disconnect();
    };
  }, [onDataReceived]);

  return null;
};

export default WebSocketClient;