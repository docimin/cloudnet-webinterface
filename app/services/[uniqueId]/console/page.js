import dynamic from 'next/dynamic'

const ServiceConsole = dynamic(() => import('@/components/services/serviceConsole'), {
  ssr: false,
})

export const runtime = 'edge';

export default function Service({ service }) {
  return <ServiceConsole service={service} />;
}