'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronRight, Terminal } from 'lucide-react'
import { authApi, serviceApi } from '@/lib/client-api'
import { Alert, AlertDescription, AlertTitle } from './ui/alert'

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
    return <span style={{ color: 'red' }}>{cleanText}</span>
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
  const consoleEndRef = useRef<HTMLDivElement>(null)
  const [socketBlocked, setSocketBlocked] = useState(false)

  useEffect(() => {
    let socket: WebSocket | null = null

    const cachedLogLines = async () => {
      if (type === 'service' && serviceName) {
        const cache = await serviceApi.logLines(serviceName)
        setHistory(cache.data.lines.map((line) => ({ output: line })))
      }
    }

    const initializeSocket = async () => {
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

      socket = new WebSocket(
        `${protocol}://${address}${webSocketPath}?ticket=${ticket}`
      )
      socket.onmessage = (event) => {
        const newEntry: ConsoleEntry = {
          output: event.data,
        }
        setHistory((prev) => [...prev, newEntry])
      }
      socket.onerror = (event) => {
        console.error('WebSocket error:', event)
      }
    }

    cachedLogLines().then(initializeSocket)

    return () => {
      if (socket) {
        socket.close()
      }
    }
  }, [webSocketPath, serviceName, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (input.trim() && serviceName) {
      await serviceApi.execute(serviceName, input)
      setInput('')
    }
  }

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  return (
    <>
      {socketBlocked && (
        <Alert className="my-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            The WebSocket protocol does not match the domain protocol. Both must
            use either HTTP/WS or HTTPS/WSS.
          </AlertDescription>
        </Alert>
      )}
      <div className="w-full mx-auto h-[80vh] bg-gray-800 text-gray-200 rounded-lg overflow-hidden flex flex-col">
        <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
          {history.map((entry, index) => (
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
                placeholder="Type your command..."
              />
            </div>
          </form>
        )}
      </div>
    </>
  )
}
