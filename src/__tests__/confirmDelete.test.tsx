import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, test, vi } from 'vitest'

vi.mock('gt-tanstack-start', () => ({
  useTranslations: () => (key: string) => key
}))

import { ConfirmDelete } from '../components/templates/confirmDelete'

const NAME = 'Lobby/default'

function setup(overrides: Record<string, unknown> = {}) {
  const onConfirm = vi.fn()
  render(
    <ConfirmDelete
      open={true}
      name={NAME}
      requireTyping={true}
      confirmLabel="deleteTemplate"
      onConfirm={onConfirm}
      onCancel={() => {}}
      {...overrides}
    />
  )
  return {
    onConfirm,
    button: screen.getByRole('button', { name: 'deleteTemplate' })
  }
}

describe('ConfirmDelete', () => {
  test('stays disabled while the name has not been typed', () => {
    const { onConfirm, button } = setup()
    expect(button).toBeDisabled()
    fireEvent.click(button)
    expect(onConfirm).not.toHaveBeenCalled()
  })

  test('rejects near misses', () => {
    const { onConfirm, button } = setup()
    const input = screen.getByRole('textbox')

    for (const typed of ['Lobby/defaul', 'Lobby/default ', 'lobby/default']) {
      fireEvent.change(input, { target: { value: typed } })
      expect(button).toBeDisabled()
      fireEvent.click(button)
      expect(onConfirm).not.toHaveBeenCalled()
    }
  })

  test('confirms on an exact match', () => {
    const { onConfirm, button } = setup()
    fireEvent.change(screen.getByRole('textbox'), { target: { value: NAME } })
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  test('confirms straight away without the typing gate', () => {
    const { onConfirm, button } = setup({ requireTyping: false })
    expect(screen.queryByRole('textbox')).toBeNull()
    expect(button).toBeEnabled()
    fireEvent.click(button)
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })
})
