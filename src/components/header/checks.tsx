'use client'

import { useEffect } from 'react'
import { setOrgId } from '@/utils/actions/system/setOrgId'

export default function OrgChecks() {
  useEffect(() => {
    const setOrgIdIfNotPresent = async () => {
      await setOrgId().catch((error) => {
        return error
      })
    }
    setOrgIdIfNotPresent().then()
  }, [])

  return null
}
