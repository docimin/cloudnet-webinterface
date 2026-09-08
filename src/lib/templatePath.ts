const SEGMENT_MAX_LENGTH = 255

function safe(value: string) {
  if (
    value.includes('\0') ||
    value.includes('\r') ||
    value.includes('\n') ||
    value.includes('\\')
  ) {
    return false
  }
  if (value.startsWith('/')) return false
  if (/^[A-Za-z]:/.test(value)) return false
  return !value
    .split('/')
    .some((segment) => segment === '.' || segment === '..')
}

// `%2e%2e%2f` reaches CloudNet as `../` once, so the raw and the decoded form
// both have to pass; a broken sequence is unsafe rather than harmless
function forms(value: string) {
  try {
    return [value, decodeURIComponent(value)]
  } catch {
    return null
  }
}

export function isSafeTemplatePath(value: string) {
  return forms(value)?.every(safe) === true
}

export function isSafeSegment(value: string) {
  if (value === '' || value.length > SEGMENT_MAX_LENGTH) return false
  return (
    forms(value)?.every((form) => safe(form) && !form.includes('/')) === true
  )
}
