'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { getCookie } from '@/lib/server-calls'
import { createTicket } from '@/utils/actions/user/createTicket'
import { executeCommand } from '@/utils/actions/commands/executeCommand'
import { getCachedServiceLog } from '@/utils/server-api/services/getCachedServiceLog'

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
  const socketRef = useRef<WebSocket | null>(null)

  useEffect(() => {
    // Fetch cached logs for the service (if available)
    const cachedLogLines = async () => {
      if (type === 'service') {
        const cache = await getCachedServiceLog(serviceName)
        setHistory(
          cache.lines.map((line) => ({ command: 'Server', output: line }))
        )
      }
    }

    // Initialize WebSocket connection
    const initializeSocket = async () => {
      // Ensure we don't open a new connection if one already exists
      if (socketRef.current) {
        return
      }

      const ticket = await createTicket(type)

      if (!ticket) {
        console.error('Failed to create ticket!')
        return
      }

      const cookieAddress = await getCookie('add')
      const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws'
      const address = cookieAddress.replace(/^(http:\/\/|https:\/\/)/, '')

      if (!address) {
        console.error('Invalid address:', cookieAddress)
        return
      }

      socketRef.current = new WebSocket(
        `${protocol}://${address}${webSocketPath}?ticket=${ticket}`
      )

      socketRef.current.onmessage = (event) => {
        const newEntry: ConsoleEntry = {
          output: event.data,
        }
        setHistory((prev) => {
          if (prev.length && prev[prev.length - 1].output === newEntry.output) {
            return prev
          }
          return [...prev, newEntry]
        })
      }

      socketRef.current.onerror = (error) => {
        console.error('WebSocket Error:', error)
      }

      socketRef.current.onclose = (event) => {
        console.log('WebSocket closed:', event)
      }
    }

    cachedLogLines().then(initializeSocket)

    // Cleanup function to close socket when the component unmounts
    return () => {
      if (socketRef.current) {
        socketRef.current.close()
      }
    }
  }, [webSocketPath, serviceName, type])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const requiredPermissions = [
      'cloudnet_rest:service_write',
      'cloudnet_rest:service_send_commands',
      'global:admin',
    ]

    if (input.trim()) {
      // Check if the socket is open before trying to send a command
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        await executeCommand(
          `/service/${serviceName}/command`,
          input,
          requiredPermissions
        )
        setInput('')
      } else {
        console.error('WebSocket is not open. Command cannot be sent.')
      }
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
