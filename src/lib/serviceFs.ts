// Filesystem access to a running service's directory.
//
// Enabled only when CLOUDNET_SERVICES_PATH is set (feature flag). The
// bind-mount is expected to point at CloudNet's `temp/services` directory —
// each running service lives under `<name>_<uuid>` inside it.
//
// Every path handed to this module is treated as untrusted user input:
//  - the service id must match a real subdirectory (no `..`, no absolute paths)
//  - the file path must resolve, after normalization, inside that subdirectory
//    (guards against `..` inside the query, and symlinks whose target escapes)
import { promises as fs, constants as fsc } from 'fs'
import path from 'path'

export function servicesRoot(): string | null {
  const p = process.env.CLOUDNET_SERVICES_PATH
  return p && p.trim() !== '' ? p : null
}

export function isEnabled(): boolean {
  return servicesRoot() !== null
}

// Resolve the on-disk directory for a service identifier. Accepts both a
// full directory name (`Lobby-1_edbc124c-...`) and a bare service uuid — in
// the latter case we look up the subdir whose name ends with `_<uuid>`.
export async function resolveServiceDir(id: string): Promise<string> {
  const root = servicesRoot()
  if (!root) throw new Error('service files browser disabled')

  if (!id || id.includes('/') || id.includes('\\') || id.includes('..')) {
    throw new Error('invalid service id')
  }

  // Try direct name first (fast path).
  const direct = path.join(root, id)
  try {
    const st = await fs.stat(direct)
    if (st.isDirectory()) {
      const real = await fs.realpath(direct)
      if (real === direct || real.startsWith(root + path.sep)) return real
    }
  } catch {
    // fall through to uuid lookup
  }

  // UUID lookup — match a directory that ends with `_<id>`.
  const suffix = '_' + id.toLowerCase()
  const entries = await fs.readdir(root, { withFileTypes: true })
  for (const e of entries) {
    if (e.isDirectory() && e.name.toLowerCase().endsWith(suffix)) {
      const real = await fs.realpath(path.join(root, e.name))
      if (real.startsWith(root + path.sep)) return real
    }
  }
  throw new Error('service not found')
}

// Resolve `sub` relative to `base`, forbidding any escape. `sub` may be
// empty (means the base itself). We resolve, then check the resolved path
// is either equal to `base` or inside `base` — this catches both `..`
// segments in the query and symlinks whose target lies outside.
export async function safeJoin(base: string, sub: string | null | undefined): Promise<string> {
  const raw = (sub ?? '').trim()

  if (/[\x00\r\n]/.test(raw)) throw new Error('unsafe path: control chars')
  if (raw.includes('\\')) throw new Error('unsafe path: backslash')
  if (raw.startsWith('/')) throw new Error('unsafe path: absolute')

  const joined = path.resolve(base, raw)
  // Reject anything that resolves outside the base (before realpath, in case
  // the target does not exist yet — e.g. creating a new file).
  if (joined !== base && !joined.startsWith(base + path.sep)) {
    throw new Error('unsafe path: escapes service directory')
  }

  // If the target already exists, realpath it and re-check to catch symlinks
  // whose target escapes.
  try {
    const real = await fs.realpath(joined)
    if (real !== base && !real.startsWith(base + path.sep)) {
      throw new Error('unsafe path: symlink escapes')
    }
    return real
  } catch (e: any) {
    if (e.code === 'ENOENT') return joined
    throw e
  }
}

export type Entry = {
  name: string
  path: string
  directory: boolean
  size: number
  lastModified: number
}

export async function listDir(dir: string, base: string): Promise<Entry[]> {
  const items = await fs.readdir(dir, { withFileTypes: true })
  const out: Entry[] = []
  for (const it of items) {
    const full = path.join(dir, it.name)
    const rel = path.relative(base, full).split(path.sep).join('/')
    try {
      const st = await fs.stat(full) // follows symlink; that's ok, we've
      // already verified `dir` itself resolves inside base
      out.push({
        name: it.name,
        path: rel,
        directory: st.isDirectory(),
        size: st.isDirectory() ? 0 : st.size,
        lastModified: st.mtimeMs
      })
    } catch {
      // dangling symlink, race with delete — skip silently
    }
  }
  return out
}

export function isProtectedName(name: string): boolean {
  // Files CloudNet uses to track the service, deleting them breaks the node.
  return name === '.wrapper' || name === '.token' || name === 'wrapper.jar'
}
