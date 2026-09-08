import * as Sentry from '@sentry/tanstackstart-react'
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useTranslations } from 'gt-tanstack-start'
import {
  DownloadIcon,
  FilePlusIcon,
  FolderPlusIcon,
  HardDriveDownloadIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
  XIcon
} from 'lucide-react'
import { Fragment, useRef, useState } from 'react'
import { toast } from 'sonner'
import PageLayout from '@/components/pageLayout'
import NoAccess from '@/components/static/noAccess'
import { ConfirmDelete } from '@/components/templates/confirmDelete'
import { FileEditor } from '@/components/templates/fileEditor'
import { FileList } from '@/components/templates/fileList'
import { InstallVersion } from '@/components/templates/installVersion'
import { PromptDialog } from '@/components/templates/promptDialog'
import { StorageTree } from '@/components/templates/storageTree'
import {
  type UploadHandle,
  UploadZone
} from '@/components/templates/uploadZone'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { fileKind } from '@/lib/fileKind'
import { type TemplateSearch, templateSearchSchema } from '@/lib/templateSearch'
import { cn } from '@/lib/utils'
import { currentPermissions } from '@/server/auth'
import {
  storageList,
  storageTemplateList,
  templateCreate,
  templateDelete,
  templateDirectoryCreate,
  templateDirectoryList,
  templateDownload,
  templateFileDelete,
  templateFileRead,
  templateFileWrite,
  templateRename
} from '@/server/templates'

type Prompt =
  | { kind: 'file' }
  | { kind: 'folder' }
  | { kind: 'template' }
  | { kind: 'rename'; file: FileType }

type Confirm =
  | { kind: 'entry'; file: FileType }
  | { kind: 'template' }
  | { kind: 'selection' }

const requiredPermissions = [
  'cloudnet_rest:template_storage_read',
  'cloudnet_rest:template_storage_list',
  'global:admin'
]

// renaming a folder moves the open file with it, so the editor has to let go
const covers = (file: FileType, open: string | undefined) =>
  open === file.path || (file.directory && !!open?.startsWith(`${file.path}/`))

export const Route = createFileRoute(
  '/{-$locale}/_authed/dashboard/templates/'
)({
  validateSearch: templateSearchSchema,
  loaderDeps: ({ search }) => ({
    storage: search.storage,
    template: search.template,
    path: search.path,
    file: search.file
  }),
  loader: async ({ deps }) => {
    const permissions = await currentPermissions()
    const hasPermissions = requiredPermissions.some((permission) =>
      permissions.includes(permission)
    )

    const storages: Storages = hasPermissions
      ? await storageList().catch(() => ({ storages: [] }))
      : { storages: [] }

    // one storage is the common case; landing on an empty three-pane browser
    // and having to click the only option is pure friction
    const only = (storages.storages ?? []).filter(Boolean)
    if (!deps.storage && only.length === 1) {
      throw redirect({
        to: '.',
        search: (prev) => ({ ...prev, storage: only[0] })
      })
    }

    const templates: TemplatesList | null =
      hasPermissions && deps.storage
        ? await storageTemplateList({ data: { storage: deps.storage } }).catch(
            () => ({ templates: [] })
          )
        : null

    const template = deps.template ?? ''
    const slash = template.indexOf('/')

    const files: FileType[] =
      hasPermissions && deps.storage && slash > 0
        ? await templateDirectoryList({
            data: {
              storage: deps.storage,
              prefix: template.slice(0, slash),
              name: template.slice(slash + 1),
              directory: deps.path ?? ''
            }
          }).catch(() => [])
        : []

    const entry = deps.file
      ? (files.find((file) => file.path === deps.file) ?? null)
      : null

    const content =
      deps.storage &&
      entry &&
      !entry.directory &&
      fileKind(entry.name, entry.size) === 'text'
        ? await templateFileRead({
            data: {
              storage: deps.storage,
              prefix: template.slice(0, slash),
              name: template.slice(slash + 1),
              path: entry.path
            }
          }).catch(() => null)
        : null

    return {
      permissions,
      hasPermissions,
      storages,
      templates,
      files,
      entry,
      content
    }
  },
  component: TemplatesPage
})

