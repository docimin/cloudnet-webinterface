import dynamic from 'next/dynamic'

const NodePage = dynamic(() => import('@/components/nodes/nodePage'), {
  ssr: false,
})

export const runtime = 'edge';

export default function Node({ node }) {
  return <NodePage node={node} />;
}