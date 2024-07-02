import Client from './page.client'

export const runtime = 'edge'

export default async function Page() {
  return (
    <div className={'h-svh w-full'}>
      <Client />
    </div>
  )
}
