import { initializeGT } from 'gt-tanstack-start'
import gtConfig from '../gt.config.json'
import en from '../messages/en.json'

export const loadDictionary = async (locale: string) => {
  const dictionary = await import(`../messages/${locale}.json`)
  return dictionary.default
}

initializeGT({
  ...gtConfig,
  // loadDictionary throws at init unless a base dictionary is supplied up front.
  dictionary: en,
  loadDictionary,
  cacheUrl: null,
  runtimeUrl: null
})
