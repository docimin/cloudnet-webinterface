'use client';
import { useState, useEffect } from 'react';

export default function Nodes() {
  const [nodes, setNodes] = useState([]);
  const [error, setError] = useState('');

useEffect(() => {
  const token = getCookie('token');
  if (token) {
    fetch('https://cors.fayevr.dev/proxy-api.fayevr.dev/api/v2/nodes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }
        return response.json();
      })
      .then(data => setNodes(data))
      .catch(error => setError(error.message));
  }
}, []);

  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  if (error) {
    return (
      <main className="flex flex-col items-center justify-between p-24">
        <h1>Error: {error}</h1>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <h1>Nodes:</h1>
      <ul>
        {nodes.map(node => (
          <li key={node.id}>{node.name}</li>
        ))}
      </ul>
    </main>
  );
}