import { useTranslations } from 'gt-tanstack-start'
import type { TemplateSearch } from '@/lib/templateSearch'
import { cn } from '@/lib/utils'

export function StorageTree({
  storages,
  templates,
  search,
  onSelect
}: {
  storages: Storages
  templates: TemplatesList | null
  search: TemplateSearch
  onSelect: (next: Partial<TemplateSearch>) => void
}) {
  const templatesT = useTranslations('Templates')

  const storageIds = (storages.storages ?? [])
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))

  // CloudNet can report the same template once per node
  const templateIds = [
    ...new Set(
      (templates?.templates ?? [])
        .filter((t) => t?.prefix && t?.name)
        .map((t) => `${t.prefix}/${t.name}`)
    )
  ].sort((a, b) => a.localeCompare(b))

  if (storageIds.length === 0) {
    return (
      <p className="text-sm text-muted-foreground px-2 py-4">
        {templatesT('noStorages')}
      </p>
    )
  }

  return (
    <nav aria-label={templatesT('storages')} className="py-2">
      {storageIds.map((storage) => (
        <div key={storage}>
          <button
            type="button"
            onClick={() =>
              onSelect({
                storage,
                template: undefined,
                path: undefined,
                file: undefined
              })
            }
            className="w-full text-left text-xs uppercase tracking-wide text-muted-foreground px-2 py-1 hover:text-foreground"
          >
            {storage}
          </button>
          {storage === search.storage &&
            (templateIds.length === 0 ? (
              <p className="text-sm text-muted-foreground px-2 py-4">
                {templatesT('noTemplates')}
              </p>
            ) : (
              templateIds.map((template) => (
                <button
                  key={template}
                  type="button"
                  onClick={() =>
                    onSelect({ storage, template, path: '', file: undefined })
                  }
                  className={cn(
                    'w-full text-left font-mono text-sm px-2 py-1 border-l-2 border-l-transparent transition-colors hover:bg-muted/50',
                    template === search.template &&
                      'border-l-accent-bar bg-muted/50'
                  )}
                >
                  {template}
                </button>
              ))
            ))}
        </div>
      ))}
    </nav>
  )
}
