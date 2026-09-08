import { z } from 'zod'
import { asTemplateEntry, templateEntrySchema } from './templateEntry'

export const buildGroupSchema = (invalidJsonArray: string) =>
  z.object({
    targetEnvironments: z.array(z.string()),
    templates: z.array(templateEntrySchema),
    jvmOptions: z.array(z.string()),
    processParameters: z.array(z.string()),
    environmentVariables: z.record(z.string(), z.string()),
    deployments: z.array(z.unknown(), { error: invalidJsonArray }),
    includes: z.array(z.unknown(), { error: invalidJsonArray })
  })

export type GroupFormValues = z.infer<ReturnType<typeof buildGroupSchema>>

export function toGroupFormValues(group: Group): GroupFormValues {
  return {
    targetEnvironments: group.targetEnvironments ?? [],
    templates: (group.templates ?? []).map(asTemplateEntry),
    jvmOptions: group.jvmOptions ?? [],
    processParameters: group.processParameters ?? [],
    environmentVariables: group.environmentVariables ?? {},
    deployments: group.deployments ?? [],
    includes: group.includes ?? []
  }
}

// the stored document is spread first so keys the form does not model —
// properties and anything a module added — survive the save
export function mergeGroup(
  group: Group,
  values: GroupFormValues
): Group & Record<string, unknown> {
  return {
    ...group,
    targetEnvironments: values.targetEnvironments,
    templates: values.templates as Template[],
    jvmOptions: values.jvmOptions,
    processParameters: values.processParameters,
    environmentVariables: values.environmentVariables,
    // an unparseable draft in the raw-JSON fields reads back as undefined; the
    // stored list stands in so switching tabs cannot drop the key
    deployments: (Array.isArray(values.deployments)
      ? values.deployments
      : group.deployments) as Deployment[],
    includes: (Array.isArray(values.includes)
      ? values.includes
      : group.includes) as Include[]
  }
}
