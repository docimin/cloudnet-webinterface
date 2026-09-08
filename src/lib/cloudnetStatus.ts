import type { Status } from '@/components/status'
import type { Lifecycle } from '@/utils/types/modules'

export function serviceStatus(lifeCycle: LifeCycle): Status {
  switch (lifeCycle) {
    case 'RUNNING':
      return 'running'
    case 'PREPARED':
      return 'starting'
    case 'DELETED':
      return 'error'
    default:
      return 'stopped'
  }
}

// state is optional: the spec guarantees no field, so a node may omit it and the
// default branch already answers 'stopped' for anything unrecognised
export function nodeStatus(
  state?: 'UNAVAILABLE' | 'SYNCING' | 'READY' | 'DISCONNECTED',
  draining = false
): Status {
  if (draining) return 'draining'
  switch (state) {
    case 'READY':
      return 'running'
    case 'SYNCING':
      return 'starting'
    case 'DISCONNECTED':
      return 'error'
    default:
      return 'stopped'
  }
}

// CREATED/LOADED/RELOADING are on the way to STARTED, not resting states.
export function moduleStatus(lifecycle?: `${Lifecycle}`): Status {
  switch (lifecycle) {
    case 'STARTED':
      return 'running'
    case 'CREATED':
    case 'LOADED':
    case 'RELOADING':
      return 'starting'
    case 'UNUSEABLE':
      return 'error'
    default:
      return 'stopped'
  }
}

// a service version has no lifecycle; deprecation is the only state the API reports
export function serviceVersionStatus(deprecated?: boolean): Status {
  return deprecated ? 'stopped' : 'running'
}

export function tally<T>(items: T[], of: (item: T) => Status) {
  const counts = {} as Record<Status, number>
  for (const item of items) {
    const status = of(item)
    counts[status] = (counts[status] ?? 0) + 1
  }
  return counts
}
