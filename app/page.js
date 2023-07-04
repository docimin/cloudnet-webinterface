'use client';
import { useState } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch('https://cors.fayevr.dev/proxy-api.fayevr.dev/api/v2/auth', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);
  };

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input className="text-black" type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Password:
          <input className="text-black" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
