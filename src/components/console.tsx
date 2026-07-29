import { useTranslations } from 'gt-tanstack-start'
import { ChevronRight, Download, Filter, Terminal, Trash } from 'lucide-react'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ticket as createTicket, currentAddress } from '@/server/auth'
import { serviceCommand, serviceLogLines } from '@/server/service'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'

type LogLevel = 'INFO' | 'WARN' | 'ERROR'

interface ConsoleEntry {
  id: number
  output: string
  text: string
  level: LogLevel | null
}

interface ServiceConsoleProps {
  webSocketPath: string
  serviceName?: string
  disableCommands?: boolean
  type?: 'service' | 'node'
}

const FILTER_KEYS = {
  ALL: 'filterAll',
  INFO: 'filterInfo',
  WARN: 'filterWarn',
  ERROR: 'filterError'
} as const

type LogFilter = keyof typeof FILTER_KEYS

// Match log levels in all formats
const LEVEL_PATTERNS: ReadonlyArray<readonly [LogLevel, RegExp]> = [
  [
    'WARN',
    /^\[.*?(WARN|WARNING)\]|^\[\d+\.\d+\s+\d+:\d+:\d+\.\d+\]\s+(WARN|WARNING)\s*:/
  ],
  ['ERROR', /^\[.*?ERROR\]|^\[\d+\.\d+\s+\d+:\d+:\d+\.\d+\]\s+ERROR\s*:/],
  ['INFO', /^\[.*?INFO\]|^\[\d+\.\d+\s+\d+:\d+:\d+\.\d+\]\s+INFO\s*:/]
]

const LEVEL_TONE: Record<LogLevel, string> = {
  INFO: 'text-log-info',
  WARN: 'text-log-warn',
  ERROR: 'text-log-error'
}

const MAX_RECONNECT_ATTEMPTS = 10
const RECONNECT_BASE_DELAY_MS = 1000
const RECONNECT_MAX_DELAY_MS = 30000

let nextEntryId = 0

