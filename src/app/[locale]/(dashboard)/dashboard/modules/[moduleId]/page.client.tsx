'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Module } from '@/utils/types/modules'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import { moduleApi } from '@/lib/client-api'

export default function ModuleClientPage({
  module,
  moduleId,
  moduleConfig,
}: {
  module: Module
  moduleId: string
  moduleConfig: any
}) {
  const router = useRouter()
  const [moduleConfigData, setModuleConfigData] = useState(
    JSON.stringify(moduleConfig, null, 2)
  )

  const handleModuleConfigSave = async (event) => {
    event.preventDefault()

    const response = await moduleApi.updateConfig(
      moduleId,
      JSON.parse(moduleConfigData)
    )

    if (response.status === 204) {
      toast.success('Module config updated successfully')
    }
  }

  const handleLifecycle = async (event: string) => {
    const response = await moduleApi.updateLifecycle(moduleId, {
      lifecycle: event,
    })
    if (response.status === 204) {
      toast.success('Lifecycle updated successfully')
      router.refresh()
    }
  }

  const handleUninstall = async () => {
    const response = await moduleApi.uninstall(moduleId)
    if (response.status === 201) {
      toast.success('Module has been uninstalled.')
      router.push('.')
    }
  }

  return (
    <>
      <form onSubmit={handleModuleConfigSave}>
        <div className={'w-full flex justify-between'}>
          <div>
            {moduleConfigData && (
              <Button variant="outline" type="submit">
                Save
              </Button>
            )}
          </div>
          <div className={'flex gap-4 items-center'}>
            <span>STATUS: {module.lifecycle}</span>
            <Button
              variant="outline"
              onClick={() => handleLifecycle('start')}
              type={'button'}
            >
              Start
            </Button>
            <Button
              variant="outline"
              onClick={() => handleLifecycle('reload')}
              type={'button'}
            >
              Reload
            </Button>
            <Button
              variant="outline"
              onClick={() => handleLifecycle('stop')}
              type={'button'}
            >
              Stop
            </Button>
            <Button
              variant="outline"
              onClick={() => handleLifecycle('unload')}
              type={'button'}
            >
              Unload
            </Button>
            <Button variant="destructive" onClick={handleUninstall}>
              Uninstall
            </Button>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-8">
          <div className="col-span-6 sm:col-span-6 md:col-span-2">
            <Label htmlFor="lifecycle">Lifecycle</Label>
            <div className="mt-2">
              <Input
                type="text"
                name="lifecycle"
                id="lifecycle"
                disabled
                value={module.lifecycle}
              />
            </div>
          </div>
          <div className="col-span-6 sm:col-span-6 md:col-span-2">
            <Label htmlFor="version">Version</Label>
            <div className="mt-2">
              <Input
                type="text"
                name="version"
                id="version"
                disabled
                value={module.configuration.version}
              />
            </div>
          </div>
          <div className="col-span-6 sm:col-span-6 md:col-span-2">
            <Label htmlFor="author">Author</Label>
            <div className="mt-2">
              <Input
                type="text"
                name="author"
                id="author"
                disabled
                value={module.configuration.author}
              />
            </div>
          </div>
          <div className="col-span-6 sm:col-span-6 md:col-span-2">
            <Label htmlFor="group">Group</Label>
            <div className="mt-2">
              <Input
                type="text"
                name="group"
                id="group"
                disabled
                value={module.configuration.group}
              />
            </div>
          </div>
        </div>
        <div className="w-full mt-8">
          <Label htmlFor="description">Description</Label>
          <div className="mt-2">
            <Input
              type="text"
              name="description"
              id="description"
              disabled
              value={module.configuration.description}
            />
          </div>
        </div>
        {moduleConfigData && (
          <div className="w-full mt-8">
            <Label htmlFor="json">JSON</Label>
            <div className="mt-2">
              <Textarea
                name="json"
                id="json"
                className={'h-96'}
                required
                value={moduleConfigData}
                onChange={(event) => setModuleConfigData(event.target.value)}
              />
            </div>
          </div>
        )}
      </form>
    </>
  )
}
