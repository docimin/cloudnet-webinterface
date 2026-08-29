// Defensive sanitizer for template file/dir paths.
//
// CloudNet REST 4.0.0-RC17 does NOT validate that the `path` query parameter
// on /template/{s}/{p}/{n}/file/create stays within the template directory —
// `path=../../../etc/passwd` writes the file to CloudNet's local/ tree.
// We reject anything containing path-escape sequences at the panel layer so
// this never reaches CloudNet.
//
// Rules:
//  - reject absolute paths (leading /, C:\ …)
//  - reject `..` segments and every URL-encoded variant of them
//  - reject backslashes (Windows path separator)
//  - reject NUL bytes and CR/LF (header/log injection)
export function safeTemplatePath(raw: string | null | undefined): string {
  const s = (raw ?? '').trim()
  if (s === '') return ''

  // NUL / CR / LF
  if (/[\x00\r\n]/.test(s)) throw new Error('unsafe path: control chars')

  // Absolute paths
  if (s.startsWith('/') || s.startsWith('\\')) throw new Error('unsafe path: absolute')
  if (/^[A-Za-z]:/.test(s)) throw new Error('unsafe path: windows drive')

  // Backslash separator
  if (s.includes('\\')) throw new Error('unsafe path: backslash')

  // Normalize any percent-encoding once so `..%2f..` and `%2e%2e/` also trip.
  let decoded = s
  try {
    decoded = decodeURIComponent(s)
  } catch {
    // Invalid % sequence: reject rather than pass through raw.
    throw new Error('unsafe path: bad percent-encoding')
  }
  if (decoded.includes('\\') || /[\x00\r\n]/.test(decoded)) {
    throw new Error('unsafe path: control chars after decode')
  }

  // Segment-by-segment `..` check on both raw and decoded forms.
  for (const src of [s, decoded]) {
    for (const seg of src.split('/')) {
      if (seg === '..' || seg === '.') throw new Error('unsafe path: traversal')
    }
  }

  return s
}

// Validate the three route params in one go, returning a JSON error response
// if any is invalid. Kept close to the routes so the guard reads locally.
export function safeTemplateTriple(
  storageId: string,
  prefixId: string,
  name: string
): { storageId: string; prefixId: string; name: string } {
  return {
    storageId: safeSegment(storageId),
    prefixId: safeSegment(prefixId),
    name: safeSegment(name)
  }
}

// URL path segment for storage / prefix / template-name — must not contain
// separators, dot-dot, or control chars, so a request to
// `/api/templates/local/y%2F..%2Fetc/x/create` cannot escape into an
// unintended CloudNet URL.
export function safeSegment(raw: string | null | undefined): string {
  const s = (raw ?? '').trim()
  if (s === '') throw new Error('unsafe segment: empty')
  if (s === '.' || s === '..') throw new Error('unsafe segment: dot')
  if (/[\/\\\x00\r\n]/.test(s)) throw new Error('unsafe segment: separator')
  if (s.length > 128) throw new Error('unsafe segment: too long')
  return s
}

// Safe Content-Disposition filename per RFC 6266 / 5987 — never let quotes
// or control chars in a user-supplied filename break out of the header.
export function contentDispositionAttachment(name: string): string {
  const fallback = name
    .replace(/[\x00-\x1f\x7f"\\]/g, '_')
    .slice(0, 255) || 'download'
  const encoded = encodeURIComponent(name).replace(/['()]/g, escape).replace(/\*/g, '%2A')
  return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`
}
