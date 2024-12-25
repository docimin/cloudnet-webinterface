'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Module } from '@/utils/types/modules'
import { updateLifecycle } from '@/utils/actions/modules/updateLifecycle'
import { useRouter } from '@/i18n/routing'
import { uninstallModule } from '@/utils/actions/modules/uninstallModule'
import { useState } from 'react'
import { updateModuleConfig } from '@/utils/actions/modules/updateModuleConfig'
import { toast } from 'sonner'
import { githubDarkTheme, JsonEditor } from 'json-edit-react'
import jsonSchema from './rest-configuration-schema.json'
import Ajv2019 from 'ajv/dist/2019'

const ajv = new Ajv2019()
console.log(jsonSchema)
const schema = ajv.compile(jsonSchema)

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

    const response = await updateModuleConfig(
      moduleId,
      JSON.parse(moduleConfigData)
    )

    if (response.status === 200) {
      toast.success('Module config updated successfully')
    }
  }

  const handleLifecycle = async (event: string) => {
    const response = await updateLifecycle(moduleId, {
      lifecycle: event,
    })
    if (response.status === 204) {
      toast.success('Lifecycle updated successfully')
      router.refresh()
    }
  }

  const handleUninstall = async () => {
    const response = await uninstallModule(moduleId)
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
              <JsonEditor
                data={moduleConfig}
                theme={githubDarkTheme}
                maxWidth={'100%'}
                onUpdate={({ newData }) => {
                  const valid = schema(newData)
                  if (!valid) {
                    console.log('Errors', schema.errors)
                    const errorMessage = schema.errors
                      ?.map(
                        (error) =>
                          `${error.instancePath}${error.instancePath ? ': ' : ''}${error.message}`
                      )
                      .join('\n')
                    // Send detailed error message to an external UI element, such as a "Toast" notification
                    toast.error(errorMessage)
                    // This string returned to and displayed in json-edit-react UI
                    return 'Schema invalid'
                  }
                }}
                defaultValue={'data'}
                showCollectionCount={'when-closed'}
              />
            </div>
          </div>
        )}
      </form>
    </>
  )
}
