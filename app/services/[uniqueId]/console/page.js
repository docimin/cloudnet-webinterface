import ServiceConsole from '@/components/services/serviceConsole';

export const runtime = 'edge';

export default function Service({ service }) {
  return <ServiceConsole service={service} />;
}