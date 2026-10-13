import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { AppearanceSettings } from '../components/appearance/appearanceSettings'
import { ACCENT_STYLE_ID, type Overrides } from '../lib/appearance'

vi.mock('gt-tanstack-start', () => ({
  useTranslations: () => (key: string) => key
}))
const setTheme = vi.fn()
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'light', setTheme, resolvedTheme: 'light' })
}))
const toastError = vi.fn()
vi.mock('sonner', () => ({
  toast: { error: (...args: unknown[]) => toastError(...args) }
}))
vi.mock('@sentry/tanstackstart-react', () => ({ captureException: vi.fn() }))

const root = document.documentElement
const ATTRIBUTES = ['data-palette', 'data-accent', 'data-radius', 'data-status']

function deferred() {
  let resolve!: (value: unknown) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

function Twice({
  user,
  save
}: {
  user: Overrides
  save: (next: Overrides) => Promise<unknown>
}) {
  return (
    <>
      <AppearanceSettings host={{}} user={user} save={save} reset={vi.fn()} />
      <AppearanceSettings host={{}} user={user} save={save} reset={vi.fn()} />
    </>
  )
}

beforeEach(() => {
  document.head.innerHTML = `<style id="${ACCENT_STYLE_ID}"></style>`
  for (const name of ATTRIBUTES) root.removeAttribute(name)
  toastError.mockClear()
})

describe('AppearanceSettings', () => {
  test('choosing a palette restyles the page and saves the choice', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    render(
      <AppearanceSettings host={{}} user={{}} save={save} reset={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Nord' }))
    expect(root.getAttribute('data-palette')).toBe('nord')
    await waitFor(() => expect(save).toHaveBeenCalledWith({ palette: 'nord' }))
  })

  test('choosing the instance default drops the override', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    render(
      <AppearanceSettings
        host={{ radius: 'large' }}
        user={{ radius: 'small' }}
        save={save}
        reset={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'radiusLarge' }))
    expect(root.getAttribute('data-radius')).toBe('large')
    await waitFor(() => expect(save).toHaveBeenCalledWith({}))
  })

  test('the instance default is marked', () => {
    render(
      <AppearanceSettings
        host={{ radius: 'large' }}
        user={{}}
        save={vi.fn()}
        reset={vi.fn()}
      />
    )
    expect(
      screen.getByRole('button', { name: 'radiusLarge' })
    ).toHaveTextContent('instanceDefault')
  })

  test('the instance default marker is announced with the option', () => {
    render(
      <AppearanceSettings
        host={{ radius: 'large' }}
        user={{}}
        save={vi.fn()}
        reset={vi.fn()}
      />
    )
    expect(
      screen.getByRole('button', { name: 'radiusLarge' })
    ).toHaveAccessibleDescription('instanceDefault')
    expect(
      screen.getByRole('button', { name: 'radiusSmall' })
    ).not.toHaveAccessibleDescription()
  })

  test('choosing what is already selected saves nothing', () => {
    const save = vi.fn().mockResolvedValue(undefined)
    render(
      <AppearanceSettings
        host={{}}
        user={{ palette: 'nord' }}
        save={save}
        reset={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Nord' }))
    fireEvent.click(screen.getByRole('button', { name: 'radiusMedium' }))
    expect(save).not.toHaveBeenCalled()
    expect(toastError).not.toHaveBeenCalled()
  })

  test('an invalid hex can not be applied', () => {
    const save = vi.fn()
    render(
      <AppearanceSettings host={{}} user={{}} save={save} reset={vi.fn()} />
    )
    fireEvent.change(screen.getByLabelText('customHex'), {
      target: { value: '#12' }
    })
    expect(screen.getByText('hexInvalid')).toBeInTheDocument()
    expect(screen.getByLabelText('customHex')).toBeInvalid()
    expect(screen.getByLabelText('customHex')).toHaveAccessibleDescription(
      'hexInvalid'
    )
    expect(screen.getByRole('button', { name: 'useColour' })).toBeDisabled()
    expect(save).not.toHaveBeenCalled()
    expect(root.hasAttribute('data-accent')).toBe(false)
  })

  test('a custom colour becomes a computed stylesheet', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    render(
      <AppearanceSettings host={{}} user={{}} save={save} reset={vi.fn()} />
    )
    fireEvent.change(screen.getByLabelText('customHex'), {
      target: { value: '#FF5500' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'useColour' }))
    expect(root.getAttribute('data-accent')).toBe('custom')
    expect(document.getElementById(ACCENT_STYLE_ID)?.textContent).toContain(
      '--primary'
    )
    await waitFor(() =>
      expect(save).toHaveBeenCalledWith({ accent: '#ff5500' })
    )
  })

  test('a failed save puts the previous look back', async () => {
    const save = vi.fn().mockRejectedValue(new Error('offline'))
    render(
      <AppearanceSettings
        host={{ palette: 'gruvbox' }}
        user={{}}
        save={save}
        reset={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Nord' }))
    await waitFor(() => expect(toastError).toHaveBeenCalledWith('saveFailed'))
    expect(root.getAttribute('data-palette')).toBe('gruvbox')
  })

  test('an older failed save does not undo a newer one that succeeded', async () => {
    const first = deferred()
    const second = deferred()
    const save = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    render(
      <AppearanceSettings host={{}} user={{}} save={save} reset={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Nord' }))
    fireEvent.click(screen.getByRole('button', { name: 'radiusLarge' }))
    expect(save).toHaveBeenLastCalledWith({ palette: 'nord', radius: 'large' })

    first.reject(new Error('offline'))
    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1))
    expect(root.getAttribute('data-palette')).toBe('nord')
    expect(root.getAttribute('data-radius')).toBe('large')

    second.resolve(undefined)
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Nord' })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    )
    expect(screen.getByRole('button', { name: 'radiusLarge' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(root.getAttribute('data-palette')).toBe('nord')
    expect(root.getAttribute('data-radius')).toBe('large')
    expect(toastError).toHaveBeenCalledTimes(1)
  })

  test('when overlapping saves all fail the confirmed look comes back', async () => {
    const first = deferred()
    const second = deferred()
    const save = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
    render(
      <AppearanceSettings
        host={{}}
        user={{ palette: 'gruvbox' }}
        save={save}
        reset={vi.fn()}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Nord' }))
    fireEvent.click(screen.getByRole('button', { name: 'radiusLarge' }))

    first.reject(new Error('offline'))
    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1))
    expect(root.getAttribute('data-palette')).toBe('nord')
    expect(root.getAttribute('data-radius')).toBe('large')

    second.reject(new Error('offline'))
    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(2))
    expect(root.getAttribute('data-palette')).toBe('gruvbox')
    expect(root.hasAttribute('data-radius')).toBe(false)
    expect(screen.getByRole('button', { name: 'Gruvbox' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
  })

  test('a save that resolves late does not rewind the confirmed look', async () => {
    const first = deferred()
    const second = deferred()
    const save = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockReturnValueOnce(second.promise)
      .mockRejectedValueOnce(new Error('offline'))
    render(
      <AppearanceSettings host={{}} user={{}} save={save} reset={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Nord' }))
    fireEvent.click(screen.getByRole('button', { name: 'radiusLarge' }))
    second.resolve(undefined)
    first.resolve(undefined)
    await Promise.all([first.promise, second.promise])

    fireEvent.click(screen.getByRole('button', { name: 'Gruvbox' }))
    await waitFor(() => expect(toastError).toHaveBeenCalledTimes(1))
    expect(root.getAttribute('data-palette')).toBe('nord')
    expect(root.getAttribute('data-radius')).toBe('large')
  })

  test('reset puts the hex field back on the instance accent', async () => {
    const reset = vi.fn().mockResolvedValue(undefined)
    render(
      <AppearanceSettings
        host={{ accent: '#112233' }}
        user={{ accent: '#ff5500' }}
        save={vi.fn()}
        reset={reset}
      />
    )
    fireEvent.change(screen.getByLabelText('customHex'), {
      target: { value: '#00ff00' }
    })
    fireEvent.click(screen.getByRole('button', { name: 'reset' }))
    await waitFor(() =>
      expect(screen.getByLabelText('customHex')).toHaveValue('#112233')
    )
  })

  test('reset falls back to the default hex when the accent is not a hex', async () => {
    const reset = vi.fn().mockResolvedValue(undefined)
    render(
      <AppearanceSettings
        host={{ accent: 'teal' }}
        user={{ accent: '#ff5500' }}
        save={vi.fn()}
        reset={reset}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'reset' }))
    await waitFor(() =>
      expect(screen.getByLabelText('customHex')).toHaveValue('#3b82f6')
    )
  })

  test('a failed reset leaves the hex field alone', async () => {
    const reset = vi.fn().mockRejectedValue(new Error('offline'))
    render(
      <AppearanceSettings
        host={{}}
        user={{ accent: '#ff5500' }}
        save={vi.fn()}
        reset={reset}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'reset' }))
    await waitFor(() => expect(toastError).toHaveBeenCalled())
    expect(screen.getByLabelText('customHex')).toHaveValue('#ff5500')
  })

  test('reset drops every personal choice', async () => {
    const reset = vi.fn().mockResolvedValue(undefined)
    root.setAttribute('data-palette', 'nord')
    render(
      <AppearanceSettings
        host={{}}
        user={{ palette: 'nord' }}
        save={vi.fn()}
        reset={reset}
      />
    )
    fireEvent.click(screen.getByRole('button', { name: 'reset' }))
    expect(root.hasAttribute('data-palette')).toBe(false)
    await waitFor(() => expect(reset).toHaveBeenCalled())
  })

  test('a save in one instance is kept by a choice in the other', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(<Twice user={{}} save={save} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'Nord' })[0])
    await waitFor(() => expect(save).toHaveBeenCalledWith({ palette: 'nord' }))

    rerender(<Twice user={{ palette: 'nord' }} save={save} />)
    fireEvent.click(screen.getAllByRole('button', { name: 'radiusLarge' })[1])
    expect(save).toHaveBeenLastCalledWith({ palette: 'nord', radius: 'large' })
  })

  test('a loader update does not overwrite a choice still being saved', async () => {
    const pending = deferred()
    const save = vi.fn().mockReturnValueOnce(pending.promise)
    const { rerender } = render(
      <AppearanceSettings host={{}} user={{}} save={save} reset={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Nord' }))

    rerender(
      <AppearanceSettings
        host={{}}
        user={{ radius: 'small' }}
        save={save}
        reset={vi.fn()}
      />
    )
    expect(screen.getByRole('button', { name: 'Nord' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: 'radiusSmall' })).toHaveAttribute(
      'aria-pressed',
      'false'
    )

    pending.resolve(undefined)
    await waitFor(() => expect(save).toHaveBeenCalledTimes(1))
  })

  test('a new user object with the same content changes nothing', async () => {
    const save = vi.fn().mockResolvedValue(undefined)
    const { rerender } = render(
      <AppearanceSettings host={{}} user={{}} save={save} reset={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'Nord' }))
    await waitFor(() => expect(save).toHaveBeenCalledWith({ palette: 'nord' }))

    rerender(
      <AppearanceSettings host={{}} user={{}} save={save} reset={vi.fn()} />
    )
    expect(screen.getByRole('button', { name: 'Nord' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    fireEvent.click(screen.getByRole('button', { name: 'radiusLarge' }))
    expect(save).toHaveBeenLastCalledWith({ palette: 'nord', radius: 'large' })
  })

  test('mode buttons switch the theme', () => {
    render(
      <AppearanceSettings host={{}} user={{}} save={vi.fn()} reset={vi.fn()} />
    )
    fireEvent.click(screen.getByRole('button', { name: 'themeDark' }))
    expect(setTheme).toHaveBeenCalledWith('dark')
  })
})
