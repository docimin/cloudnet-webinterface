import dynamic from 'next/dynamic'

const TaskPageTemplates = dynamic(() => import('@/components/tasks/taskPageTemplates'), {
  ssr: false,
})
export const runtime = 'edge';

export default function Service({ task }) {
  return <TaskPageTemplates service={task} />;
}