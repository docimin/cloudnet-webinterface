'use client'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { getTemplateFiles } from '@/utils/actions/templates/getTemplateFiles'
import { FileType } from '@/utils/types/templates'
import { formatBytes } from '@/components/formatBytes'
import { formatDate } from '@/components/formatDate'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'

export default function FileBrowser({
  params,
  permissions,
}: {
  params: {
    storageId: string
    storagePrefix: string
    templateId: string
    fileId: string[]
  }
  permissions: string[]
}) {
  const [files, setFiles] = useState<FileType[]>([])
  const router = useRouter()
  const pathname = usePathname()

  const fetchFiles = async () => {
    return await getTemplateFiles(
      params.storageId,
      params.storagePrefix,
      params.templateId,
      params.fileId
    )
  }

  useEffect(() => {
    fetchFiles().then((fetchedFiles) => {
      const sortedFiles = fetchedFiles.files.sort((a, b) => {
        // Put directories at the top
        if (a.directory !== b.directory) {
          return a.directory ? -1 : 1
        }
        // Sort alphabetically
        return a.name.localeCompare(b.name)
      })

      // Filter out files that are in a subdirectory deeper than the first level, but not directories themselves
      const filteredFiles = sortedFiles.filter((file) => {
        const pathParts = file.path.split('/')
        return !(pathParts.length > 2 && !file.directory)
      })

      setFiles(filteredFiles)
    })
  }, [])

  return (
    <div className="flex w-full flex-col">
      <main className="flex-1">
        <div className="grid gap-6">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Modified</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => {
                  // Append the file name to the current path
                  const newPath = `${pathname}/${file.name}`

                  return (
                    <TableRow key={file.path}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {file.directory ? (
                            <FolderIcon className="h-5 w-5 text-primary" />
                          ) : (
                            <FileIcon className="h-5 w-5 text-gray-500" />
                          )}
                          <Link href={newPath}>
                            <span>{file.name}</span>
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell>
                        {file.directory ? '-' : `${formatBytes(file.size)}`}
                      </TableCell>
                      <TableCell>
                        {formatDate(new Date(file.lastModified))}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <DeleteIcon className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Trash2Icon className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  )
}

function DeleteIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
      <line x1="18" x2="12" y1="9" y2="15" />
      <line x1="12" x2="18" y1="9" y2="15" />
    </svg>
  )
}

function FileIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  )
}

function FolderIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" />
    </svg>
  )
}

function Trash2Icon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  )
}