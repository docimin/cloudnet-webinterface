import dynamic from 'next/dynamic'

const TemplatePage = dynamic(() => import('@/components/templates/templatePage'), {
  ssr: false,
})

export const runtime = 'edge';

export default function template({ template }) {
  return <TemplatePage template={template} />;
}