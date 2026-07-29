import * as Sentry from '@sentry/tanstackstart-react'
import { useTranslations } from 'gt-tanstack-start'
import { DownloadIcon, SaveIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatBytes } from '@/components/formatBytes'
import { formatDate } from '@/components/formatDate'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { EDITOR_MAX_BYTES, fileKind, language } from '@/lib/fileKind'
import { templateFileDownload, templateFileWrite } from '@/server/templates'

export function FileEditor({
  file,
  content,
  storage,
  prefix,
  name,
  onDirtyChange,
  onSaved
}: {
  file: FileType | null
  content: string | null
  storage: string
  prefix: string
  name: string
  onDirtyChange: (dirty: boolean) => void
  onSaved: () => void
}) {
  const templatesT = useTranslations('Templates')
  const [value, setValue] = useState(content ?? '')
  const [saving, setSaving] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // a different file, or the same one reloaded, replaces the buffer wholesale
  const seed = `${file?.path ?? ''}\u0000${content ?? ''}`
  const [seeded, setSeeded] = useState(seed)
  if (seeded !== seed) {
    setSeeded(seed)
    setValue(content ?? '')
  }

  const dirty = value !== (content ?? '')

  useEffect(() => {
    onDirtyChange(dirty)
    return () => onDirtyChange(false)
  }, [dirty, onDirtyChange])

  const save = async () => {
    if (!file) return
    setSaving(true)
    try {
      await templateFileWrite({
        data: { storage, prefix, name, path: file.path, content: value }
      })
      toast.success(templatesT('saved'))
      onSaved()
    } catch (error) {
      Sentry.captureException(error)
      toast.error(templatesT('saveFailed'))
    } finally {
      setSaving(false)
    }
  }

  const download = async () => {
    if (!file) return
    setDownloading(true)
    try {
      const base64 = await templateFileDownload({
        data: { storage, prefix, name, path: file.path }
      })
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
      const url = URL.createObjectURL(new Blob([bytes]))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = file.name
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      Sentry.captureException(error)
      toast.error(templatesT('downloadFailed'))
    } finally {
      setDownloading(false)
    }
  }

  if (!file) {
    return (
      <p className="text-sm text-muted-foreground text-center px-4 py-8">
        {templatesT('noFileSelected')}
      </p>
    )
  }

  const kind = fileKind(file.name, file.size)

  if (kind !== 'text') {
    return (
      <div className="p-4 space-y-3">
        <p className="font-mono text-sm break-all">{file.name}</p>
        <div className="text-sm text-muted-foreground space-y-1">
          <p className="font-mono tabular-nums">{formatBytes(file.size)}</p>
          <p className="font-mono tabular-nums">
            {formatDate(new Date(file.lastModified))}
          </p>
          <p>{templatesT('binaryFile')}</p>
          {kind === 'too-large' && (
            <p>
              {templatesT('tooLarge', { limit: formatBytes(EDITOR_MAX_BYTES) })}
            </p>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={download}
          disabled={downloading}
        >
          <DownloadIcon className="mr-2 size-4" />
          {templatesT('download')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <span className="font-mono text-sm truncate">{file.name}</span>
        <Badge variant="outline" className="text-muted-foreground">
          {language(file.name)}
        </Badge>
        {dirty && (
          <span className="text-xs text-status-starting">
            {templatesT('unsaved')}
          </span>
        )}
        <Button
          size="sm"
          className="ml-auto"
          onClick={save}
          disabled={saving || !dirty}
        >
          <SaveIcon className="mr-2 size-4" />
          {templatesT('save')}
        </Button>
      </div>
      <Textarea
        aria-label={file.name}
        className="font-mono rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
        rows={24}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </div>
  )
}
