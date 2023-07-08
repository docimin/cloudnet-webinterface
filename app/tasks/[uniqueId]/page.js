import TaskPage from '@/components/tasks/taskPage';

export const runtime = 'edge';

export default function Service({ task }) {
  return <TaskPage service={task} />;
}