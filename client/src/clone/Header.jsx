import React from 'react';
import { 
  Plus, 
  Search, 
  Users, 
  Filter, 
  LayoutGrid, 
  Bell,
  MoreHorizontal,
  Table as TableIcon,
  Columns as KanbanIcon,
  Calendar as CalendarIcon,
  List as ListIcon,
  ChevronDown
} from 'lucide-react';
import { clsx } from 'clsx';

const Header = ({ activeView, onViewChange }) => {
  const views = [
    { id: 'list', label: 'List', icon: ListIcon },
    { id: 'table', label: 'Table view', icon: TableIcon },
    { id: 'kanban', label: 'Kanban board', icon: KanbanIcon },
    { id: 'calendar', label: 'Calendar', icon: CalendarIcon },
  ];

  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 sticky top-0 z-10">
      {/* Left Section: Navigation & Views */}
      <div className="flex items-center gap-6 h-full">
        <div className="flex items-center gap-2 text-gray-500 font-medium border-r border-gray-200 pr-4 h-8">
          <span className="text-sm">Tools</span>
        </div>

        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} />
          <span>Add new</span>
        </button>

        <div className="flex items-center h-full">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={clsx(
                "flex items-center gap-2 px-4 h-full text-sm font-medium transition-all relative group",
                activeView === view.id ? "text-blue-600" : "text-gray-500 hover:text-gray-800"
              )}
            >
              <view.icon size={16} className={clsx(activeView === view.id ? "text-blue-600" : "text-gray-400")} />
              <span>{view.label}</span>
              {activeView === view.id && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Section: Actions & Profile */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1 text-gray-400">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Search size={18} />
          </button>
          <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium text-gray-600">
            <LayoutGrid size={18} />
            <span>Group</span>
          </button>
          <button className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-sm font-medium text-gray-600">
            <Filter size={18} />
            <span>Filter</span>
          </button>
        </div>

        <div className="flex items-center -space-x-2 ml-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden ring-1 ring-gray-100">
              <img 
                src={`https://i.pravatar.cc/150?u=${i}`} 
                alt="Avatar" 
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold ring-1 ring-gray-100">
            +12
          </div>
        </div>

        <div className="flex items-center gap-3 ml-2 border-l border-gray-200 pl-4">
          <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
          </button>
          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs cursor-pointer hover:ring-2 hover:ring-orange-200 transition-all">
            SB
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
