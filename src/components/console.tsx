'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronRight, Terminal, Download, Trash, Filter } from 'lucide-react'
import { authApi, serviceApi } from '@/lib/client-api'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from './ui/dropdown-menu'
import { toast } from 'sonner'
import { useDict } from 'gt-next/client'

interface ConsoleEntry {
  output: string
}

interface ServiceConsoleProps {
  webSocketPath: string
  serviceName?: string
  disableCommands?: boolean
  type?: 'service' | 'node'
}

const applyStyles = (text: string) => {
  // Remove ASCII escape sequences
  const cleanText = text.replace(/\x1b\[[0-9;]*m/g, '')

  // Match log levels in all formats
  if (
    /^\[.*?(WARN|WARNING)\]|^\[.*?(WARN|WARNING)\]:|^\[\d+\.\d+\s+\d+:\d+:\d+\.\d+\]\s+(WARN|WARNING)\s*:/.test(
      cleanText
    )
  ) {
    return <span style={{ color: 'orange' }}>{cleanText}</span>
  } else if (
    /^\[.*?ERROR\]|^\[.*?ERROR\]:|^\[\d+\.\d+\s+\d+:\d+:\d+\.\d+\]\s+ERROR\s*:/.test(
      cleanText
    )
  ) {
    return <span style={{ color: 'red' }}>{cleanText}</span>
  } else if (
    /^\[.*?INFO\]|^\[.*?INFO\]:|^\[\d+\.\d+\s+\d+:\d+:\d+\.\d+\]\s+INFO\s*:/.test(
      cleanText
    )
  ) {
    return <span style={{ color: 'darkcyan' }}>{cleanText}</span>
  }
  return <span>{cleanText}</span>
}

export default function ServiceConsole({
  webSocketPath,
  serviceName,
  disableCommands = false,
  type
}: ServiceConsoleProps) {
  const [history, setHistory] = useState<ConsoleEntry[]>([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<'ALL' | 'INFO' | 'WARN' | 'ERROR'>('ALL') // Default filter is ALL
  const consoleEndRef = useRef<HTMLDivElement>(null)
  const [socketBlocked, setSocketBlocked] = useState(false)
  const consoleT = useDict('Console')
  const hasFetchedLogsRef = useRef(false)
  const socketRef = useRef<WebSocket | null>(null)

  const initializeSocket = async () => {
    if (socketRef.current) return // Prevent re-initialization

    try {
      const ticket = await authApi.createTicket(type)
      const cookies = await authApi.getCookies()
      const cookieAddress = decodeURIComponent(cookies['add'])
      const protocol = cookieAddress.startsWith('https') ? 'wss' : 'ws'
      const address = cookieAddress.replace(/^(http:\/\/|https:\/\/)/, '')
      const domainUrlProtocol = window.location.origin.startsWith('https')
        ? 'wss'
        : 'ws'

      if (protocol !== domainUrlProtocol) {
        setSocketBlocked(true)
        return
      }

      const socketUrl = `${protocol}://${address}${webSocketPath}?ticket=${ticket}`

      try {
        socketRef.current = new WebSocket(socketUrl)
      } catch (error) {
        console.error('WebSocket construction error:', error)
        setSocketBlocked(true)
        toast.error(consoleT('connectionError'))
        return
      }

      socketRef.current.onmessage = (event) => {
        const newEntry: ConsoleEntry = {
          output: event.data
        }
        setHistory((prev) => [...prev, newEntry])
      }
      socketRef.current.onerror = (event) => {
        console.error('WebSocket error:', event)
        toast.error(consoleT('connectionError'))
      }
    } catch (error) {
      console.error('Socket initialization error:', error)
      setSocketBlocked(true)
      toast.error(consoleT('connectionError'))
    }
  }

  useEffect(() => {
    const cachedLogLines = async () => {
      if (hasFetchedLogsRef.current) return
      hasFetchedLogsRef.current = true

      if (type === 'service' && serviceName) {
        try {
          const cache = (await serviceApi.logLines(serviceName)).data
          setHistory(cache.lines.map((line) => ({ output: line })))
        } catch (error) {
          toast.error(consoleT('fetchError'))
        }
      }
    }

    cachedLogLines().then(initializeSocket)

    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [consoleT, webSocketPath, serviceName, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (input.trim() && serviceName) {
      try {
        await serviceApi.execute(serviceName, input)
        setInput('')
      } catch (error) {
        toast.error(consoleT('commandError'))
      }
    }
  }

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
  const filteredHistory = history.filter((entry) => {
    if (filter === 'ALL') return true
    // Match the same pattern as the styling
    const regex = new RegExp(
      `^\\[.*?(${filter})\\]|^\\[.*?(${filter})\\]:|^\\[\\d+\\.\\d+\\s+\\d+:\\d+:\\d+\\.\\d+\\]\\s+${filter}\\s*:`
    )
    return regex.test(entry.output)
  })

  return (
    <>
      {socketBlocked && (
        <Alert className="my-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>{consoleT('headsUp')}</AlertTitle>
          <AlertDescription>{consoleT('protocolMismatch')}</AlertDescription>
        </Alert>
      )}
      <div className="w-full mx-auto h-[80vh] bg-gray-800 text-gray-200 rounded-lg overflow-hidden flex flex-col">
        {/* Dropdown Menu for Filter on the Left and Buttons on the Right */}
        <div className="flex justify-between items-center p-2 bg-gray-900">
          {/* Dropdown Menu for Filter */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  {consoleT('filter')}: {filter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setFilter('ALL')}>
                  {consoleT('filterAll') || 'ALL'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('INFO')}>
                  INFO
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('WARN')}>
                  WARN
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('ERROR')}>
                  ERROR
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Buttons for Clear and Download */}
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleClearLogs}>
              <Trash className="h-4 w-4" />
              {consoleT('clearLogs')}
            </Button>
            <Button variant="outline" onClick={handleDownloadLogs}>
              <Download className="h-4 w-4" />
              {consoleT('downloadLogs')}
            </Button>
          </div>
        </div>
        {/* Console Content */}
        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
          {filteredHistory.map((entry, index) => (
            <div key={index} className="mb-2">
              <div className="text-gray-400">{applyStyles(entry.output)}</div>
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>
        {/* Command Input */}
        {disableCommands ? null : (
          <form onSubmit={handleSubmit} className="p-2 bg-gray-900">
            <div className="flex items-center">
              <ChevronRight className="w-5 h-5 mr-1 text-green-400" />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-transparent outline-none text-gray-200 font-mono"
                placeholder={consoleT('commandPlaceholder')}
              />
            </div>
          </form>
        )}
      </div>
    </>
  )
}
