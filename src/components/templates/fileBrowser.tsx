'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { useCallback, useEffect, useRef, useState } from 'react'
import { formatBytes } from '@/components/formatBytes'
import { formatDate } from '@/components/formatDate'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { templateStorageApi } from '@/lib/client-api'
import { toast } from 'sonner'
import {
  FileIcon,
  FolderIcon,
  Trash2Icon,
  DownloadIcon,
  UploadIcon,
  FolderPlusIcon,
  PencilIcon,
  ArchiveIcon,
  FilePlusIcon
} from 'lucide-react'

type FileType = {
  name: string
  path: string
  directory: boolean
  size: number
  lastModified: number
}

export default function FileBrowser({
  params
}: {
  params: {
    storageId: string
    storagePrefix: string
    templateId: string
    fileId?: string[]
  }
}) {
  const [files, setFiles] = useState<FileType[]>([])
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const router = useRouter()
  const pathname = usePathname()
  const inputRef = useRef<HTMLInputElement>(null)
  const zipInputRef = useRef<HTMLInputElement>(null)

  const fileId = params.fileId || []
  const currentDir = fileId.join('/')

  const load = useCallback(async () => {
    const res = await templateStorageApi.getTemplateFiles(
      params.storageId,
      params.storagePrefix,
      params.templateId,
      fileId
    )
    const raw: any = res?.data
    const filesArray: FileType[] = Array.isArray(raw)
      ? raw
      : Array.isArray(raw?.files)
        ? raw.files
        : []
    const sorted = filesArray.sort((a, b) => {
      if (a.directory !== b.directory) return a.directory ? -1 : 1
      return a.name.localeCompare(b.name)
    })
    const filtered = sorted.filter((f) => {
      const depth = f.path.split('/').length
      const baseDepth = currentDir ? currentDir.split('/').length : 0
      return depth === baseDepth + 1
    })
    setFiles(filtered)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.storageId, params.storagePrefix, params.templateId, currentDir])

  useEffect(() => {
    load()
  }, [load])

  const doUpload = async (fileList: FileList | File[]) => {
    const list = Array.from(fileList)
    if (list.length === 0) return
    setUploading(true)
    setProgress({ done: 0, total: list.length })
    let success = 0
    for (let i = 0; i < list.length; i++) {
      const f = list[i]
      const relPath = (f as any).webkitRelativePath || f.name
      const target = currentDir ? `${currentDir}/${relPath}` : relPath
      try {
        const res = await templateStorageApi.uploadFile(
          params.storageId,
          params.storagePrefix,
          params.templateId,
          target,
          f
        )
        if (res.status >= 400) throw new Error(`HTTP ${res.status}`)
        success++
      } catch (e: any) {
        toast.error(`Upload failed for ${f.name}: ${e.message}`)
      }
      setProgress({ done: i + 1, total: list.length })
    }
    setUploading(false)
    setProgress(null)
    if (success > 0) toast.success(`Uploaded ${success}/${list.length} file(s)`)
    await load()
    router.refresh()
  }

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer?.files) await doUpload(e.dataTransfer.files)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDelete = async (name: string) => {
    const filePath = [...fileId, name]
    await templateStorageApi.deleteFile(
      params.storageId,
      params.storagePrefix,
      params.templateId,
      filePath
    )
    toast.success(`Deleted ${name}`)
    await load()
    router.refresh()
  }

  const handleRename = async (item: FileType, newName: string) => {
    if (!newName || newName === item.name) return
    const from = item.path
    const to = currentDir ? `${currentDir}/${newName}` : newName
    const res = await templateStorageApi.rename(
      params.storageId,
      params.storagePrefix,
      params.templateId,
      from,
      to,
      item.directory
    )
    if (res.status === 204) {
      toast.success(`Renamed to ${newName}`)
      await load()
      router.refresh()
    } else {
      toast.error(`Rename failed`)
    }
  }

  const handleMkdir = async (name: string) => {
    if (!name) return
    const path = currentDir ? `${currentDir}/${name}` : name
    const res = await templateStorageApi.createDirectory(
      params.storageId,
      params.storagePrefix,
      params.templateId,
      path
    )
    if (res.status && res.status >= 400) {
      toast.error(`mkdir failed (${res.status})`)
    } else {
      toast.success(`Created folder ${name}`)
      await load()
      router.refresh()
    }
  }

  const handleDeleteTemplate = async () => {
    const res = await templateStorageApi.deleteTemplate(
      params.storageId,
      params.storagePrefix,
      params.templateId
    )
    if (res.status && res.status >= 400) {
      toast.error(`Delete failed (${res.status})`)
    } else {
      toast.success(`Template deleted`)
      router.push(`/dashboard/templates/${params.storageId}/${params.storagePrefix}`)
    }
  }

  const handleDeployZip = async (file: File) => {
    setUploading(true)
    try {
      const res = await templateStorageApi.deployZip(
        params.storageId,
        params.storagePrefix,
        params.templateId,
        file
      )
      if (res.status >= 400) throw new Error(`HTTP ${res.status}`)
      toast.success(`Deployed zip`)
      await load()
      router.refresh()
    } catch (e: any) {
      toast.error(`Deploy failed: ${e.message}`)
    } finally {
      setUploading(false)
    }
  }

  const downloadFileUrl = (name: string) => {
    const p = currentDir ? `${currentDir}/${name}` : name
    return templateStorageApi.downloadFileUrl(
      params.storageId,
      params.storagePrefix,
      params.templateId,
      p
    )
  }

  const downloadTemplateUrl = templateStorageApi.downloadTemplateUrl(
    params.storageId,
    params.storagePrefix,
    params.templateId
  )

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">
          Path: /{currentDir || ''}
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            ref={inputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && doUpload(e.target.files)}
          />
          <input
            ref={zipInputRef}
            type="file"
            accept=".zip,application/zip"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleDeployZip(e.target.files[0])}
          />
          <Button variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
            <UploadIcon className="h-4 w-4 mr-2" /> Upload files
          </Button>
          <NewFolderButton onCreate={handleMkdir} />
          <NewFileButton
            storageId={params.storageId}
            prefixId={params.storagePrefix}
            templateId={params.templateId}
            currentDir={currentDir}
            onCreated={load}
          />
          <Button variant="outline" onClick={() => zipInputRef.current?.click()} disabled={uploading}>
            <ArchiveIcon className="h-4 w-4 mr-2" /> Deploy zip
          </Button>
          <a href={downloadTemplateUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <DownloadIcon className="h-4 w-4 mr-2" /> Download zip
            </Button>
          </a>
          <DeleteTemplateButton onConfirm={handleDeleteTemplate} />
        </div>
      </div>

      {progress && (
        <div className="text-sm text-muted-foreground">
          Uploading {progress.done}/{progress.total}…
        </div>
      )}

      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`border rounded-lg overflow-hidden transition-colors ${dragActive ? 'border-primary bg-primary/5' : ''}`}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Modified</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FolderIcon className="h-5 w-5 text-primary" />
                  <Link href={'.'}>
                    <span>..</span>
                  </Link>
                </div>
              </TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
            </TableRow>
            {files.map((file) => {
              const newPath = `${pathname}/${file.name}`
              return (
                <TableRow key={file.path}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {file.directory ? (
                        <FolderIcon className="h-5 w-5 text-primary" />
                      ) : (
                        <FileIcon className="h-5 w-5 text-muted-foreground" />
                      )}
                      {file.directory ? (
                        <Link href={newPath as any}>
                          <span>{file.name}</span>
                        </Link>
                      ) : (
                        <Link href={newPath as any}>
                          <span>{file.name}</span>
                        </Link>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{file.directory ? '-' : formatBytes(file.size)}</TableCell>
                  <TableCell>{formatDate(new Date(file.lastModified))}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {!file.directory && (
                        <a href={downloadFileUrl(file.name)} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" title="Download">
                            <DownloadIcon className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <RenameButton item={file} onRename={handleRename} />
                      <DeleteRowButton
                        name={file.name}
                        isDirectory={file.directory}
                        onConfirm={() => handleDelete(file.name)}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
        {dragActive && (
          <div className="p-4 text-center text-sm text-muted-foreground border-t">
            Drop files to upload into /{currentDir || ''}
          </div>
        )}
      </div>
    </div>
  )
}

function NewFolderButton({ onCreate }: { onCreate: (name: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FolderPlusIcon className="h-4 w-4 mr-2" /> New folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create folder</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="mkdir-name">Folder name</Label>
          <Input id="mkdir-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="plugins" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onCreate(name)
              setName('')
              setOpen(false)
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NewFileButton({
  storageId,
  prefixId,
  templateId,
  currentDir,
  onCreated
}: {
  storageId: string
  prefixId: string
  templateId: string
  currentDir: string
  onCreated: () => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const router = useRouter()
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FilePlusIcon className="h-4 w-4 mr-2" /> New file
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create empty file</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="mkfile-name">File name</Label>
          <Input id="mkfile-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="config.yml" />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button
            disabled={busy || !name}
            onClick={async () => {
              setBusy(true)
              const target = currentDir ? `${currentDir}/${name}` : name
              const blob = new Blob([''], { type: 'text/plain' })
              const res = await templateStorageApi.uploadFile(
                storageId,
                prefixId,
                templateId,
                target,
                blob
              )
              setBusy(false)
              if (res.status >= 400) {
                toast.error(`Failed (${res.status})`)
              } else {
                toast.success(`Created ${name}`)
                setName('')
                setOpen(false)
                onCreated()
                router.refresh()
              }
            }}
          >
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RenameButton({
  item,
  onRename
}: {
  item: FileType
  onRename: (item: FileType, newName: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(item.name)
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setName(item.name) }}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Rename">
          <PencilIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename {item.directory ? 'folder' : 'file'}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="rn-name">New name</Label>
          <Input id="rn-name" value={name} onChange={(e) => setName(e.target.value)} />
          {item.directory && (
            <p className="text-xs text-muted-foreground">
              Note: renaming a folder copies every file inside then deletes the old — may be slow for large folders.
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={() => {
              onRename(item, name)
              setOpen(false)
            }}
          >
            Rename
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteRowButton({
  name,
  isDirectory,
  onConfirm
}: {
  name: string
  isDirectory: boolean
  onConfirm: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Delete">
          <Trash2Icon className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {isDirectory ? 'folder' : 'file'} {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function DeleteTemplateButton({ onConfirm }: { onConfirm: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash2Icon className="h-4 w-4 mr-2" /> Delete template
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this template?</AlertDialogTitle>
          <AlertDialogDescription>
            This deletes the whole template folder and all files. Cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
