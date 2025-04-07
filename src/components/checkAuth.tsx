'use client'
import { useEffect } from 'react'
import { authApi } from '@/lib/client-api'
import { useRouter } from 'next/navigation'

export default function CheckAuth({ children }) {
  const router = useRouter()
  useEffect(() => {
    authApi.checkToken().then((response) => {
      if (response.status === 401) {
        router.push('/')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
