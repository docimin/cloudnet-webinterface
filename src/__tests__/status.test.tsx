import { render, screen } from '@testing-library/react'
import { describe, expect, test } from 'vitest'
import { type Status, StatusIndicator } from '../components/status'

const ALL: Status[] = ['running', 'starting', 'stopped', 'error', 'draining']

describe('StatusIndicator', () => {
  test('exposes the status to assistive tech via its label', () => {
    render(<StatusIndicator status="running" label="Running" />)
    expect(screen.getByRole('img', { name: 'Running' })).toBeInTheDocument()
  })

  test('every status renders a visually distinct shape, not just a colour', () => {
    const classNames = ALL.map((status) => {
      const { container, unmount } = render(
        <StatusIndicator status={status} label={status} />
      )
      const mark = container.querySelector('[data-status]') as HTMLElement
      const className = mark.className
      unmount()
      return className
    })
    expect(new Set(classNames).size).toBe(ALL.length)
  })

  test('carries the status as a data attribute for styling', () => {
    const { container } = render(
      <StatusIndicator status="draining" label="Draining" />
    )
    expect(container.querySelector('[data-status="draining"]')).toBeTruthy()
  })

  test('hides the text label unless asked for it', () => {
    const { rerender } = render(
      <StatusIndicator status="stopped" label="Stopped" />
    )
    expect(screen.queryByText('Stopped')).toBeNull()
    rerender(<StatusIndicator status="stopped" label="Stopped" showLabel />)
    expect(screen.getByText('Stopped')).toBeInTheDocument()
  })
})
