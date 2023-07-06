import ServicePage from '@/components/services/servicePage';

export const runtime = 'edge';

export default function Service({ service }) {
  return <ServicePage service={service} />;
}