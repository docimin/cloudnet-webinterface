import dynamic from 'next/dynamic'

const TemplateList = dynamic(() => import('@/components/templates/templateList'), {
  ssr: false,
})

export const runtime = 'edge';

export default function template({ template }) {
  return <TemplateList template={template} />;
}