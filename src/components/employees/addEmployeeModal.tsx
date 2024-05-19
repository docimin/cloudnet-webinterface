'use client'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { UserPlusIcon } from 'lucide-react'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/navigation'
import { createEmployee } from '@/utils/actions/employees/createEmployee'
import Link from 'next/link'

export default function AddEmployeeModal() {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [employeeName, setEmployeeName] = useState<string>('')
  const [department, setDepartment] = useState<string>('')
  const { toast } = useToast()
  const router = useRouter()

  const createEmployeeButton = async (e: { preventDefault: () => void }) => {
    e.preventDefault()

    if (!employeeName) {
      toast({
        title: 'Please fill in all required fields.',
        variant: 'destructive',
      })
      return
    }

    await createEmployee(employeeName, department)
      .catch((error) => {
        toast({
          title: 'An error occurred while creating the database.',
          variant: 'destructive',
        })
        Sentry.captureException(
          'An error occurred while creating the database. ' + error
        )
      })
      .then((response) => {
        toast({
          title: 'Employee created successfully.',
        })
        setModalOpen(false)
        router.push(`/employees/${response && response.$id}`)
      })
  }

  const reset = () => {
    setModalOpen(false)
    setEmployeeName('')
    setDepartment('')
  }

  return (
    <AlertDialog onOpenChange={(value) => !value && reset()} open={modalOpen}>
      <AlertDialogTrigger asChild onClick={() => setModalOpen(true)}>
        <Link
          className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-start gap-4"
          href="#"
        >
          <UserPlusIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Add new Employee
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Add a new employee to the system.
            </p>
          </div>
        </Link>
      </AlertDialogTrigger>
      <AlertDialogContent className="min-w-full min-h-full">
        <AlertDialogHeader>
          <AlertDialogTitle className={'text-center'}>
            Employee creation
          </AlertDialogTitle>
          <AlertDialogDescription className={'text-center'}>
            Please fill in the info we need to create your database.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="grid lg:grid-cols-2 gap-4 py-4 mx-auto">
          <div className="gap-4 py-4 mx-auto sm:w-[500px]">
            <Label>
              What is the name of the employee?
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="employeeName"
              className="col-span-3 w-[320px]"
              onChange={(e) => setEmployeeName(e.target.value)}
              value={employeeName}
            />
          </div>
          <div className="gap-4 py-4 mx-auto sm:w-[500px]">
            <Label>
              What department does the employee belong to?
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id={'department'}
              className="col-span-3 w-[320px]"
              onChange={(e) => setDepartment(e.target.value)}
              value={department}
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <Button type={'submit'} onClick={createEmployeeButton}>
            Create
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
