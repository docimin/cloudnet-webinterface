import { z } from 'zod'

// loose so a template carrying keys the panel does not model survives the round
// trip back to the node
export const templateEntrySchema = z.looseObject({
  storage: z.string(),
  prefix: z.string(),
  name: z.string(),
  priority: z.number().int(),
  alwaysCopyToStaticServices: z.boolean()
})

export type TemplateEntry = z.infer<typeof templateEntrySchema>

// no field of ServiceTemplate is required by the spec, so a stored template can
// miss any of them
export function asTemplateEntry(raw: unknown): TemplateEntry {
  const entry = (raw && typeof raw === 'object' ? raw : {}) as Record<
    string,
    unknown
  >
  return {
    ...entry,
    storage: typeof entry.storage === 'string' ? entry.storage : 'local',
    prefix: typeof entry.prefix === 'string' ? entry.prefix : '',
    name: typeof entry.name === 'string' ? entry.name : '',
    priority: typeof entry.priority === 'number' ? entry.priority : 0,
    alwaysCopyToStaticServices: entry.alwaysCopyToStaticServices === true
  }
}
