'use client'
import { useEffect, useState } from 'react'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { checkToken } from '@/utils/actions/user/jwt'

export default function Client() {
  const { toast } = useToast()
  const [data, setData] = useState({
    address: process.env.NEXT_PUBLIC_ADDRESS || '',
    username: '',
    password: '',
  })
  const router = useRouter()

  useEffect(() => {
    checkToken().then((response) => {
      if (response.status === 200) {
        router.push('/dashboard')
      }
    })
  }, [router])

  const handleEmailLogin = async (e) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/user/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: data.address,
          username: data.username,
          password: data.password,
        }),
      })

      const dataResponse = await response.json()

      if (dataResponse.status === 401) {
        toast({
          title: 'Error',
          description: 'Invalid username or password',
          variant: 'destructive',
        })
      } else {
        //router.push('/dashboard')
      }
    } catch (error) {
      console.error(error)
    }

    /*
    router.push('/dashboard')
     */
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
                <h1 className="text-3xl font-bold">Login</h1>
                <p className="text-balance text-muted-foreground">
                  Enter your email below to login to your account
                </p>
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    type="text"
                    onChange={(e) =>
                      setData({ ...data, address: e.target.value })
                    }
                    value={data.address}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="derklaro"
                    onChange={(e) =>
                      setData({ ...data, username: e.target.value })
                    }
                    value={data.username}
                    required
                  />
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="password">Password</Label>
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
                  Login
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
