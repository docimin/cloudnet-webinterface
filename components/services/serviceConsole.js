'use client';
import { useEffect } from 'react';
import io from 'socket.io-client';

const WebSocketClient = ({ onDataReceived }) => {
  useEffect(() => {
    const socket = io('ws://217.160.104.158:2812/api/v2/service/test-1/liveLog');

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