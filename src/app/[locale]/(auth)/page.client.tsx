'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import * as Sentry from '@sentry/nextjs'
import { toast } from 'sonner'
import { authApi } from '@/lib/client-api'
import { useDict } from 'gt-next/client'

export default function Client() {
  const [data, setData] = useState({
    address: process.env.NEXT_PUBLIC_CLOUDNET_ADDRESS || '',
    username: '',
    password: ''
  })
  const router = useRouter()
  const authT = useDict('Auth')

  useEffect(() => {
    authApi
      .checkToken()
      .then((response) => {
        if (response.status === 200) {
          router.push('/dashboard')
        }
      })
      .catch(() => {})
  }, [router])

  const handleEmailLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          address: data.address,
          username: data.username,
          password: data.password
        })
      })

      console.log('Tried to login')

      const dataResponse = await response.json()

      if (dataResponse.accessToken) {
        toast.success(authT('loginSuccess'))

        Sentry.addBreadcrumb({
          category: 'auth',
          message: 'Authenticated user',
          level: 'info'
        })

        router.push('/dashboard')
      } else if (dataResponse.cause) {
        toast.error(authT('connectionError'))
      } else if (dataResponse.status === 401) {
        toast.error(authT('invalidCredentials'))
      } else if (dataResponse.status === 404) {
        toast.error(authT('incorrectAddress'))
      } else {
        toast.error(authT('loginError'))
        Sentry.captureException('An error occurred while logging in', {
          extra: dataResponse
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      <div className="w-full h-full">
        <form
          action="#"
          method="POST"
          className={'w-full h-full lg:grid lg:grid-cols-2'}
          onSubmit={handleEmailLogin}
        >
          <div className="flex items-center justify-center py-12">
            <div className="mx-auto grid w-[350px] gap-6">
              <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">{authT('login')}</h1>
                <p className="text-balance text-muted-foreground">
                  {authT('loginDescription')}
                </p>
              </div>
              <div className="grid gap-4">
                {process.env.NEXT_PUBLIC_CLOUDNET_ADDRESS_HIDDEN !== 'true' && (
                  <div className="grid gap-2">
                    <Label htmlFor="address">{authT('address')}</Label>
                    <Input
                      id="address"
                      type="text"
                      placeholder={'127.0.0.1:2812'}
                      onChange={(e) =>
                        setData({ ...data, address: e.target.value })
                      }
                      value={data.address}
                      required
                    />
                  </div>
                )}
                <div className="grid gap-2">
                  <Label htmlFor="email">{authT('username')}</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder={'derklaro'}
                    onChange={(e) =>
                      setData({ ...data, username: e.target.value })
                    }
                    value={data.username}
                    required
                  />
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="password">{authT('password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    onChange={(e) =>
                      setData({ ...data, password: e.target.value })
                    }
                    value={data.password}
                  />
                </div>
                <Button type="submit" className="w-full">
                  {authT('loginButton')}
                </Button>
              </div>
            </div>
          </div>
          <div className="hidden bg-muted lg:block">
            <Image
              src="/images/bg.jpg"
              alt="Image"
              width="1920"
              height="1080"
              className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </form>
      </div>
    </>
  )
}