// The level is decided once, on arrival: rendering and filtering both read it
// off the entry instead of re-running these regexes per line per render.
const toEntry = (output: string): ConsoleEntry => {
  // Remove ASCII escape sequences
  // biome-ignore lint/suspicious/noControlCharactersInRegex: ANSI SGR sequences start with the literal ESC (\x1b) control character; matching it is the point.
  const text = output.replace(/\x1b\[[0-9;]*m/g, '')
  const match = LEVEL_PATTERNS.find(([, pattern]) => pattern.test(text))
  nextEntryId += 1
  return { id: nextEntryId, output, text, level: match ? match[0] : null }
}

export default function ServiceConsole({
  webSocketPath,
  serviceName,
  disableCommands = false,
  type
}: ServiceConsoleProps) {
  const [history, setHistory] = useState<ConsoleEntry[]>([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<LogFilter>('ALL') // Default filter is ALL
  const consoleEndRef = useRef<HTMLDivElement>(null)
  const [socketBlocked, setSocketBlocked] = useState(false)
  const consoleT = useTranslations('Console')
  // Keeping the translator out of the socket effect's deps: its identity changes
  // when the locale or the loaded dictionary changes, which must not tear down
  // an open socket.
  const consoleTRef = useRef(consoleT)
  const hasFetchedLogsRef = useRef(false)
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectAttempt = useRef<number>(0)
  const reconnectTimer = useRef<number | null>(null)
  // Bumped on every effect run and on cleanup, so callbacks captured by an
  // earlier run (notably the pending reconnect timer) can tell they are stale.
  const runIdRef = useRef(0)

  useEffect(() => {
    consoleTRef.current = consoleT
  }, [consoleT])

  const initializeSocket = useCallback(
    async (runId: number) => {
      if (runId !== runIdRef.current) return
      const existing = socketRef.current
      if (
        existing &&
        (existing.readyState === WebSocket.CONNECTING ||
          existing.readyState === WebSocket.OPEN)
      ) {
        return // already connected or connecting
      }

      try {
        // the old route's ternary fell through to the service scope when unset
        const ticketResponse = await createTicket({
          data: { type: type ?? 'service' }
        })

        // Handle different response formats
        const ticket = ticketResponse.secret

        // Validate ticket
        if (!ticket || typeof ticket !== 'string') {
          throw new Error(`Invalid ticket: ${ticket} (type: ${typeof ticket})`)
        }

        const { address: cookieAddress } = await currentAddress()
        const protocol = cookieAddress.startsWith('https') ? 'wss' : 'ws'
        const address = cookieAddress.replace(/^(http:\/\/|https:\/\/)/, '')
        const domainUrlProtocol = window.location.origin.startsWith('https')
          ? 'wss'
          : 'ws'

        // Only block if both are HTTPS/WSS and there's a mismatch
        // Allow HTTP/WS connections even if there's a protocol mismatch for development
        if (protocol === 'wss' && domainUrlProtocol === 'ws') {
          console.warn(
            'Protocol mismatch: Backend uses WSS but frontend uses WS. This may cause issues in production.'
          )
          // For development, we'll still try to connect but warn the user
        }

        const socketUrl = `${protocol}://${address}${webSocketPath}?ticket=${ticket}`

        let socket: WebSocket
        try {
          socket = new WebSocket(socketUrl)
        } catch (error) {
          console.error('WebSocket construction error:', error)
          setSocketBlocked(true)
          return
        }

        // the awaits above can resolve after unmount, or after the path changed
        if (runId !== runIdRef.current) {
          socket.close()
          return
        }
        socketRef.current = socket

        socket.onopen = () => {
          // Reset reconnect state on successful open
          console.log('WebSocket connection opened')
          reconnectAttempt.current = 0
          if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current)
            reconnectTimer.current = null
          }
        }

        socket.onmessage = (event) => {
          setHistory((prev) => [...prev, toEntry(event.data)])
        }

        socket.onclose = () => {
          // release the ref so the reconnect below is not short-circuited
          if (socketRef.current === socket) socketRef.current = null
          if (runId !== runIdRef.current) return

          // Attempt automatic reconnect with exponential backoff
          if (reconnectAttempt.current < MAX_RECONNECT_ATTEMPTS) {
            const delay = Math.min(
              RECONNECT_MAX_DELAY_MS,
              RECONNECT_BASE_DELAY_MS * 2 ** reconnectAttempt.current
            )
            reconnectAttempt.current += 1
            console.log('Attempting reconnect...')
            // Schedule reconnect
            reconnectTimer.current = window.setTimeout(() => {
              initializeSocket(runId)
            }, delay) as unknown as number
          }
        }
      } catch (error) {
        console.error('WebSocket setup failed:', error)
        setSocketBlocked(true)
      }
    },
    [webSocketPath, type]
  )

  useEffect(() => {
    runIdRef.current += 1
    const runId = runIdRef.current
    reconnectAttempt.current = 0

    const cachedLogLines = async () => {
      if (hasFetchedLogsRef.current) return
      hasFetchedLogsRef.current = true

      if (type === 'service' && serviceName) {
        try {
          const cache = await serviceLogLines({ data: { id: serviceName } })
          setHistory(cache.lines.map((line) => toEntry(line)))
        } catch (error) {
          console.error('Failed to fetch cached log lines:', error)
          toast.error(consoleTRef.current('fetchError'))
        }
      }
    }

    cachedLogLines().then(() => initializeSocket(runId))

    return () => {
      // invalidates this run's socket callbacks and any pending reconnect
      runIdRef.current += 1
      if (socketRef.current) {
        socketRef.current.close()
        socketRef.current = null
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current)
        reconnectTimer.current = null
      }
    }
  }, [initializeSocket, serviceName, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (input.trim() && serviceName) {
      try {
        await serviceCommand({ data: { id: serviceName, command: input } })
        setInput('')
      } catch (error) {
        console.error('Console command failed:', error)
        toast.error(consoleT('commandError'))
      }
    }
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: history is the trigger — every new batch of lines must re-scroll, even though the body only reads a ref.
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  // Function to download console logs
  const handleDownloadLogs = () => {
    const logContent = history.map((entry) => entry.output).join('\n')
    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${serviceName || 'console'}-logs.txt`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Function to clear console logs
  const handleClearLogs = () => {
    setHistory([])
  }

  // Function to filter logs
  const filteredHistory = history.filter(
    (entry) => filter === 'ALL' || entry.level === filter
  )

  return (
    <>
      {socketBlocked && (
        <Alert className="my-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>{consoleT('headsUp')}</AlertTitle>
          <AlertDescription>{consoleT('protocolMismatch')}</AlertDescription>
        </Alert>
      )}
      <div className="w-full mx-auto h-console bg-console text-console-foreground rounded-lg overflow-hidden flex flex-col">
        {/* Dropdown Menu for Filter on the Left and Buttons on the Right */}
        <div className="flex justify-between items-center p-2 bg-console-chrome">
          {/* Dropdown Menu for Filter */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="console">
                  <Filter className="mr-2 h-4 w-4" />
                  {consoleT('filter')}: {consoleT(FILTER_KEYS[filter])}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {(Object.keys(FILTER_KEYS) as LogFilter[]).map((level) => (
                  <DropdownMenuItem
                    key={level}
                    onClick={() => setFilter(level)}
                  >
                    {consoleT(FILTER_KEYS[level])}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Buttons for Clear and Download */}
          <div className="flex items-center gap-2">
            <Button variant="console" onClick={handleClearLogs}>
              <Trash className="h-4 w-4" />
              {consoleT('clearLogs')}
            </Button>
            <Button variant="console" onClick={handleDownloadLogs}>
              <Download className="h-4 w-4" />
              {consoleT('downloadLogs')}
            </Button>
          </div>
        </div>
        {/* Console Content */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
          {filteredHistory.map((entry) => (
            <div key={entry.id} className="mb-2">
              <div
                className={
                  entry.level ? LEVEL_TONE[entry.level] : 'text-console-muted'
                }
              >
                {entry.text}
              </div>
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>
        {/* Command Input */}
        {disableCommands ? null : (
          <form onSubmit={handleSubmit} className="p-2 bg-console-chrome">
            <div className="flex items-center">
              <ChevronRight className="w-5 h-5 mr-1 text-console-prompt" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent outline-hidden text-console-foreground placeholder:text-console-muted font-mono"
                placeholder={consoleT('commandPlaceholder')}
              />
            </div>
          </form>
        )}
      </div>
    </>
  )
}
