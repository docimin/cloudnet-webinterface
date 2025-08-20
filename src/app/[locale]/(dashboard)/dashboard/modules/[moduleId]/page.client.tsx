'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Module, Target } from '@/utils/types/modules'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { toast } from 'sonner'
import { moduleApi } from '@/lib/client-api'
import { useTranslations } from 'gt-next/client'

export default function ModuleClientPage({
  module,
  moduleId,
  moduleConfig
}: {
  module: Module
  moduleId: string
  moduleConfig: any
}) {
  const router = useRouter()
  const modulesT = useTranslations('Modules')
  const mainT = useTranslations('Main')
  const [moduleConfigData, setModuleConfigData] = useState(
    JSON.stringify(moduleConfig, null, 2)
  )

  const handleModuleConfigSave = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault()

    const response = await moduleApi.updateConfig(
      moduleId,
      JSON.parse(moduleConfigData)
    )

    if (response.status === 204) {
      toast.success(modulesT('moduleConfigUpdated'))
    }
  }

  const handleLifecycle = async (event: Target) => {
    const response = await moduleApi.updateLifecycle(moduleId, event)
    if (response.status === 204) {
      toast.success(modulesT('lifecycleUpdated'))
      router.refresh()
    }
  }

  const handleUninstall = async () => {
    const response = await moduleApi.uninstall(moduleId)
    if (response.status === 204) {
      toast.success(modulesT('moduleUninstalled'))
      router.push('/dashboard/modules')
    }
  }

  return (
    <>
      <form onSubmit={handleModuleConfigSave}>
        <div className={'w-full flex justify-between'}>
          <div>
            {moduleConfigData && (
              <Button variant="outline" type="submit">
                {mainT('save')}
              </Button>
            )}
          </div>
          <div className={'flex gap-4 items-center'}>
            <span>
              {modulesT('status')}: {module.lifecycle}
            </span>
            {module.lifecycle !== 'STARTED' && (
              <Button
                variant="outline"
                onClick={() => handleLifecycle(Target.START)}
                type={'button'}
              >
                {modulesT('start')}
              </Button>
            )}
            {module.lifecycle === 'STARTED' && (
              <Button
                variant="outline"
                onClick={() => handleLifecycle(Target.RELOAD)}
                type={'button'}
              >
                {modulesT('reload')}
              </Button>
            )}
            {module.lifecycle !== 'STOPPED' && (
              <Button
                variant="outline"
                onClick={() => handleLifecycle(Target.STOP)}
                type={'button'}
              >
                {modulesT('stop')}
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => handleLifecycle(Target.UNLOAD)}
              type={'button'}
            >
              {modulesT('unload')}
            </Button>
            <Button variant="destructive" onClick={handleUninstall}>
              {mainT('delete')}
            </Button>
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-6 gap-y-8">
          <div className="col-span-6 sm:col-span-6 md:col-span-2">
            <Label htmlFor="lifecycle">{modulesT('lifecycle')}</Label>
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
            <Label htmlFor="version">{modulesT('version')}</Label>
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
            <Label htmlFor="author">{modulesT('author')}</Label>
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
            <Label htmlFor="group">{modulesT('group')}</Label>
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
          <Label htmlFor="description">{modulesT('description')}</Label>
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
            <Label htmlFor="json">{modulesT('json')}</Label>
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
