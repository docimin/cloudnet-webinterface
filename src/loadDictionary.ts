export default async function loadDictionary(locale: string) {
  const t = await import(`../messages/${locale}.json`)
  return t.default
}
