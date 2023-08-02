import PlayersOnline from "@/components/players/playersOnline";
import PlayersRegistered from "@/components/players/playersRegistered";
import ServiceCount from "@/components/services/serviceCount";
import NodeCount from "@/components/nodes/nodeCount";
import TaskCount from "@/components/tasks/taskCount";

const stats = [
  { name: 'Players Online', value: <PlayersOnline /> },
  { name: 'Players Registered', value: <PlayersRegistered /> },
  { name: 'Total Services', value: <ServiceCount /> },
  { name: 'Total Nodes', value: <NodeCount /> },
  { name: 'Total Tasks', value: <TaskCount /> },
]

export default function Home() {
  return (
    <div className="">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-2 bg-white/5 sm:grid-cols-5 lg:grid-cols-5">
          {stats.map((stat) => (
            <div key={stat.name} className="bg-gray-900 px-4 py-6 sm:px-6 lg:px-8 rounded-lg">
              <p className="text-sm font-medium leading-6 text-gray-400">{stat.name}</p>
              <p className="mt-2 flex items-baseline gap-x-2">
                <span className="text-4xl font-semibold tracking-tight text-white">{stat.value}</span>
                {stat.unit ? <span className="text-sm text-gray-400">{stat.unit}</span> : null}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}