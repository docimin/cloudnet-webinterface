'use client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'
import { Button } from '../ui/button'
import * as React from 'react'
import { GlobeIcon } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'

/**
 * Fetches languages from the API and allows the user to change the language of the page.
 */
export default function ChangeLanguage() {
  const router = useRouter()
  const pathname = usePathname()
  const languages = [
    {
      name: 'en',
      fullName: 'English'
    },
    {
      name: 'de',
      fullName: 'Deutsch'
    },
    {
      name: 'nl',
      fullName: 'Nederlands'
    }
  ]

  const handleLanguageClick = (lang: string) => {
    // Get the current pathname
    // Split the pathname into parts
    const pathParts = pathname.split('/')

    // Extract language codes from the fetched languages
    const knownLanguages = languages.map((language) => language.name)

    // Check if the first part is a language code
    const isFirstPartLanguage = knownLanguages.includes(pathParts[1])

    // Update the path parts
    if (isFirstPartLanguage) {
      // Replace the language code if it's present
      pathParts[1] = lang
    } else {
      // Insert the language code if it's not present
      pathParts.splice(1, 0, lang)
    }

    // Join the parts back into a new URL
    const newUrl = pathParts.join('/')

    // Update the browser's URL and reload the page
    // @ts-ignore
    router.push(newUrl)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={'ml-2'}>
          <GlobeIcon className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.name}
            onClick={() => handleLanguageClick(language.name)}
          >
            {language.fullName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
