'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import ServiceConsole from '@/components/services/serviceConsole';

export default function Service() {
  const [services, setServices] = useState([]);
  const [error, setError] = useState('');

  function getCookie(name) {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith(name + '=')) {
        return cookie.substring(name.length + 1);
      }
    }
    return null;
  }

  useEffect(() => {
    const token = getCookie('token');
    const uniqueId = window.location.pathname.split('/').pop();
    if (!token) {
      window.location.href = '/auth';
      return;
    }
    if (token) {
      const ws = new WebSocket(
        `${process.env.NEXT_PUBLIC_PROXY_URL.replace(
          /^http/,
          'ws'
        )}/service/${uniqueId}/liveLog`
      );
      ws.onopen = () => {
        console.log('WebSocket connection opened');
      };
      ws.onmessage = (event) => {
        console.log(`Received message: ${event.data}`);
      };
      ws.onerror = (error) => {
        console.error(`WebSocket error: ${error}`);
        console.log(error);
      };
      ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
    }
  }, []);

  return (
    <>
    <span>Console:</span>
    <div className="divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow">
      <div className="px-4 py-5 sm:px-6">
        {services.map((service) => (
          <ServiceConsole key={service.id} service={service} />
        ))}
        {error && <p>{error}</p>}
      </div>
      <div className="px-4 py-5 sm:p-6">{/* Content goes here */}</div>
    </div>
    </>
  );
}
