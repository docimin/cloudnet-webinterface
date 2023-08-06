'use client';
import { useState, useEffect } from 'react';

export default function Auth() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');
  const [modifiedAddress, setModifiedAddress] = useState('');

  useEffect(() => {
    setToken(document.cookie.includes('token'));
  }, []);

  useEffect(() => {
    let newAddress = address;
    newAddress = newAddress.replace(/\/$/, '').trim();
    if (address.includes('http://')) {
      newAddress = address.replace('http://', '');
    } else if (address.includes('https://')) {
      newAddress = address.replace('https://', '');
    }
    if (newAddress.includes('www.')) {
      newAddress = newAddress.replace('www.', '');
    }
    if (!newAddress.includes('/api/v2')) {
      newAddress += '/api/v2';
    }
    setModifiedAddress(newAddress);
  }, [address]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch(
        `https://cors.fayevr.dev/${modifiedAddress}/auth`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${btoa(`${username}:${password}`)}`,
            'Content-Type': 'application/json'
          }
        }
      );
      const data = await response.json();
      console.log(data);
      if (data.token === undefined) {
        setError('Invalid username or password');
      } else {
        const expirationTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
        document.cookie = `token=${data.token}; path=/; expires=${expirationTime}; sameSite=none; secure=true;`;
        document.cookie = `username=${username}; path=/; expires=${expirationTime}; sameSite=none; secure=true;`;
        document.cookie = `address=${modifiedAddress}; path=/; expires=${expirationTime}; sameSite=none; secure=true;`;
        setToken(data.token);
        setLoggedIn(true);
        window.location.href = '/';
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (token) {
    return (
      <main className="flex flex-col items-center justify-between p-24">
        <h1 className="text-light-color">Logged in!</h1>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="flex flex-col items-center justify-between p-24">
        {error && <p className="text-red-500">{error}</p>}
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img
              className="mx-auto h-10 w-auto"
              src="/logo.svg"
              alt="Sushi Roll"
            />
            <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-light-color">
              Sign in to your account
            </h2>
          </div>

          <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-light-color"
                >
                  Address
                </label>
                <div className="mt-2">
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    //required
                    className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium leading-6 text-light-color"
                >
                  Username
                </label>
                <div className="mt-2">
                  <input
                    id="username"
                    name="username"
                    type="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    autoComplete="username"
                    required
                    className="block w-full rounded-md border-0 py-1.5 pl-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium leading-6 text-light-color"
                  >
                    Password
                  </label>
                </div>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    required
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-blurple px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col items-center justify-between p-24">
      <h1 className="text-light-color">Please wait...</h1>
    </main>
  );
}
