import * as Sentry from '@sentry/tanstackstart-react'
import { useTranslations } from 'gt-tanstack-start'
import {
  forwardRef,
  type ReactNode,
  useImperativeHandle,
  useRef,
  useState
} from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { fileKind } from '@/lib/fileKind'
import {
  templateDeploy,
  templateDirectoryCreate,
  templateFileWrite
} from '@/server/templates'

type Upload = { path: string; file: File }

// btoa wants a binary string, and spreading the whole array blows the argument limit
function toBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return btoa(binary)
}

// readEntries hands out at most 100 entries per call and [] once exhausted
async function readAll(reader: FileSystemDirectoryReader) {
  const entries: FileSystemEntry[] = []
  for (;;) {
    const batch = await new Promise<FileSystemEntry[]>((resolve, reject) =>
      reader.readEntries(resolve, reject)
    )
    if (batch.length === 0) return entries
    entries.push(...batch)
  }
}

async function walk(
  entry: FileSystemEntry,
  base: string,
  directories: string[],
  uploads: Upload[]
) {
  const path = base ? `${base}/${entry.name}` : entry.name
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) =>
      (entry as FileSystemFileEntry).file(resolve, reject)
    )
    uploads.push({ path, file })
    return
  }
  // parent before children, so the create calls run in depth order
  directories.push(path)
  const children = await readAll(
    (entry as FileSystemDirectoryEntry).createReader()
  )
  for (const child of children) await walk(child, path, directories, uploads)
}

export type UploadHandle = { open: () => void }

export const UploadZone = forwardRef<
  UploadHandle,
  {
    storage: string
    prefix: string
    name: string
    directory: string
    onComplete: () => void
    children: ReactNode
  }
>(function UploadZone(
  { storage, prefix, name, directory, onComplete, children },
  ref
) {
  const templatesT = useTranslations('Templates')
  const [dragging, setDragging] = useState(false)
  const [progress, setProgress] = useState<{
    done: number
    total: number
  } | null>(null)
  const [zip, setZip] = useState<File | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useImperativeHandle(
    ref,
    () => ({ open: () => inputRef.current?.click() }),
    []
  )

  const target = (path: string) => [directory, path].filter(Boolean).join('/')

  const write = async ({ path, file }: Upload) => {
    if (fileKind(file.name, file.size) === 'text') {
      await templateFileWrite({
        data: {
          storage,
          prefix,
          name,
          path: target(path),
          content: await file.text()
        }
      })
      return
    }
    await templateFileWrite({
      data: {
        storage,
        prefix,
        name,
        path: target(path),
        content: toBase64(await file.arrayBuffer()),
        encoding: 'base64'
      }
    })
  }

  const run = async (directories: string[], uploads: Upload[]) => {
    const failed: string[] = []
    let changed = false
    let done = 0
    setProgress({ done, total: uploads.length })

    for (const path of directories) {
      try {
        await templateDirectoryCreate({
          data: { storage, prefix, name, path: target(path) }
        })
        changed = true
      } catch (error) {
        Sentry.captureException(error)
        failed.push(path)
      }
    }

    for (const upload of uploads) {
      try {
        await write(upload)
        changed = true
      } catch (error) {
        Sentry.captureException(error)
        failed.push(upload.path)
      }
      done += 1
      setProgress({ done, total: uploads.length })
    }

    setProgress(null)
    if (failed.length > 0) {
      toast.error(templatesT('uploadFailed', { files: failed.join(', ') }))
    }
    if (changed) {
      if (failed.length === 0) toast.success(templatesT('uploaded'))
      onComplete()
    }
  }

  const extract = async () => {
    if (!zip) return
    const file = zip
    setZip(null)
    setProgress({ done: 0, total: 1 })
    try {
      await templateDeploy({
        data: { storage, prefix, name, zip: toBase64(await file.arrayBuffer()) }
      })
      toast.success(templatesT('uploaded'))
      onComplete()
    } catch (error) {
      Sentry.captureException(error)
      toast.error(templatesT('uploadFailed', { files: file.name }))
    } finally {
      setProgress(null)
    }
  }

  const asFile = async () => {
    if (!zip) return
    const file = zip
    setZip(null)
    await run([], [{ path: file.name, file }])
  }

  const onPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? [])
    // so picking the same file again still fires a change
    event.target.value = ''
    if (files.length === 0 || progress) return

    if (files.length === 1 && files[0].name.toLowerCase().endsWith('.zip')) {
      setZip(files[0])
      return
    }
    void run(
      [],
      files.map((file) => ({ path: file.name, file }))
    )
  }

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setDragging(false)
    if (progress) return

    // webkitGetAsEntry has to run before the handler yields; the items go stale after
    const entries = Array.from(event.dataTransfer.items)
      .map((item) => item.webkitGetAsEntry())
      .filter((entry): entry is FileSystemEntry => entry !== null)
    if (entries.length === 0) return

    void (async () => {
      const directories: string[] = []
      const uploads: Upload[] = []
      for (const entry of entries) await walk(entry, '', directories, uploads)

      if (
        directories.length === 0 &&
        uploads.length === 1 &&
        uploads[0].file.name.toLowerCase().endsWith('.zip')
      ) {
        setZip(uploads[0].file)
        return
      }
      await run(directories, uploads)
    })()
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: drop target only - drag events have no keyboard equivalent; the toolbar's upload button is the keyboard path
    <div
      className="relative h-full"
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setDragging(false)
        }
      }}
      onDrop={onDrop}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={onPick}
      />
      {progress && (
        <p className="border-b px-3 py-1.5 text-xs text-muted-foreground tabular-nums">
          {templatesT('uploading', {
            done: progress.done,
            total: progress.total
          })}
        </p>
      )}
      {children}
      {dragging && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-accent-bar bg-background/80 text-sm font-medium">
          {templatesT('dropHere')}
        </div>
      )}
      <Dialog
        open={zip !== null}
        onOpenChange={(open) => {
          if (!open) setZip(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{templatesT('zipQuestion')}</DialogTitle>
            <DialogDescription className="font-mono break-all">
              {zip?.name}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setZip(null)}>
              {templatesT('cancel')}
            </Button>
            <Button variant="outline" onClick={asFile}>
              {templatesT('zipAsFile')}
            </Button>
            <Button onClick={extract}>{templatesT('zipExtract')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
})
