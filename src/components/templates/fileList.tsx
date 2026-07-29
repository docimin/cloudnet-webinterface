import { useTranslations } from 'gt-tanstack-start'
import { type ReactNode, useMemo } from 'react'
import { formatBytes } from '@/components/formatBytes'
import { formatDate } from '@/components/formatDate'
import TableEmpty from '@/components/tableEmpty'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { fileKind } from '@/lib/fileKind'
import { cn } from '@/lib/utils'

export function FileList({
  files,
  path,
  selection,
  onSelectionChange,
  onNavigate,
  onOpen,
  actions
}: {
  files: FileType[]
  path: string
  selection: string[]
  onSelectionChange: (paths: string[]) => void
  onNavigate: (path: string) => void
  onOpen: (file: FileType) => void
  actions?: (file: FileType) => ReactNode
}) {
  const templatesT = useTranslations('Templates')

  const sorted = useMemo(
    () =>
      [...files].sort((a, b) =>
        a.directory === b.directory
          ? (a.name ?? '').localeCompare(b.name ?? '')
          : a.directory
            ? -1
            : 1
      ),
    [files]
  )

  const toggle = (file: FileType, checked: boolean) =>
    onSelectionChange(
      checked
        ? [...selection, file.path]
        : selection.filter((entry) => entry !== file.path)
    )

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="w-8">
            <span className="sr-only">{templatesT('select')}</span>
          </TableHead>
          <TableHead className="w-full">{templatesT('name')}</TableHead>
          <TableHead className="text-right">{templatesT('size')}</TableHead>
          <TableHead className="text-right">{templatesT('modified')}</TableHead>
          {actions && (
            <TableHead className="text-right">
              <span className="sr-only">{templatesT('actions')}</span>
            </TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {path !== '' && (
          <TableRow
            className="cursor-pointer"
            onClick={() => onNavigate(path.split('/').slice(0, -1).join('/'))}
          >
            <TableCell />
            <TableCell className="font-mono">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  onNavigate(path.split('/').slice(0, -1).join('/'))
                }}
                className="hover:underline focus-visible:underline"
              >
                {templatesT('parentDirectory')}
              </button>
            </TableCell>
            <TableCell />
            <TableCell />
            {actions && <TableCell />}
          </TableRow>
        )}
        {sorted.length === 0 && (
          <TableEmpty
            colSpan={actions ? 5 : 4}
            title={templatesT('emptyDirectory')}
            description={templatesT('emptyDirectoryDescription')}
          />
        )}
        {sorted.map((file) => (
          <TableRow
            key={file.path}
            className="cursor-pointer"
            data-state={selection.includes(file.path) ? 'selected' : undefined}
            onClick={() => {
              if (file.directory) onNavigate(file.path)
              else onOpen(file)
            }}
          >
            <TableCell onClick={(event) => event.stopPropagation()}>
              <Checkbox
                aria-label={file.name}
                checked={selection.includes(file.path)}
                onCheckedChange={(checked) => toggle(file, checked === true)}
              />
            </TableCell>
            <TableCell
              className={cn(
                'font-mono',
                !file.directory &&
                  fileKind(file.name, file.size) !== 'text' &&
                  'text-muted-foreground'
              )}
            >
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  if (file.directory) onNavigate(file.path)
                  else onOpen(file)
                }}
                className="hover:underline focus-visible:underline"
              >
                {file.name}
              </button>
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums">
              {file.directory ? '' : formatBytes(file.size)}
            </TableCell>
            <TableCell className="text-right font-mono tabular-nums text-muted-foreground">
              {formatDate(new Date(file.lastModified))}
            </TableCell>
            {actions && (
              <TableCell
                className="text-right"
                onClick={(event) => event.stopPropagation()}
              >
                {actions(file)}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
