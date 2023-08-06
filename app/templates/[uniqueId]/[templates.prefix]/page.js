import dynamic from 'next/dynamic'

const RedirectComponent = dynamic(() => import('@/components/redirectTemplateFolder'), {
  ssr: false,
})

export const runtime = 'edge';

export default function template({ template }) {
  return <RedirectComponent template={template} />;
}