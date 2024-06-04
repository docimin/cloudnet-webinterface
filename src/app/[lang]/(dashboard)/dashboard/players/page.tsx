import PageLayout from '@/components/pageLayout'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const runtime = 'edge'

export default function PlayersPage() {
  return (
    <PageLayout title={'Players'}>
      <div className="h-svh">
        <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
          <h1 className="text-[7rem] font-bold leading-tight">418</h1>
          <span className="font-medium">Teapot!</span>
          <p className="text-center text-muted-foreground">
            It looks like you&apos;re trying to access a page that isn&apos;t
            available yet.
          </p>
          <div className="mt-6 flex gap-4">
            <Link href={'.'}>
              <Button variant="outline">Go back</Button>
            </Link>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
