'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronRight, Download, Terminal, Trash } from 'lucide-react'
import { authApi, serviceApi } from '@/lib/client-api'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'
import { toast } from 'sonner'
import { useDict } from 'gt-next/client'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

  if (cleanText.includes('INFO')) {
    return <span style={{ color: 'darkcyan' }}>{cleanText}</span>
  } else if (cleanText.includes('WARN')) {
    return <span style={{ color: 'orange' }}>{cleanText}</span>
  } else if (cleanText.includes('ERROR')) {
    return <span style={{ color: 'red', fontWeight: 'bold' }}>{cleanText}</span>
  }
  return <span>{cleanText}</span>
}

export default function ServiceConsole({
                                         webSocketPath,
                                         serviceName,
                                         disableCommands = false,
                                         type,
                                       }: ServiceConsoleProps) {
  const [history, setHistory] = useState<ConsoleEntry[]>([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<string>('ALL')
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
          output: event.data,
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

  const downloadLogs = () => {
    const element = document.createElement('a')
    const file = new Blob([history.map((entry) => entry.output).join('\n')], {
      type: 'text/plain',
    })
    element.href = URL.createObjectURL(file)
    element.download = 'console-logs.txt'
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    URL.revokeObjectURL(element.href)
  }

  const clearLogs = () => setHistory([])

  const filteredHistory = history.filter((entry) => {
    if (filter === 'ALL') return true
    return entry.output.includes(filter)
  })

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  return (
    <>
      {socketBlocked && (
        <Alert className="my-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>{consoleT('headsUp')}</AlertTitle>
          <AlertDescription>{consoleT('protocolMismatch')}</AlertDescription>
        </Alert>
      )}
      <div className="p-4 bg-gray-900 text-gray-200 flex items-center justify-between">
        <Select value={filter} onValueChange={(value) => setFilter(value)}>
          <SelectTrigger className="w-full max-w-xs">
            <SelectValue placeholder="Filter Logs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Logs</SelectItem>
            <SelectItem value="INFO">INFO</SelectItem>
            <SelectItem value="WARN">WARN</SelectItem>
            <SelectItem value="ERROR">ERROR</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadLogs}>
            <Download className="w-4 h-4 mr-1" />
            {consoleT('downloadLogs')}
          </Button>
          <Button variant="outline" onClick={clearLogs}>
            <Trash className="w-4 h-4 mr-1" />
            {consoleT('clearLogs')}
          </Button>
        </div>
      </div>
      <div className="w-full mx-auto h-[80vh] bg-gray-800 text-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
          {filteredHistory.map((entry, index) => (
            <div key={index} className="mb-2">
              <div className="text-gray-400">{applyStyles(entry.output)}</div>
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>
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