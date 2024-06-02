'use client'
import { Button } from '@/components/ui/button'
import { updateNode } from '@/utils/actions/nodes/updateNode'
import { useToast } from '@/components/ui/use-toast'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ModuleSingle } from '@/utils/types/modules'
import { updateLifecycle } from '@/utils/actions/modules/updateLifecycle'
import { useRouter } from 'next/navigation'
import { uninstallModule } from '@/utils/actions/modules/uninstallModule'
import { Users } from '@/utils/types/users'

export default function UserClientPage({
  user,
  userId,
}: {
  user: Users
  userId: string
}) {
  const { toast } = useToast()
  const router = useRouter()

  const handleSave = async (event: any) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())
    if (data.IP === '' || data.Port === '') {
      toast({
        title: 'Failed',
        description: 'IP and Port are required to update node',
        variant: 'destructive',
      })
      return
    }
    const response = await updateNode(user.id, data.IP, data.Port)
    if (response.status === 200) {
      toast({
        title: 'Updated',
        description: 'Module updated successfully',
      })
    } else if (response.status === 500) {
      toast({
        title: 'Failed',
        description: 'Failed to update module',
        variant: 'destructive',
      })
    }
  }

  const handleLifecycle = async (event: string) => {
    const response = await updateLifecycle(user.id, {
      lifecycle: event,
    })
    if (response.status === 204) {
      toast({
        description: 'Lifecycle updated successfully',
      })
      router.refresh()
    }
  }

  const handleUninstall = async () => {
    const response = await uninstallModule(user.id)
    if (response.status === 201) {
      toast({
        description: 'Module has been uninstalled.',
      })
      router.push('.')
    }
  }

  return (
    <>
      <div className={'w-full flex justify-between'}>
        <div>
          <Button variant="outline" type="submit">
            Save
          </Button>
        </div>
        <div className={'flex gap-4 items-center'}>
          <Button variant="outline" onClick={() => handleLifecycle('start')}>
            Start
          </Button>
          <Button variant="outline" onClick={() => handleLifecycle('reload')}>
            Reload
          </Button>
          <Button variant="outline" onClick={() => handleLifecycle('stop')}>
            Stop
          </Button>
          <Button variant="outline" onClick={() => handleLifecycle('unload')}>
            Unload
          </Button>
          <Button variant="destructive" onClick={handleUninstall}>
            Uninstall
          </Button>
        </div>
      </div>
      <form onSubmit={handleSave}>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-8">
          <div className="col-span-6 sm:col-span-6 md:col-span-2">
            <Label htmlFor="lifecycle">Lifecycle</Label>
            <div className="mt-2">
              <Input
                type="text"
                name="lifecycle"
                id="lifecycle"
                required
                autoComplete="lifecycle"
              />
            </div>
          </div>
        </div>
      </form>
    </>
  )
}
