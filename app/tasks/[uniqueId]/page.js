import dynamic from 'next/dynamic'

const TaskPage = dynamic(() => import('@/components/tasks/taskPage'), {
  ssr: false,
})
export const runtime = 'edge';

export default function Service({ task }) {
  return <TaskPage service={task} />;
}