'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
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
import { serviceFilesApi } from '@/lib/client-api'
import SaveAsTemplateDialog from '@/components/blueprint/saveAsTemplateDialog'
import { formatBytes } from '@/components/formatBytes'
import { formatDate } from '@/components/formatDate'
import { toast } from 'sonner'
import {
  FolderIcon,
  FileIcon,
  UploadIcon,
  DownloadIcon,
  Trash2Icon,
  PencilIcon,
  FolderPlusIcon,
  FilePlusIcon,
  HomeIcon,
  ChevronRightIcon,
  RefreshCwIcon
} from 'lucide-react'

type Entry = {
  name: string
  path: string
  directory: boolean
  size: number
  lastModified: number
}

const TEXT_EXTS = new Set([
  '.txt', '.log', '.yml', '.yaml', '.json', '.toml', '.properties', '.conf', '.cfg',
  '.ini', '.md', '.sh', '.env', '.xml', '.js', '.ts', '.tsx', '.jsx', '.py', '.java',
  '.html', '.css', '.gitignore', '.gitattributes'
])
const looksTextual = (name: string) => {
  const lower = name.toLowerCase()
  if (lower === 'eula.txt' || lower === 'ops.json') return true
  const dot = lower.lastIndexOf('.')
  const ext = dot >= 0 ? lower.slice(dot) : lower
  return TEXT_EXTS.has(ext)
}

