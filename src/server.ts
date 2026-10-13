import '../instrument.server.mjs'
import { wrapFetchWithSentry } from '@sentry/tanstackstart-react'
import handler, { createServerEntry } from '@tanstack/react-start/server-entry'
import { parseHostDefaults } from '@/lib/appearance'

// a THEME_* typo is the host's own configuration; failing here puts the
// variable name in the log, where a throw in the root loader would not
parseHostDefaults(process.env)

export default createServerEntry(
  wrapFetchWithSentry({
    fetch(request: Request) {
      return handler.fetch(request)
    }
  })
)
