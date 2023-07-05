'use client';
import { useState, useEffect } from 'react';

export default function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    setToken(document.cookie.includes('token'));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch(process.env.NEXT_PUBLIC_DEV_PROXY_URL + "/auth", {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${username}:${password}`)}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    console.log(data);
    if (data.token === undefined) {
      setError('Invalid username or password');
    } else {
      const expirationTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
      document.cookie = `token=${data.token}; path=/; expires=${expirationTime.toUTCString()}`;
      setToken(data.token);
      setLoggedIn(true);
    }
  };

  if (token) {
    return (
      <main className="flex flex-col items-center justify-between p-24">
        <h1>Logged in!</h1>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-between p-24">
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input className="text-black rounded block" type="text" value={username} onChange={(event) => setUsername(event.target.value)} />
        </label>
        <label>
          Password:
          <input className="text-black rounded block" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        <button className="border" type="submit">Submit</button>
      </form>
    </main>
  );
}