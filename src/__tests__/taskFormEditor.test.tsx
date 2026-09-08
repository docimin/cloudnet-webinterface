import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'
import TaskFormEditor from '../components/editors/taskFormEditor'
import type { Task } from '../utils/types/tasks'

// jsdom has no ResizeObserver; Radix's hover card measures its trigger with one
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverMock)

vi.mock('gt-tanstack-start', () => ({
  useTranslations: () => (key: string) => key
}))
vi.mock('@tanstack/react-router', () => ({
  useRouter: () => ({ invalidate: vi.fn() })
}))
vi.mock('@/server/task', () => ({ taskUpdate: vi.fn() }))

const task = {
  name: 'Lobby',
  runtime: 'jvm',
  nameSplitter: '-',
  startPort: 25565,
  minServiceCount: 1,
  groups: ['Global-Server'],
  templates: [],
  deployments: [],
  includes: [],
  processConfiguration: {
    environment: 'MINECRAFT_SERVER',
    maxHeapMemorySize: 512,
    jvmOptions: [],
    processParameters: [],
    environmentVariables: {}
  }
} as unknown as Task

describe('TaskFormEditor', () => {
  test('fills the form from the task document', () => {
    render(
      <TaskFormEditor
        task={task}
        environments={[{ name: 'MINECRAFT_SERVER' }]}
        canEdit
      />
    )

    expect(screen.getByDisplayValue('jvm')).toBeInTheDocument()
    expect(screen.getByDisplayValue('25565')).toBeInTheDocument()
    expect(screen.getByText('Global-Server')).toBeInTheDocument()
  })

  test('the JSON tab shows the whole document, unmodelled keys included', () => {
    const withExtra = { ...task, hostAddress: '127.0.0.1' } as unknown as Task
    render(
      <TaskFormEditor
        task={withExtra}
        environments={[{ name: 'MINECRAFT_SERVER' }]}
        canEdit
      />
    )

    // Radix tabs switch on mousedown, not click
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'jsonTab' }))

    const raw = screen.getByLabelText('rawLabel') as HTMLTextAreaElement
    expect(JSON.parse(raw.value)).toMatchObject({
      name: 'Lobby',
      hostAddress: '127.0.0.1'
    })
  })
})
