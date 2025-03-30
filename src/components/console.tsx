'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { getCookie } from '@/lib/server-calls'
import { getCachedServiceLog } from '@/utils/server-api/services/getCachedServiceLog'
import { serviceApi } from '@/lib/client-api'
import { authApi } from '@/lib/client-api'

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

  useEffect(() => {
    let socket: WebSocket | null = null

    const cachedLogLines = async () => {
      if (type === 'service') {
        const cache = await getCachedServiceLog(serviceName)
        setHistory(
          cache.lines.map((line) => ({ command: 'Server', output: line }))
        )
      }
    }

    const initializeSocket = async () => {
      const ticket = await authApi.createTicket(type)
      const cookieAddress = await getCookie('add')
      const protocol = cookieAddress.startsWith('https') ? 'wss' : 'ws'
      const address = cookieAddress.replace(/^(http:\/\/|https:\/\/)/, '')

      socket = new WebSocket(
        `${protocol}://${address}${webSocketPath}?ticket=${ticket}`
      )
      socket.onmessage = (event) => {
        const newEntry: ConsoleEntry = {
          output: event.data,
        }
        setHistory((prev) => [...prev, newEntry])
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

    if (input.trim()) {
      await serviceApi.execute(`/service/${serviceName}/command`, input)
      setInput('')
    }
  }

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  return (
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
  )
}
