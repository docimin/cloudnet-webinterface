import NodePage from '@/components/nodes/nodePage';

export const runtime = 'edge';

export default function Node({ node }) {
  return <NodePage node={node} />;
}