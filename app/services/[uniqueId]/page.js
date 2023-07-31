import dynamic from 'next/dynamic'

const ServicePage = dynamic(() => import('@/components/services/servicePage'), {
  ssr: false,
})

export const runtime = 'edge';

export default function Service({ service }) {
  return <ServicePage service={service} />;
}