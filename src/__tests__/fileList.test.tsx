import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('gt-tanstack-start', () => ({
  useTranslations: () => (key: string) => key
}))

import { FileList } from '../components/templates/fileList'

const modified = new Date(2024, 0, 15, 13, 45).getTime()
const files: FileType[] = [
  {
    path: 'alpha.txt',
    name: 'alpha.txt',
    directory: false,
    hidden: false,
    creationTime: modified,
    lastModified: modified,
    lastAccess: modified,
    size: 2048
  },
  {
    path: 'zeta',
    name: 'zeta',
    directory: true,
    hidden: false,
    creationTime: modified,
    lastModified: modified,
    lastAccess: modified,
    size: 0
  }
]

const noop = () => {}

function renderList(overrides: Partial<Parameters<typeof FileList>[0]> = {}) {
  const props = {
    files,
    path: '',
    selection: [] as string[],
    onSelectionChange: noop as (paths: string[]) => void,
    onNavigate: noop as (path: string) => void,
    onOpen: noop as (file: FileType) => void,
    ...overrides
  }
  return render(<FileList {...props} />)
}

const cellsOf = (text: string) => {
  const row = screen.getByText(text).closest('tr') as HTMLTableRowElement
  return Array.from(row.querySelectorAll('td'))
}

const bodyRows = () =>
  Array.from(document.querySelectorAll('tbody tr')) as HTMLTableRowElement[]

describe('FileList', () => {
  test('sorts directories before files', () => {
    renderList()
    const names = bodyRows().map(
      (row) => row.querySelectorAll('td')[1].textContent
    )
    expect(names).toEqual(['zeta', 'alpha.txt'])
  })

  test('formats the size of a file', () => {
    renderList()
    expect(cellsOf('alpha.txt')[2].textContent).toBe('2 KB')
  })

  test('leaves the size of a directory empty', () => {
    renderList()
    expect(cellsOf('zeta')[2].textContent).toBe('')
  })

  test('formats the modified date', () => {
    renderList()
    expect(cellsOf('alpha.txt')[3].textContent).toBe('15.01.2024 @ 13:45')
  })

  test('opens files and navigates directories', () => {
    const onOpen = vi.fn()
    const onNavigate = vi.fn()
    renderList({ onOpen, onNavigate })

    fireEvent.click(screen.getByText('alpha.txt'))
    expect(onOpen).toHaveBeenCalledTimes(1)
    expect(onOpen).toHaveBeenCalledWith(files[0])
    expect(onNavigate).not.toHaveBeenCalled()

    fireEvent.click(screen.getByText('zeta'))
    expect(onNavigate).toHaveBeenCalledTimes(1)
    expect(onNavigate).toHaveBeenCalledWith('zeta')
    expect(onOpen).toHaveBeenCalledTimes(1)
  })

  test('shows a parent row only below the root', () => {
    const onNavigate = vi.fn()
    const { rerender, unmount } = renderList({ path: '', onNavigate })
    expect(screen.queryByText('parentDirectory')).toBeNull()

    rerender(
      <FileList
        files={files}
        path="plugins/nested"
        selection={[]}
        onSelectionChange={noop}
        onNavigate={onNavigate}
        onOpen={noop}
      />
    )
    fireEvent.click(screen.getByText('parentDirectory'))
    expect(onNavigate).toHaveBeenCalledWith('plugins')

    unmount()
    renderList({ path: 'plugins', onNavigate })
    fireEvent.click(screen.getByText('parentDirectory'))
    expect(onNavigate).toHaveBeenLastCalledWith('')
  })

  test('toggles selection through the checkboxes', () => {
    const onSelectionChange = vi.fn()
    const { rerender } = renderList({ onSelectionChange })

    fireEvent.click(screen.getByRole('checkbox', { name: 'alpha.txt' }))
    expect(onSelectionChange).toHaveBeenCalledWith(['alpha.txt'])

    rerender(
      <FileList
        files={files}
        path=""
        selection={['alpha.txt']}
        onSelectionChange={onSelectionChange}
        onNavigate={noop}
        onOpen={noop}
      />
    )
    fireEvent.click(screen.getByRole('checkbox', { name: 'zeta' }))
    expect(onSelectionChange).toHaveBeenCalledWith(['alpha.txt', 'zeta'])

    fireEvent.click(screen.getByRole('checkbox', { name: 'alpha.txt' }))
    expect(onSelectionChange).toHaveBeenLastCalledWith([])
  })
})
