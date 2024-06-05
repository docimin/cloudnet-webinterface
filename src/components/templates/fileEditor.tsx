'use client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'

export default function FileEditor({ params, fileData }) {
  const [data, setData] = useState(fileData || '')
  return (
    <div>
      <div className={'flex gap-4 mb-4'}>
        <Button className="">Save</Button>
        <Button className="">Cancel</Button>
      </div>
      <div className="flex-1 overflow-auto">
        <Textarea
          className="focus:ring-0 focus:outline-none font-mono"
          rows={20}
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </div>
    </div>
  )
}
