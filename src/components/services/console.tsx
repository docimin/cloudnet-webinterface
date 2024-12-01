'use client'

import React, { useState, useRef, useEffect } from 'react'
import { ChevronRight } from 'lucide-react'
import { getCookie } from '@/lib/server-calls'
import { io } from 'socket.io-client'

interface ConsoleEntry {
  command: string
  output: string
}

export default function ServiceConsole({
  serviceName,
}: {
  serviceName: string
}) {
  const [history, setHistory] = useState<ConsoleEntry[]>([])
  const [input, setInput] = useState('')
  const consoleEndRef = useRef<HTMLDivElement>(null)
  const [address, setAddress] = useState('')

  useEffect(() => {
    async function fetchAddress() {
      const cookieAddress = await getCookie('add')
      setAddress(cookieAddress.replace(/^http:\/\//, ''))
    }
    fetchAddress().then()
  }, [])

  useEffect(() => {
    if (!address) return

    const socket = io(`ws://${address}`, {
      path: `/api/v3/service/${serviceName}/liveLog`,
    })

    socket.on('connect', () => {
      console.log('Socket connected')
    })

    socket.on('message', (data) => {
      const newEntry: ConsoleEntry = {
        command: 'Server',
        output: data,
      }
      setHistory((prev) => [...prev, newEntry])
    })

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error)
    })

    socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })

    return () => {
      socket.disconnect()
    }
  }, [address])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (input.trim()) {
      const newEntry: ConsoleEntry = {
        command: input,
        output: `Output for command: ${input}`, // Replace with actual command processing logic
      }
      setHistory((prev) => [...prev, newEntry])
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
            <div className="flex items-center">
              <ChevronRight className="w-4 h-4 mr-1 text-green-400" />
              <span className="text-yellow-400">{entry.command}</span>
            </div>
            <div className="pl-5 text-gray-400">{entry.output}</div>
          </div>
        ))}
        <div ref={consoleEndRef} />
      </div>
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
    </div>
  )
}