export default function ServiceFileBrowser({ serviceId }: { serviceId: string }) {
  const [dir, setDir] = useState('')
  const [items, setItems] = useState<Entry[]>([])
  const [busy, setBusy] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const load = useCallback(async (showToast = false) => {
    setBusy(true)
    try {
      const res: any = await serviceFilesApi.list(serviceId, dir)
      const raw = res?.data ?? res
      const arr: Entry[] = Array.isArray(raw?.files) ? raw.files : []
      arr.sort((a, b) => (a.directory !== b.directory ? (a.directory ? -1 : 1) : a.name.localeCompare(b.name)))
      setItems(arr)
      if (showToast) toast.success('Refreshed')
    } catch (e: any) {
      toast.error(`List failed: ${e.message}`)
    } finally {
      setBusy(false)
    }
  }, [serviceId, dir])

  useEffect(() => { load() }, [load])

  const enter = (name: string) => setDir(dir ? `${dir}/${name}` : name)
  const goTo = (path: string) => setDir(path)
  const segments = dir ? dir.split('/') : []

  const doUpload = async (files: FileList | File[]) => {
    const list = Array.from(files)
    if (!list.length) return
    setProgress({ done: 0, total: list.length })
    let ok = 0
    for (let i = 0; i < list.length; i++) {
      const f = list[i]
      const rel = (f as any).webkitRelativePath || f.name
      const target = dir ? `${dir}/${rel}` : rel
      try {
        const res = await serviceFilesApi.uploadFile(serviceId, target, f)
        if (res.status >= 400) throw new Error(`HTTP ${res.status}`)
        ok++
      } catch (e: any) {
        toast.error(`${f.name}: ${e.message}`)
      }
      setProgress({ done: i + 1, total: list.length })
    }
    setProgress(null)
    if (ok) toast.success(`Uploaded ${ok}/${list.length}`)
    await load()
  }

  const del = async (e: Entry) => {
    try {
      const res: any = e.directory
        ? await serviceFilesApi.deleteDirectory(serviceId, e.path)
        : await serviceFilesApi.deleteFile(serviceId, e.path)
      if ((res.status ?? 0) >= 400) throw new Error(`HTTP ${res.status}`)
      toast.success(`Deleted ${e.name}`)
      await load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const rename = async (from: string, toName: string) => {
    const parent = from.includes('/') ? from.slice(0, from.lastIndexOf('/')) : ''
    const target = parent ? `${parent}/${toName}` : toName
    try {
      const res: any = await serviceFilesApi.rename(serviceId, from, target)
      if ((res.status ?? 0) >= 400) throw new Error(`HTTP ${res.status}`)
      toast.success(`Renamed to ${toName}`)
      await load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const mkdir = async (name: string) => {
    const target = dir ? `${dir}/${name}` : name
    try {
      const res: any = await serviceFilesApi.createDirectory(serviceId, target)
      if ((res.status ?? 0) >= 400) throw new Error(`HTTP ${res.status}`)
      toast.success(`Created folder ${name}`)
      await load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  const mkfile = async (name: string) => {
    const target = dir ? `${dir}/${name}` : name
    try {
      const res: any = await serviceFilesApi.updateText(serviceId, target, '')
      if ((res.status ?? 0) >= 400) throw new Error(`HTTP ${res.status}`)
      toast.success(`Created ${name}`)
      await load()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pt-4">
        <div className="flex items-center gap-1 flex-wrap text-sm">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => goTo('')}
            title="Root"
          >
            <HomeIcon className="h-4 w-4" />
          </Button>
          {segments.map((seg, i) => (
            <span key={i} className="flex items-center gap-1">
              <ChevronRightIcon className="h-3 w-3 text-muted-foreground" />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => goTo(segments.slice(0, i + 1).join('/'))}
              >
                {seg}
              </Button>
            </span>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="ml-1"
            onClick={() => load(true)}
            title="Refresh"
          >
            <RefreshCwIcon className={`h-4 w-4 ${busy ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            ref={fileInput}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && doUpload(e.target.files)}
          />
          <Button variant="outline" onClick={() => fileInput.current?.click()}>
            <UploadIcon className="h-4 w-4 mr-2" /> Upload
          </Button>
          <MkdirButton onCreate={mkdir} />
          <MkfileButton onCreate={mkfile} />
          <SaveAsTemplateDialog serviceId={serviceId} />
        </div>
      </div>

      {progress && (
        <div className="text-sm text-muted-foreground">
          Uploading {progress.done}/{progress.total}…
        </div>
      )}

      <div
        onDrop={(e) => { e.preventDefault(); setDragActive(false); if (e.dataTransfer?.files) doUpload(e.dataTransfer.files) }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true) }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false) }}
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
            {items.map((e) => (
              <TableRow key={e.path}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {e.directory ? (
                      <FolderIcon className="h-5 w-5 text-primary" />
                    ) : (
                      <FileIcon className="h-5 w-5 text-muted-foreground" />
                    )}
                    {e.directory ? (
                      <button
                        className="text-left hover:underline"
                        onClick={() => enter(e.name)}
                      >
                        {e.name}
                      </button>
                    ) : (
                      <span>{e.name}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>{e.directory ? '-' : formatBytes(e.size)}</TableCell>
                <TableCell>{formatDate(new Date(e.lastModified))}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1">
                    {!e.directory && looksTextual(e.name) && (
                      <EditFileButton serviceId={serviceId} filePath={e.path} onSaved={load} />
                    )}
                    {!e.directory && (
                      <a href={serviceFilesApi.downloadUrl(serviceId, e.path)} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="icon" title="Download">
                          <DownloadIcon className="h-4 w-4" />
                        </Button>
                      </a>
                    )}
                    <RenameButton entry={e} onRename={rename} />
                    <DeleteRowButton entry={e} onDelete={() => del(e)} />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Empty
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function MkdirButton({ onCreate }: { onCreate: (n: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><FolderPlusIcon className="h-4 w-4 mr-2" /> New folder</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create folder</DialogTitle></DialogHeader>
        <div className="grid gap-2"><Label htmlFor="d">Name</Label><Input id="d" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { if (name) { onCreate(name); setName(''); setOpen(false) } }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function MkfileButton({ onCreate }: { onCreate: (n: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline"><FilePlusIcon className="h-4 w-4 mr-2" /> New file</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Create file</DialogTitle></DialogHeader>
        <div className="grid gap-2"><Label htmlFor="f">Name</Label><Input id="f" value={name} onChange={(e) => setName(e.target.value)} placeholder="config.yml" /></div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { if (name) { onCreate(name); setName(''); setOpen(false) } }}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RenameButton({ entry, onRename }: { entry: Entry; onRename: (from: string, to: string) => void }) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(entry.name)
  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setName(entry.name) }}>
      <DialogTrigger asChild><Button variant="ghost" size="icon" title="Rename"><PencilIcon className="h-4 w-4" /></Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Rename {entry.directory ? 'folder' : 'file'}</DialogTitle></DialogHeader>
        <div className="grid gap-2"><Label htmlFor="rn">New name</Label><Input id="rn" value={name} onChange={(e) => setName(e.target.value)} /></div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => { onRename(entry.path, name); setOpen(false) }}>Rename</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function DeleteRowButton({ entry, onDelete }: { entry: Entry; onDelete: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild><Button variant="ghost" size="icon" title="Delete"><Trash2Icon className="h-4 w-4" /></Button></AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {entry.directory ? 'folder' : 'file'} {entry.name}?</AlertDialogTitle>
          <AlertDialogDescription>This affects the running service immediately.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

function EditFileButton({ serviceId, filePath, onSaved }: { serviceId: string; filePath: string; onSaved: () => void }) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const openEditor = async () => {
    setLoading(true)
    setOpen(true)
    try {
      const res = await serviceFilesApi.getText(serviceId, filePath)
      if (res.status >= 400) {
        toast.error(`Cannot open: HTTP ${res.status}`)
        setOpen(false)
      } else {
        setContent(res.text)
      }
    } catch (e: any) {
      toast.error(e.message)
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      const res: any = await serviceFilesApi.updateText(serviceId, filePath, content)
      if ((res.status ?? 0) >= 400) throw new Error(`HTTP ${res.status}`)
      toast.success('Saved')
      setOpen(false)
      onSaved()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Button variant="ghost" size="icon" title="Edit" onClick={openEditor}>
        <PencilIcon className="h-4 w-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{filePath}</DialogTitle>
          </DialogHeader>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading…</div>
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="font-mono text-xs h-[60vh]"
              spellCheck={false}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving || loading}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
