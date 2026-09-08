import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

// jsdom has no ResizeObserver; cmdk's list uses one to size itself
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock)

const navigate = vi.fn()
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate
}))
vi.mock('gt-tanstack-start', () => ({
  useTranslations: () => (key: string) => key
}))
vi.mock('@/server/search', () => ({
  paletteIndex: async () => ({
    // ids deliberately differ from labels: an assertion on the label would
    // pass even if the route param read the wrong field.
    items: [
      {
        type: 'service',
        id: '5f2c8f10-2f2b-4f7a-9a1d-7c9b1e0a3d44',
        label: 'Lobby-1',
        sublabel: 'node-1'
      },
      { type: 'task', id: 'task-7b21', label: 'Lobby' },
      { type: 'group', id: 'group-c93e', label: 'Survival' },
      { type: 'node', id: 'node-4a08', label: 'Node-2' }
    ],
    canCreateService: true
  })
}))

import { CommandPalette } from '../components/commandPalette'

describe('CommandPalette', () => {
  test('is closed until the ⌘K chord is pressed', async () => {
    render(<CommandPalette />)
    expect(screen.queryByRole('dialog')).toBeNull()

    fireEvent.keyDown(window, { key: 'k', metaKey: true })
    await waitFor(() => expect(screen.getByRole('dialog')).toBeInTheDocument())
  })

  test('lists items returned by the index', async () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    await waitFor(() => expect(screen.getByText('Lobby-1')).toBeInTheDocument())
    expect(screen.getByText('Lobby')).toBeInTheDocument()
  })

  test('navigates a service item to its route and closes', async () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    await waitFor(() => expect(screen.getByText('Lobby-1')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Lobby-1'))
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/{-$locale}/dashboard/services/$serviceId',
        params: { serviceId: '5f2c8f10-2f2b-4f7a-9a1d-7c9b1e0a3d44' }
      })
    )
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  test('navigates a task item to its route', async () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    await waitFor(() => expect(screen.getByText('Lobby')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Lobby'))
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/{-$locale}/dashboard/tasks/$taskId',
        params: { taskId: 'task-7b21' }
      })
    )
  })

  test('navigates a group item to its route', async () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    await waitFor(() =>
      expect(screen.getByText('Survival')).toBeInTheDocument()
    )

    fireEvent.click(screen.getByText('Survival'))
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/{-$locale}/dashboard/groups/$groupId',
        params: { groupId: 'group-c93e' }
      })
    )
  })

  test('navigates a node item to its route', async () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    await waitFor(() => expect(screen.getByText('Node-2')).toBeInTheDocument())

    fireEvent.click(screen.getByText('Node-2'))
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/{-$locale}/dashboard/nodes/$nodeId',
        params: { nodeId: 'node-4a08' }
      })
    )
  })

  test('navigates the create-service verb to the create route', async () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    await waitFor(() =>
      expect(screen.getByText('createService')).toBeInTheDocument()
    )
    fireEvent.click(screen.getByText('createService'))
    await waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({
        to: '/{-$locale}/dashboard/services/create'
      })
    )
  })

  test('filters by label and by sublabel', async () => {
    render(<CommandPalette />)
    fireEvent.keyDown(window, { key: 'k', ctrlKey: true })
    await waitFor(() => expect(screen.getByText('Lobby-1')).toBeInTheDocument())

    const input = screen.getByRole('combobox')

    fireEvent.change(input, { target: { value: 'Survival' } })
    await waitFor(() =>
      expect(screen.getByText('Survival')).toBeInTheDocument()
    )
    expect(screen.queryByText('Node-2')).toBeNull()

    fireEvent.change(input, { target: { value: 'node-1' } })
    await waitFor(() => expect(screen.getByText('Lobby-1')).toBeInTheDocument())
    expect(screen.queryByText('Survival')).toBeNull()
  })
})
