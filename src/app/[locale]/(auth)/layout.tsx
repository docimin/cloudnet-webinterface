export default async function LocaleLayout(props) {
  const params = await props.params

  const { locale } = params

  return props.children
}
