import React from 'react';
import { 
  MoreHorizontal, 
  Plus, 
  ChevronDown,
  Clock,
  MessageSquare,
  Paperclip
} from 'lucide-react';
import { clsx } from 'clsx';

const columns = [
  { id: 'scheduled', label: 'Scheduled', count: 5, color: 'bg-gray-100' },
  { id: 'in-progress', label: 'In progress', count: 3, color: 'bg-blue-100' },
  { id: 'under-review', label: 'Under Review', count: 2, color: 'bg-orange-100' },
  { id: 'completed', label: 'Completed', count: 12, color: 'bg-green-100' },
];

const tasks = [
  { id: 1, columnId: 'scheduled', title: 'Develop campaign messaging draft', type: 'Operational', priority: 'Low', responsible: 'Anastasia Novak' },
  { id: 2, columnId: 'scheduled', title: 'Contact Outdoor vendor and request a proposal', type: 'High priority', priority: 'High', responsible: 'Sofia Brown' },
  { id: 3, columnId: 'in-progress', title: 'Design a landing page', type: 'Design', priority: 'Medium', responsible: 'Michael Martinez', subtasks: '0/4', attachments: 2 },
  { id: 4, columnId: 'in-progress', title: 'Write ad copy for Facebook ads', type: 'Design', priority: 'Medium', responsible: 'Anastasia Novak' },
  { id: 5, columnId: 'under-review', title: 'Design campaign creative (general)', type: 'Design', priority: 'Medium', responsible: 'Michael Martinez' },
  { id: 6, columnId: 'completed', title: 'Define target audiences for this campaign', type: 'Operational', priority: 'Low', responsible: 'Sofia Brown' },
];

const KanbanView = ({ onTaskClick }) => {
  return (
    <div className="flex-1 overflow-x-auto bg-gray-50/50 p-6">
      <div className="flex gap-6 h-full min-w-max">
        {columns.map((column) => (
          <div key={column.id} className="w-80 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700 text-sm">{column.label}</span>
                <span className="text-gray-400 text-xs font-medium bg-white px-2 py-0.5 rounded-full border border-gray-200 shadow-sm">{column.count}</span>
              </div>
              <div className="flex items-center gap-1">
                <button className="p-1 hover:bg-gray-200 rounded text-gray-400"><Plus size={16} /></button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-400"><MoreHorizontal size={16} /></button>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {tasks.filter(t => t.columnId === column.id).map((task) => (
                <div 
                  key={task.id} 
                  onClick={() => onTaskClick && onTaskClick(task)}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
                >                  <div className="flex items-start justify-between mb-3">
                    <div className={clsx(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded",
                      task.type === 'Operational' && "bg-blue-50 text-blue-600",
                      task.type === 'Design' && "bg-pink-50 text-pink-600",
                      task.type === 'High priority' && "bg-red-50 text-red-600",
                    )}>
                      {task.type}
                    </div>
                    <button className="p-1 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={14} />
                    </button>
                  </div>
                  
                  <h4 className="text-sm font-semibold text-gray-800 mb-4 line-clamp-2 leading-snug">
                    {task.title}
                  </h4>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-3 text-gray-400 text-xs">
                       {task.subtasks && (
                         <div className="flex items-center gap-1">
                           <Clock size={12} />
                           <span>{task.subtasks}</span>
                         </div>
                       )}
                       {task.attachments && (
                         <div className="flex items-center gap-1">
                           <Paperclip size={12} />
                           <span>{task.attachments}</span>
                         </div>
                       )}
                    </div>
                    
                    <div className="w-6 h-6 rounded-full bg-gray-100 border border-white shadow-sm overflow-hidden">
                       <img src={`https://i.pravatar.cc/100?u=${task.responsible}`} alt="" />
                    </div>
                  </div>
                </div>
              ))}
              <button className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/30 transition-all text-sm font-medium">
                <Plus size={16} />
                <span>Add task</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default KanbanView;
