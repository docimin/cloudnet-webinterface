'use client'
import { useEffect } from 'react'
import { checkToken } from '@/utils/actions/user/jwt'
import { useRouter } from 'next/navigation'

export default function CheckAuth({ children }) {
  const router = useRouter()
  useEffect(() => {
    checkToken().then((response) => {
      if (response.status === 401) {
        router.push('/')
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
