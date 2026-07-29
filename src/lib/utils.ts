import { type ClassValue, clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// text-status-code and text-caption are font sizes, but an unknown text-* looks
// like a colour to tailwind-merge and would swallow the real colour class
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': ['text-status-code', 'text-caption']
    }
  }
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
