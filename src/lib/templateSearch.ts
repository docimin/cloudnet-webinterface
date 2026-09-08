import { z } from 'zod'

export const templateSearchSchema = z.object({
  storage: z.string().optional(),
  template: z.string().optional(),
  path: z.string().optional(),
  file: z.string().optional()
})

export type TemplateSearch = z.infer<typeof templateSearchSchema>
