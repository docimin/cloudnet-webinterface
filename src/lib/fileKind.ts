export const EDITOR_MAX_BYTES = 1_048_576

export type FileKind = 'text' | 'binary' | 'too-large'

const languages: Record<string, string> = {
  yml: 'yaml',
  yaml: 'yaml',
  json: 'json',
  properties: 'properties',
  txt: 'text',
  md: 'text',
  log: 'text',
  sh: 'bash',
  bash: 'bash',
  xml: 'xml',
  toml: 'toml',
  conf: 'ini',
  cfg: 'ini',
  ini: 'ini'
}

// A leading dot is part of the filename, not an extension: .gitignore has none.
function extension(name: string) {
  const lower = name.toLowerCase()
  const dot = lower.lastIndexOf('.')
  return dot > 0 ? lower.slice(dot + 1) : ''
}

export function language(name: string) {
  return languages[extension(name)] ?? 'text'
}

export function fileKind(name: string, size: number): FileKind {
  const ext = extension(name)
  if (ext && !(ext in languages)) return 'binary'
  return size > EDITOR_MAX_BYTES ? 'too-large' : 'text'
}
