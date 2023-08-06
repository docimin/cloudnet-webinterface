'use client';
import { useEffect } from 'react';

function RedirectComponent() {
  useEffect(() => {
    window.location.href = '.';
  }, []);

  return null;
}

export default RedirectComponent;