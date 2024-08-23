'use client'
import { useEffect } from 'react'
import { useToast } from '@/components/ui/use-toast'

export function ToastHandler({
  title,
  description,
  destructive = false,
}: {
  title: string
  description: string
  destructive?: boolean
}) {
  const { toast } = useToast()

  useEffect(() => {
    if (destructive === false) {
      toast({
        title: title || 'Success',
        description: description || 'Action was successful',
      })
    } else if (destructive === true) {
      toast({
        title: title || 'Error',
        description: description || 'An error occurred',
        variant: 'destructive',
      })
    }
  }, [destructive, title, description, toast])

  return null // This component doesn't render anything
}
