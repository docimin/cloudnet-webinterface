import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NoAccess() {
  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] font-bold leading-tight">401</h1>
        <span className="font-medium">Unauthorized</span>
        <p className="text-center text-muted-foreground">
          You don&apos;t have the required permissions to access this page.
        </p>
        <div className="mt-6 flex gap-4">
          <Link href={'.'}>
            <Button variant="outline">Go back</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
