'use client'
import * as Sentry from '@sentry/nextjs'
import { useTranslations } from 'gt-next/client'
import { Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authApi } from '@/lib/client-api'
import { cn } from '@/lib/utils'

export default function Client() {
	const [loading, setLoading] = useState(false)
	const router = useRouter()
	const authT = useTranslations('Auth')

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

		const formData = new FormData(e.currentTarget)
		const address =
			(formData.get('address') as string | null) ||
			process.env.NEXT_PUBLIC_CLOUDNET_ADDRESS ||
			''
		const username = (formData.get('username') as string) ?? ''
		const password = (formData.get('password') as string) ?? ''

		try {
			setLoading(true)
			const response = await fetch(`/api/auth/signin`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					address,
					username,
					password
				})
			})

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
				setLoading(false)
				toast.error(authT('connectionError'))
			} else if (dataResponse.status === 401) {
				setLoading(false)
				toast.error(authT('invalidCredentials'))
			} else if (dataResponse.status === 404) {
				setLoading(false)
				toast.error(authT('incorrectAddress'))
			} else {
				setLoading(false)
				toast.error(authT('loginError'))
				Sentry.captureException('An error occurred while logging in', {
					extra: dataResponse
				})
			}
		} catch (error) {
			setLoading(false)
			console.error(error)
		}
	}

	return (
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
										name="address"
										type="text"
										placeholder={'127.0.0.1:2812'}
										defaultValue={
											process.env.NEXT_PUBLIC_CLOUDNET_ADDRESS || ''
										}
										autoComplete="url"
										required
									/>
								</div>
							)}
							<div className="grid gap-2">
								<Label htmlFor="username">{authT('username')}</Label>
								<Input
									id="username"
									name="username"
									type="text"
									placeholder={'derklaro'}
									autoComplete="username"
									required
								/>
							</div>
							<div className="grid gap-2 mt-2">
								<Label htmlFor="password">{authT('password')}</Label>
								<Input
									id="password"
									name="password"
									type="password"
									autoComplete="current-password"
									required
								/>
							</div>
							<Button
								type="submit"
								className="w-full"
								disabled={loading}
							>
								{loading && (
									<Loader2
										className={cn(
											'mr-2 h-4 w-4 animate-spin',
											loading ? 'opacity-100' : 'opacity-0'
										)}
									/>
								)}
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
						loading="eager"
					/>
				</div>
			</form>
		</div>
	)
}
