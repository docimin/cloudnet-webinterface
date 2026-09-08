import { describe, expect, test } from 'vitest'
import { ApiError, stepFailed } from '../server/cloudnet'

describe('stepFailed', () => {
  test('carries the node message so the dialog can name the failing call', () => {
    expect(
      stepFailed('deployResources', new ApiError(404, 'no such service'))
    ).toEqual({
      ok: false,
      step: 'deployResources',
      message: 'no such service'
    })
  })

  test('survives a rejection that is not an Error', () => {
    expect(stepFailed('createTask', 'boom').message).toBe('boom')
  })
})
