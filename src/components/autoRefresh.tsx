'use client'
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AutoRefresh({
  timer = 10000,
  children
}: {
  timer?: number
  children: React.ReactNode
}) {
  const router = useRouter()
  useEffect(() => {
    const autoRefresh = setInterval(() => {
      router.refresh()
    }, timer) // 10000 milliseconds = 10 seconds

    // Clear interval on component unmount
    return () => {
      clearInterval(autoRefresh)
    }
  }, [router, timer])
  return <div>{children}</div>
}
