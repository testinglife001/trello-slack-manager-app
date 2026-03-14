import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MoreHorizontal,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

const tasks = [
  { id: 1, title: 'Define target audiences for this campaign', status: 'In Progress', type: 'Operational', dueDate: '10 Apr 2024', estTime: '1h', responsible: 'Sofia Brown' },
  { id: 2, title: 'Develop campaign messaging draft', status: 'In Progress', type: 'Operational', dueDate: '11 Apr 2024', estTime: '45m', responsible: 'Anastasia Novak' },
  { id: 3, title: 'Reach Consensus on campaign messaging', status: 'Feedback', type: 'Important', dueDate: '-', estTime: '1h', responsible: 'Marry Williams' },
  { id: 4, title: 'Design campaign creative (general)', status: 'In Progress', type: 'Design', dueDate: '11 Apr 2024', estTime: '3h', responsible: 'Michael Martinez' },
  { id: 5, title: 'Design a landing page', status: 'In Progress', type: 'Design', dueDate: '13 Apr 2024', estTime: '7h', responsible: 'Michael Martinez' },
  { id: 6, title: 'Develop a landing page', status: 'In Progress', type: 'Operational', dueDate: '16 Apr 2024', estTime: '7h', responsible: 'David Thomas' },
  { id: 7, title: 'Test the Landing page', status: 'Blocked', type: 'Important', dueDate: '-', estTime: '1h 30m', responsible: 'Sofia Brown' },
  { id: 8, title: 'Contact Outdoor vendor and request a proposal', status: 'In Progress', type: 'High priority', dueDate: '12 Apr 2024', estTime: '2h', responsible: 'Sofia Brown' },
  { id: 9, title: 'Design Facebook banners', status: 'In Progress', type: 'Design', dueDate: '13 Apr 2024', estTime: '2h', responsible: 'Michael Martinez' },
  { id: 10, title: 'Design Google Ads banners', status: 'In Progress', type: 'Design', dueDate: '13 Apr 2024', estTime: '1h 30m', responsible: 'Michael Martinez' },
];

const TableView = ({ onTaskClick }) => {
  return (
    <div className="flex-1 overflow-auto bg-white">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-gray-100 text-gray-400 text-xs uppercase tracking-wider font-medium">
            <th className="px-6 py-4 font-medium w-12">
              <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </th>
            <th className="px-4 py-4 font-medium">Task name</th>
            <th className="px-4 py-4 font-medium">Status</th>
            <th className="px-4 py-4 font-medium">Type</th>
            <th className="px-4 py-4 font-medium">Due date</th>
            <th className="px-4 py-4 font-medium">Est. time</th>
            <th className="px-4 py-4 font-medium">Responsible</th>
            <th className="px-4 py-4 font-medium w-10"></th>
          </tr>
        </thead>
        <tbody className="text-sm">
          <tr className="bg-gray-50/50">
            <td colSpan="8" className="px-6 py-3">
              <div className="flex items-center gap-2 font-semibold text-gray-700">
                <ChevronDown size={16} className="text-gray-400" />
                <span>Active tasks</span>
                <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded-full ml-1">20</span>
              </div>
            </td>
          </tr>
          {tasks.map((task) => (
            <tr 
              key={task.id} 
              onClick={() => onTaskClick && onTaskClick(task)}
              className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group cursor-pointer"
            >              <td className="px-6 py-3.5">
                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              </td>
              <td className="px-4 py-3.5 font-medium text-gray-700">
                <div className="flex items-center gap-3">
                  <span className="group-hover:text-blue-600 transition-colors">{task.title}</span>
                  {task.status === 'Feedback' && (
                    <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">Feedback</span>
                  )}
                  {task.status === 'Blocked' && (
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">Blocked</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                   <div className={clsx(
                     "w-1.5 h-1.5 rounded-full",
                     task.status === 'In Progress' && "bg-blue-400",
                     task.status === 'Feedback' && "bg-purple-400",
                     task.status === 'Blocked' && "bg-red-400"
                   )} />
                   <span className="text-gray-600">{task.status}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-gray-500">
                <div className="flex items-center gap-2">
                  <div className={clsx(
                    "w-4 h-4 rounded-md",
                    task.type === 'Operational' && "bg-blue-100",
                    task.type === 'Important' && "bg-orange-100",
                    task.type === 'Design' && "bg-pink-100",
                    task.type === 'High priority' && "bg-red-100"
                  )} />
                  <span>{task.type}</span>
                </div>
              </td>
              <td className="px-4 py-3.5 text-gray-500">
                <div className="flex items-center gap-2">
                  {task.dueDate !== '-' ? <span className="text-gray-700">{task.dueDate}</span> : <Clock size={14} className="text-gray-300" />}
                </div>
              </td>
              <td className="px-4 py-3.5 text-gray-500">{task.estTime}</td>
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?u=${task.responsible}`} alt="" />
                  </div>
                  <span className="text-gray-600">{task.responsible}</span>
                </div>
              </td>
              <td className="px-4 py-3.5">
                <button className="p-1 hover:bg-gray-100 rounded text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
