'use client'
import React from 'react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command'
import Link from 'next/link'
import { UserSearchIcon } from 'lucide-react'
import { EmployeesTotal } from '@/utils/types/employees'
import { useRouter } from 'next/navigation'

/**
 * SearchModal is a component that displays a search modal with search functionality for products, categories, and pages.
 * It supports filtering and displaying search results based on user input.
 */
export default function SearchModal({
  searchData,
}: {
  searchData: EmployeesTotal
}) {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const items = []

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'f' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open: boolean) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  if (searchData.documents) {
    searchData.documents.forEach((employee) => {
      items.push({
        id: employee.$id,
        name: employee.name,
        department: employee.department,
        category: 'Employees',
        url: `/employees/${employee.$id}`,
      })
    })
  }

  const filteredItems = items.filter((item) => {
    return item.name.toLowerCase()
  })

  const groups = filteredItems.reduce((groups, item) => {
    return {
      ...groups,
      [item.category]: [...(groups[item.category] || []), item],
    }
  }, {})

  return (
    <>
      <Link
        className="border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 p-6 flex flex-col items-start gap-4"
        href={'#'}
        onClick={() => {
          setOpen(true)
          router.refresh()
        }}
      >
        <UserSearchIcon className="h-8 w-8 text-gray-600 dark:text-gray-400" />
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Search
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Find your colleagues.
          </p>
        </div>
      </Link>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          className={'border-none focus:ring-0'}
          placeholder="Type a command or search..."
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groups).map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {(
                items as Array<{
                  id: string
                  name: string
                  department: string
                  url: string
                }>
              ).map((item) => (
                // close the menu when a link is clicked
                <Link
                  key={item.id}
                  href={item.url}
                  onClick={() => setOpen(false)}
                >
                  <CommandItem
                    className={'hover:bg-foreground/30 flex justify-between'}
                  >
                    <span className={'text-foreground'}>{item.name}</span>
                    <span className={'text-foreground'}>{item.department}</span>
                  </CommandItem>
                </Link>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