function TemplatesPage() {
  const {
    permissions,
    hasPermissions,
    storages,
    templates,
    files,
    entry,
    content
  } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()
  const templatesT = useTranslations('Templates')
  const versionsT = useTranslations('Versions')
  const [selection, setSelection] = useState<string[]>([])
  const [installOpen, setInstallOpen] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [prompt, setPrompt] = useState<Prompt | null>(null)
  const [confirm, setConfirm] = useState<Confirm | null>(null)
  const [downloading, setDownloading] = useState(false)
  const uploadRef = useRef<UploadHandle>(null)

  // selection belongs to one directory; drop it as soon as the pane moves
  const scope = `${search.template ?? ''}#${search.path ?? ''}`
  const [selectionScope, setSelectionScope] = useState(scope)
  if (selectionScope !== scope) {
    setSelectionScope(scope)
    setSelection([])
  }

  const template = search.template ?? ''
  const slash = template.indexOf('/')
  const storage = search.storage ?? ''
  const prefix = template.slice(0, slash)
  const templateName = template.slice(slash + 1)
  const params = { storage, prefix, name: templateName }
  const selected = slash > 0

  // install wants a full ServiceTemplate, so carry over what the listing knows
  const listed = (templates?.templates ?? []).find(
    (entry) => entry.prefix === prefix && entry.name === templateName
  )
  const installTarget = {
    ...params,
    priority: listed?.priority ?? 0,
    alwaysCopyToStaticServices: listed?.alwaysCopyToStaticServices ?? false
  }

  const mayLeave = () => !dirty || window.confirm(templatesT('discardChanges'))

  const allows = (...scopes: string[]) =>
    permissions.includes('global:admin') ||
    scopes.some((permission) => permissions.includes(permission))

  const mayWriteFile = allows(
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_file_create'
  )
  const mayCreateDirectory = allows(
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_directory_create'
  )
  const mayCreateTemplate = allows(
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_create'
  )
  const mayDeleteEntry = allows(
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_delete_file'
  )
  const mayDeleteTemplate = allows(
    'cloudnet_rest:template_write',
    'cloudnet_rest:template_delete'
  )
  const mayDownload = allows(
    'cloudnet_rest:template_read',
    'cloudnet_rest:template_download'
  )
  const mayInstallVersion =
    allows(
      'cloudnet_rest:service_version_write',
      'cloudnet_rest:service_version_install'
    ) &&
    allows(
      'cloudnet_rest:service_version_read',
      'cloudnet_rest:service_version_list'
    )
  const mayRename =
    mayWriteFile &&
    mayDeleteEntry &&
    allows(
      'cloudnet_rest:template_read',
      'cloudnet_rest:template_file_download'
    )

  const closeFile = () =>
    navigate({ search: (previous) => ({ ...previous, file: undefined }) })

  const go = (next: Partial<TemplateSearch>) => {
    if (!mayLeave()) return
    navigate({ search: (previous) => ({ ...previous, ...next }) })
  }

  const storageIds = (storages.storages ?? [])
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b))
  const templateIds = [
    ...new Set(
      (templates?.templates ?? [])
        .filter((t) => t?.prefix && t?.name)
        .map((t) => `${t.prefix}/${t.name}`)
    )
  ].sort((a, b) => a.localeCompare(b))

  // storage ids carry no slash, so the first one splits storage from template
  const selectTree = (value: string) => {
    const cut = value.indexOf('/')
    if (cut < 0) {
      go({
        storage: value,
        template: undefined,
        path: undefined,
        file: undefined
      })
      return
    }
    go({
      storage: value.slice(0, cut),
      template: value.slice(cut + 1),
      path: '',
      file: undefined
    })
  }

  const segments = (search.path ?? '').split('/').filter(Boolean)
  const crumbs: {
    key: string
    label: string
    next: Partial<TemplateSearch>
  }[] = []
  if (storage) {
    crumbs.push({
      key: `storage:${storage}`,
      label: storage,
      next: { storage, template: undefined, path: undefined, file: undefined }
    })
  }
  if (selected) {
    crumbs.push({
      key: `template:${template}`,
      label: template,
      next: { path: '', file: undefined }
    })
  }
  segments.forEach((segment, index) => {
    const path = segments.slice(0, index + 1).join('/')
    crumbs.push({
      key: `path:${path}`,
      label: segment,
      next: { path, file: undefined }
    })
  })

  const create = async (kind: 'file' | 'folder', value: string) => {
    const path = [search.path, value].filter(Boolean).join('/')
    try {
      if (kind === 'folder') {
        await templateDirectoryCreate({ data: { ...params, path } })
      } else {
        await templateFileWrite({ data: { ...params, path, content: '' } })
      }
      router.invalidate()
    } catch (error) {
      Sentry.captureException(error)
      toast.error(templatesT('createFailed'))
    }
  }

  const createTemplate = async (value: string) => {
    const parts = value.split('/')
    if (parts.length !== 2 || parts[0] === '' || parts[1] === '') {
      toast.error(templatesT('invalidTemplateName'))
      return
    }
    try {
      await templateCreate({
        data: { storage, prefix: parts[0], name: parts[1] }
      })
      router.invalidate()
    } catch (error) {
      Sentry.captureException(error)
      toast.error(templatesT('createFailed'))
    }
  }

  const rename = async (file: FileType, value: string) => {
    if (value.includes('/')) {
      toast.error(templatesT('invalidFileName'))
      return
    }
    const next = [search.path, value].filter(Boolean).join('/')
    // copy-then-delete would delete the file it just wrote
    if (next === file.path) return
    // the copy overwrites whatever sits at the target, so a collision would
    // destroy the sibling instead of renaming onto a free name
    if (files.some((sibling) => sibling.path === next)) {
      toast.error(templatesT('renameExists', { name: value }))
      return
    }
    let result: Awaited<ReturnType<typeof templateRename>>
    try {
      result = await templateRename({
        data: { ...params, from: file.path, to: next }
      })
    } catch (error) {
      Sentry.captureException(error)
      toast.error(templatesT('renameFailed'))
      return
    }
    if (result.failed) {
      toast.error(templatesT('renameEntryFailed', { path: result.failed }))
      return
    }
    if (result.notRemoved.length > 0) {
      // the copy landed, so the user now has both paths and needs to know
      toast.error(
        templatesT('renameCopiedNotRemoved', {
          from: result.notRemoved.join(', '),
          to: next
        })
      )
    }
    if (covers(file, search.file)) closeFile()
    router.invalidate()
  }

  const submitPrompt = (value: string) => {
    const current = prompt
    setPrompt(null)
    if (!current) return
    if (current.kind === 'template') void createTemplate(value)
    else if (current.kind === 'rename') void rename(current.file, value)
    else void create(current.kind, value)
  }

  const deleteEntry = async (file: FileType) => {
    setConfirm(null)
    try {
      await templateFileDelete({ data: { ...params, path: file.path } })
    } catch (error) {
      Sentry.captureException(error)
      toast.error(templatesT('deleteFailed', { files: file.path }))
      return
    }
    if (search.file === file.path) closeFile()
    router.invalidate()
  }

  const deleteSelection = async () => {
    setConfirm(null)
    const failed: string[] = []
    for (const path of selection) {
      try {
        await templateFileDelete({ data: { ...params, path } })
      } catch (error) {
        Sentry.captureException(error)
        failed.push(path)
      }
    }
    if (failed.length > 0) {
      toast.error(templatesT('deleteFailed', { files: failed.join(', ') }))
    }
    if (search.file && selection.includes(search.file)) closeFile()
    setSelection([])
    router.invalidate()
  }

  const removeTemplate = async () => {
    setConfirm(null)
    try {
      await templateDelete({ data: params })
    } catch (error) {
      Sentry.captureException(error)
      toast.error(templatesT('deleteFailed', { files: template }))
      return
    }
    navigate({
      search: (previous) => ({
        ...previous,
        template: undefined,
        path: undefined,
        file: undefined
      })
    })
    router.invalidate()
  }

  const downloadTemplate = async () => {
    setDownloading(true)
    try {
      const base64 = await templateDownload({ data: params })
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes]))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${templateName}.zip`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      Sentry.captureException(error)
      toast.error(templatesT('downloadFailed'))
    } finally {
      setDownloading(false)
    }
  }

  const promptTitle = (current: Prompt) => {
    if (current.kind === 'file') return templatesT('newFile')
    if (current.kind === 'folder') return templatesT('newFolder')
    if (current.kind === 'template') return templatesT('newTemplate')
    return templatesT('rename')
  }

  if (!hasPermissions) {
    return (
      <PageLayout title={templatesT('title')}>
        <NoAccess />
      </PageLayout>
    )
  }

  return (
    <PageLayout title={templatesT('title')}>
      {storage && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {mayWriteFile && selected && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPrompt({ kind: 'file' })}
            >
              <FilePlusIcon className="mr-2 size-4" />
              {templatesT('newFile')}
            </Button>
          )}
          {mayCreateDirectory && selected && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPrompt({ kind: 'folder' })}
            >
              <FolderPlusIcon className="mr-2 size-4" />
              {templatesT('newFolder')}
            </Button>
          )}
          {mayWriteFile && selected && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => uploadRef.current?.open()}
            >
              <UploadIcon className="mr-2 size-4" />
              {templatesT('upload')}
            </Button>
          )}
          {mayCreateTemplate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPrompt({ kind: 'template' })}
            >
              <PlusIcon className="mr-2 size-4" />
              {templatesT('newTemplate')}
            </Button>
          )}
          {mayDownload && selected && (
            <Button
              size="sm"
              variant="outline"
              onClick={downloadTemplate}
              disabled={downloading}
            >
              <DownloadIcon className="mr-2 size-4" />
              {templatesT('downloadTemplate')}
            </Button>
          )}
          {mayInstallVersion && selected && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setInstallOpen(true)}
            >
              <HardDriveDownloadIcon className="mr-2 size-4" />
              {versionsT('installVersion')}
            </Button>
          )}
          {mayDeleteTemplate && selected && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                if (!mayLeave()) return
                setConfirm({ kind: 'template' })
              }}
            >
              <Trash2Icon className="mr-2 size-4" />
              {templatesT('deleteTemplate')}
            </Button>
          )}
          {selection.length > 0 && (
            <>
              <Separator orientation="vertical" className="h-6" />
              <span className="text-sm text-muted-foreground tabular-nums">
                {templatesT('selectedCount', { count: selection.length })}
              </span>
              {mayDeleteEntry && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    if (
                      search.file &&
                      selection.includes(search.file) &&
                      !mayLeave()
                    ) {
                      return
                    }
                    setConfirm({ kind: 'selection' })
                  }}
                >
                  <Trash2Icon className="mr-2 size-4" />
                  {templatesT('deleteSelected')}
                </Button>
              )}
            </>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-browser gap-4 md:h-browser">
        <div className="hidden lg:block border rounded-lg overflow-auto">
          <StorageTree
            storages={storages}
            templates={templates}
            search={search}
            onSelect={go}
          />
        </div>
        <div className="flex flex-col gap-2 min-w-0 min-h-0">
          <Select
            value={selected ? `${storage}/${template}` : storage}
            onValueChange={selectTree}
          >
            <SelectTrigger
              className="lg:hidden"
              aria-label={templatesT('storages')}
            >
              <SelectValue placeholder={templatesT('selectTemplate')} />
            </SelectTrigger>
            <SelectContent>
              {storageIds.map((id) => (
                <Fragment key={id}>
                  <SelectItem
                    value={id}
                    className="text-xs uppercase tracking-wide text-muted-foreground"
                  >
                    {id}
                  </SelectItem>
                  {id === storage &&
                    templateIds.map((entry) => (
                      <SelectItem
                        key={entry}
                        value={`${id}/${entry}`}
                        className="pl-12 font-mono"
                      >
                        {entry}
                      </SelectItem>
                    ))}
                </Fragment>
              ))}
            </SelectContent>
          </Select>
          {crumbs.length > 0 && (
            <Breadcrumb className="md:hidden">
              <BreadcrumbList className="font-mono">
                {crumbs.map((crumb, index) => (
                  <Fragment key={crumb.key}>
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {index === crumbs.length - 1 ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <button
                            type="button"
                            onClick={() => go(crumb.next)}
                            className="cursor-pointer"
                          >
                            {crumb.label}
                          </button>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
          <div className="border rounded-lg overflow-auto flex-1 min-h-0">
            {storage && selected && (
              <UploadZone
                ref={uploadRef}
                storage={storage}
                prefix={prefix}
                name={templateName}
                directory={search.path ?? ''}
                onComplete={() => router.invalidate()}
              >
                <FileList
                  files={files}
                  path={search.path ?? ''}
                  selection={selection}
                  onSelectionChange={setSelection}
                  onNavigate={(path) => go({ path, file: undefined })}
                  onOpen={(file) => go({ file: file.path })}
                  actions={
                    mayRename || mayDeleteEntry
                      ? (file) => (
                          <div className="flex justify-end gap-1">
                            {mayRename &&
                              (!file.directory || mayCreateDirectory) && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="px-2"
                                  aria-label={`${templatesT('rename')} ${file.name}`}
                                  onClick={() => {
                                    if (
                                      covers(file, search.file) &&
                                      !mayLeave()
                                    ) {
                                      return
                                    }
                                    setPrompt({ kind: 'rename', file })
                                  }}
                                >
                                  <PencilIcon className="size-4" />
                                </Button>
                              )}
                            {mayDeleteEntry && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="px-2"
                                aria-label={`${templatesT('deleteFile')} ${file.name}`}
                                onClick={() => {
                                  if (
                                    file.path === search.file &&
                                    !mayLeave()
                                  ) {
                                    return
                                  }
                                  setConfirm({ kind: 'entry', file })
                                }}
                              >
                                <Trash2Icon className="size-4" />
                              </Button>
                            )}
                          </div>
                        )
                      : undefined
                  }
                />
              </UploadZone>
            )}
            {!(storage && selected) && (
              <p className="text-sm text-muted-foreground text-center px-4 py-8">
                {templatesT('selectTemplate')}
              </p>
            )}
          </div>
        </div>
        {/* below md the editor is a full-screen overlay over the list */}
        <div
          className={cn(
            'flex-col md:static md:z-auto md:flex md:border md:rounded-lg md:bg-transparent',
            search.file ? 'fixed inset-0 z-50 flex bg-background' : 'hidden'
          )}
        >
          {search.file && (
            <div className="md:hidden flex items-center gap-2 border-b px-3 py-2">
              <span className="font-mono text-sm truncate">{search.file}</span>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto px-2"
                onClick={() => {
                  if (!mayLeave()) return
                  closeFile()
                }}
              >
                <XIcon className="size-4" />
                <span className="sr-only">{templatesT('close')}</span>
              </Button>
            </div>
          )}
          <div className="min-h-0 flex-1 overflow-auto">
            {storage && selected && (
              <FileEditor
                file={entry}
                content={content}
                storage={storage}
                prefix={prefix}
                name={templateName}
                onDirtyChange={setDirty}
                onSaved={() => router.invalidate()}
              />
            )}
            {!(storage && selected) && (
              <p className="text-sm text-muted-foreground text-center px-4 py-8">
                {templatesT('noFileSelected')}
              </p>
            )}
          </div>
        </div>
      </div>
      {prompt && (
        <PromptDialog
          open={true}
          title={promptTitle(prompt)}
          description={
            prompt.kind === 'rename' && prompt.file.directory
              ? templatesT('renameFolderWarning')
              : undefined
          }
          label={
            prompt.kind === 'template'
              ? templatesT('template')
              : templatesT('name')
          }
          defaultValue={prompt.kind === 'rename' ? prompt.file.name : undefined}
          confirmLabel={
            prompt.kind === 'rename'
              ? templatesT('rename')
              : templatesT('create')
          }
          onSubmit={submitPrompt}
          onCancel={() => setPrompt(null)}
        />
      )}
      {installOpen && selected && (
        <InstallVersion
          open={true}
          template={installTarget}
          onCancel={() => setInstallOpen(false)}
          onInstalled={() => {
            setInstallOpen(false)
            router.invalidate()
          }}
        />
      )}
      {confirm && (
        <ConfirmDelete
          open={true}
          name={
            confirm.kind === 'template'
              ? template
              : confirm.kind === 'selection'
                ? templatesT('selectedCount', { count: selection.length })
                : confirm.file.path
          }
          requireTyping={confirm.kind === 'template'}
          confirmLabel={
            confirm.kind === 'template'
              ? templatesT('deleteTemplate')
              : confirm.kind === 'selection'
                ? templatesT('deleteSelected')
                : templatesT('deleteFile')
          }
          onConfirm={() => {
            if (confirm.kind === 'template') void removeTemplate()
            else if (confirm.kind === 'selection') void deleteSelection()
            else void deleteEntry(confirm.file)
          }}
          onCancel={() => setConfirm(null)}
        />
      )}
    </PageLayout>
  )
}
