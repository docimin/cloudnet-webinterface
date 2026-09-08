import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import CheckboxField from '@/components/fields/CheckboxField'
import InputField from '@/components/fields/InputField'
import NumberField from '@/components/fields/NumberField'
import SelectField from '@/components/fields/SelectField'
import TagsInputField from '@/components/fields/TagsInputField'
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { taskUpdate } from '@/server/task'
import type { ServiceEnvironmentType } from '@/utils/types/serviceVersions'
import type { Task } from '@/utils/types/tasks'
import JsonField from './jsonField'
import KeyValueField from './keyValueField'
import RawDocumentTab from './rawDocumentTab'
import {
  buildTaskSchema,
  mergeTask,
  type TaskFormValues,
  toTaskFormValues
} from './taskDocument'
import TemplateListField from './templateListField'

export default function TaskFormEditor({
  task,
  environments,
  canEdit
}: {
  task: Task
  environments: ServiceEnvironmentType[]
  canEdit: boolean
}) {
  const router = useRouter()
  const tasksT = useTranslations('Tasks')
  const editorsT = useTranslations('Editors')
  const mainT = useTranslations('Main')

  const [stored, setStored] = useState<Task>(task)
  const [tab, setTab] = useState('form')
  const [raw, setRaw] = useState('')
  const [rawError, setRawError] = useState<string | null>(null)
  // fields keeping a local draft (raw JSON, env vars, templates) have to be
  // rebuilt when the JSON tab replaces the document underneath them
  const [revision, setRevision] = useState(0)

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(
      buildTaskSchema({
        runtimeRequired: mainT('required', { field: tasksT('runtime') }),
        splitterRequired: mainT('required', { field: tasksT('splitter') }),
        environmentRequired: mainT('required', {
          field: tasksT('environment')
        }),
        startPortInvalid: tasksT('startPortInvalid'),
        maxMemoryInvalid: tasksT('maxMemoryInvalid'),
        minServiceCountInvalid: tasksT('minServiceCountInvalid'),
        invalidJsonArray: editorsT('invalidJsonArray')
      })
    ),
    defaultValues: toTaskFormValues(task)
  })

  const environmentOptions = [
    ...new Set([
      ...environments.map((environment) => environment.name),
      ...(stored.processConfiguration?.environment
        ? [stored.processConfiguration.environment]
        : [])
    ])
  ]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ value: name, label: name }))

  const openTab = (value: string) => {
    if (value === 'json') {
      setRaw(JSON.stringify(mergeTask(stored, form.getValues()), null, 2))
      setRawError(null)
    }
    setTab(value)
  }

  const applyRaw = () => {
    let parsed: unknown
    try {
      parsed = JSON.parse(raw)
    } catch {
      setRawError(mainT('invalidJson'))
      return
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      setRawError(editorsT('rawNotAnObject'))
      return
    }
    const next = parsed as Task
    if (next.name !== stored.name) {
      setRawError(tasksT('taskNameChanged'))
      return
    }
    setStored(next)
    form.reset(toTaskFormValues(next))
    setRevision((current) => current + 1)
    setRawError(null)
    setTab('form')
    toast.success(editorsT('jsonApplied'))
  }

  const onSubmit = async (values: TaskFormValues) => {
    const merged = mergeTask(stored, values)
    try {
      await taskUpdate({ data: { task: merged } })
    } catch {
      toast.error(tasksT('updateFailed'))
      return
    }
    setStored(merged)
    toast.success(tasksT('taskUpdated'))
    router.invalidate()
  }

  return (
    <Tabs value={tab} onValueChange={openTab}>
      <TabsList>
        <TabsTrigger value="form">{editorsT('formTab')}</TabsTrigger>
        <TabsTrigger value="json">{editorsT('jsonTab')}</TabsTrigger>
      </TabsList>

      <TabsContent value="form" className="pt-4">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <section className="space-y-3">
              <h2 className="text-sm font-medium">
                {tasksT('sectionGeneral')}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="runtime"
                  render={({ field }) => (
                    <InputField
                      label={tasksT('runtime')}
                      description={tasksT('runtimeDescription')}
                      placeholder={tasksT('runtimePlaceholder')}
                      field={field}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="nameSplitter"
                  render={({ field }) => (
                    <InputField
                      label={tasksT('splitter')}
                      description={tasksT('splitterDescription')}
                      placeholder={tasksT('splitterPlaceholder')}
                      field={field}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="javaCommand"
                  render={({ field }) => (
                    <InputField
                      label={tasksT('javaCommand')}
                      description={tasksT('javaCommandDescription')}
                      placeholder={tasksT('javaCommandPlaceholder')}
                      field={field}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="startPort"
                  render={({ field }) => (
                    <NumberField
                      label={tasksT('startPort')}
                      description={tasksT('startPortDescription')}
                      placeholder="25565"
                      field={field}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="minServiceCount"
                  render={({ field }) => (
                    <NumberField
                      label={tasksT('minServiceCount')}
                      description={tasksT('minServiceCountDescription')}
                      placeholder="0"
                      field={field}
                    />
                  )}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="maintenance"
                  render={({ field }) => (
                    <CheckboxField
                      label={tasksT('maintenance')}
                      description={tasksT('maintenanceDescription')}
                      field={field}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="staticServices"
                  render={({ field }) => (
                    <CheckboxField
                      label={tasksT('isStatic')}
                      description={tasksT('staticDescription')}
                      field={field}
                    />
                  )}
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-medium">
                {tasksT('sectionProcess')}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <SelectField
                      label={tasksT('environment')}
                      description={tasksT('environmentDescription')}
                      options={environmentOptions}
                      field={field}
                    />
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxHeapMemorySize"
                  render={({ field }) => (
                    <NumberField
                      label={tasksT('maxMemory')}
                      description={tasksT('maxMemoryDescription')}
                      placeholder="512"
                      field={field}
                    />
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="jvmOptions"
                render={({ field }) => (
                  <TagsInputField
                    label={tasksT('jvmOptions')}
                    description={tasksT('jvmOptionsDescription')}
                    placeholder={tasksT('jvmOptionsPlaceholder')}
                    field={field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="processParameters"
                render={({ field }) => (
                  <TagsInputField
                    label={tasksT('processParameters')}
                    description={tasksT('processParametersDescription')}
                    placeholder={tasksT('processParametersPlaceholder')}
                    field={field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="environmentVariables"
                render={({ field }) => (
                  <KeyValueField
                    key={revision}
                    label={tasksT('environmentVariables')}
                    description={tasksT('environmentVariablesDescription')}
                    field={field}
                  />
                )}
              />
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-medium">
                {tasksT('sectionResources')}
              </h2>
              <FormField
                control={form.control}
                name="groups"
                render={({ field }) => (
                  <TagsInputField
                    label={tasksT('groups')}
                    description={tasksT('groupsDescription')}
                    placeholder={tasksT('groupsPlaceholder')}
                    field={field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="templates"
                render={({ field }) => (
                  <TemplateListField
                    key={revision}
                    label={tasksT('templates')}
                    description={tasksT('templatesDescription')}
                    field={field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="deployments"
                render={({ field }) => (
                  <JsonField
                    key={revision}
                    label={tasksT('deployments')}
                    description={tasksT('deploymentsDescription')}
                    field={field}
                  />
                )}
              />
              <FormField
                control={form.control}
                name="includes"
                render={({ field }) => (
                  <JsonField
                    key={revision}
                    label={tasksT('includes')}
                    description={tasksT('includesDescription')}
                    field={field}
                  />
                )}
              />
            </section>

            {canEdit && (
              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  {mainT('save')}
                </Button>
              </div>
            )}
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="json" className="pt-4">
        <RawDocumentTab
          value={raw}
          error={rawError}
          onChange={setRaw}
          onApply={applyRaw}
        />
      </TabsContent>
    </Tabs>
  )
}
