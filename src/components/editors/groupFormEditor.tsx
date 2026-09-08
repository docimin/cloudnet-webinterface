import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import CommandSelectField from '@/components/fields/CommandSelectField'
import TagsInputField from '@/components/fields/TagsInputField'
import { Button } from '@/components/ui/button'
import { Form, FormField } from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { groupUpdate } from '@/server/group'
import type { ServiceEnvironmentType } from '@/utils/types/serviceVersions'
import {
  buildGroupSchema,
  type GroupFormValues,
  mergeGroup,
  toGroupFormValues
} from './groupDocument'
import JsonField from './jsonField'
import KeyValueField from './keyValueField'
import RawDocumentTab from './rawDocumentTab'
import TemplateListField from './templateListField'

export default function GroupFormEditor({
  group,
  environments
}: {
  group: Group
  environments: ServiceEnvironmentType[]
}) {
  const router = useRouter()
  const groupsT = useTranslations('Groups')
  const editorsT = useTranslations('Editors')
  const mainT = useTranslations('Main')

  const [stored, setStored] = useState<Group>(group)
  const [tab, setTab] = useState('form')
  const [raw, setRaw] = useState('')
  const [rawError, setRawError] = useState<string | null>(null)
  // fields keeping a local draft (raw JSON, env vars, templates) have to be
  // rebuilt when the JSON tab replaces the document underneath them
  const [revision, setRevision] = useState(0)

  const form = useForm<GroupFormValues>({
    resolver: zodResolver(buildGroupSchema(editorsT('invalidJsonArray'))),
    defaultValues: toGroupFormValues(group)
  })

  const environmentOptions = [
    ...new Set([
      ...environments.map((environment) => environment.name),
      ...(stored.targetEnvironments ?? [])
    ])
  ]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({ value: name, label: name }))

  const openTab = (value: string) => {
    if (value === 'json') {
      setRaw(JSON.stringify(mergeGroup(stored, form.getValues()), null, 2))
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
    const next = parsed as Group
    if (next.name !== stored.name) {
      setRawError(groupsT('groupNameChanged'))
      return
    }
    setStored(next)
    form.reset(toGroupFormValues(next))
    setRevision((current) => current + 1)
    setRawError(null)
    setTab('form')
    toast.success(editorsT('jsonApplied'))
  }

  const onSubmit = async (values: GroupFormValues) => {
    const merged = mergeGroup(stored, values)
    try {
      await groupUpdate({ data: merged })
    } catch {
      toast.error(groupsT('groupUpdateFailed'))
      return
    }
    setStored(merged)
    toast.success(groupsT('groupConfigUpdated'))
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
            <FormField
              control={form.control}
              name="targetEnvironments"
              render={({ field }) => (
                <CommandSelectField
                  label={groupsT('environments')}
                  description={groupsT('environmentsDescription')}
                  options={environmentOptions}
                  field={field}
                />
              )}
            />
            <FormField
              control={form.control}
              name="jvmOptions"
              render={({ field }) => (
                <TagsInputField
                  label={groupsT('jvmOptions')}
                  description={groupsT('jvmOptionsDescription')}
                  placeholder={groupsT('jvmOptionsPlaceholder')}
                  field={field}
                />
              )}
            />
            <FormField
              control={form.control}
              name="processParameters"
              render={({ field }) => (
                <TagsInputField
                  label={groupsT('processParameters')}
                  description={groupsT('processParametersDescription')}
                  placeholder={groupsT('processParametersPlaceholder')}
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
                  label={groupsT('environmentVariables')}
                  description={groupsT('environmentVariablesDescription')}
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
                  label={groupsT('templates')}
                  description={groupsT('templatesDescription')}
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
                  label={groupsT('deployments')}
                  description={groupsT('deploymentsDescription')}
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
                  label={groupsT('includes')}
                  description={groupsT('includesDescription')}
                  field={field}
                />
              )}
            />

            <div className="flex justify-end">
              <Button type="submit" size="sm">
                {mainT('save')}
              </Button>
            </div>
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
