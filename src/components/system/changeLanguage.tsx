import { useSetLocale, useTranslations } from 'gt-tanstack-start'
import { GlobeIcon } from 'lucide-react'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../ui/dropdown-menu'

/**
 * Fetches languages from the API and allows the user to change the language of the page.
 */
export default function ChangeLanguage() {
  const setLocale = useSetLocale()
  const mainT = useTranslations('Main')
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={'ml-2'}>
          <GlobeIcon className="size-icon" aria-hidden="true" />
          <span className="sr-only">{mainT('changeLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.name}
            onClick={() => setLocale(language.name)}
          >
            {language.fullName}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
