'use client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import React, { useEffect, useState } from 'react'
import { getFile } from '@/utils/server-api/templates/getFile'
import { updateFile } from '@/utils/actions/templates/updateFile'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from '@/i18n/routing'
import { deleteFile } from '@/utils/actions/templates/deleteFile'
import { toast } from 'sonner'

export default function FileEditor({ params }) {
  const [data, setData] = useState<string>('')
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      const fileData = await getFile(
        params.storageId,
        params.storagePrefix,
        params.templateId,
        params.fileId
      )
      setData(fileData)
    }

    fetchData().then()
  }, [params.fileId, params.storageId, params.storagePrefix, params.templateId])

  const handleSave = async () => {
    try {
      // Validate if the data is valid JSON
      await updateFile(
        params.storageId,
        params.storagePrefix,
        params.templateId,
        params.fileId,
        data
      )

      toast.success('Your file has been saved successfully.')
    } catch (error) {
      Sentry.captureException('Failed to save file:', error)
      toast.error('Failed to save file. Please check file contents.')
    }
  }

  const handleCancel = () => {
    setData('')
    router.back()
  }

  const handleDelete = async () => {
    await deleteFile(
      params.storageId,
      params.storagePrefix,
      params.templateId,
      params.fileId
    )
    router.back()
  }

  return (
    <div>
      <div className={'flex mb-4 justify-between'}>
        <div className={'flex gap-4'}>
          <Button onClick={handleCancel}>Back</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
        <div>
          <Button variant={'destructive'} onClick={handleDelete}>
            Delete
          </Button>
        </div>
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
