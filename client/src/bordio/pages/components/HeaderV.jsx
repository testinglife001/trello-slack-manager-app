import React, { useState, useEffect } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Bell, 
  ChevronDown,
  LayoutGrid,
  Table as TableIcon,
  Columns as KanbanIcon,
  Calendar as CalendarIcon,
  GanttChartSquare
} from 'lucide-react';
import { request } from '../../../api/client';

const HeaderV = () => {
  const { projectId, boardId } = useParams();
  const [boardName, setBoardName] = useState('Loading...');

  useEffect(() => {
    if (boardId) {
      const fetchBoard = async () => {
        try {
          const data = await request(`/boards/${boardId}`);
          setBoardName(data?.name || 'Board');
        } catch (err) {
          setBoardName('Board');
        }
      };
      fetchBoard();
    }
  }, [boardId]);

  const tabs = [
    { name: 'Table', icon: TableIcon, path: 'table' },
    { name: 'Kanban', icon: KanbanIcon, path: 'kanban' },
    { name: 'Calendar', icon: CalendarIcon, path: 'calendar' },
    { name: 'Gantt', icon: GanttChartSquare, path: 'gantt' },
  ];

  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center px-4 justify-between shrink-0 select-none">
      <div className="flex items-center gap-4 h-full">
        {/* Board Title / Breadcrumb */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-md border border-gray-200">
           <LayoutGrid className="w-4 h-4 text-gray-500" />
           <span className="text-sm font-bold text-gray-700 truncate max-w-[150px]">
             {boardName}
           </span>
        </div>

        {/* Add Task Button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-semibold transition-colors shadow-sm active:scale-95">
          <Plus className="w-4 h-4" />
          Add task
        </button>

        {/* Tabs */}
        <div className="flex items-center h-full ml-4">
          {tabs.map((tab) => (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) => `h-full px-4 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
                isActive 
                ? 'border-blue-500 text-blue-600 bg-blue-50/30' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className={`w-4 h-4 transition-colors`} />
              {tab.name}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative group">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-1.5 bg-gray-100 border border-transparent rounded-md text-sm w-48 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-blue-200 outline-none transition-all"
          />
        </div>

        {/* Filter */}
        <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium transition-colors">
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </button>

        {/* Notifications */}
        <div className="relative cursor-pointer group p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <Bell className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold border-2 border-white">
            5
          </span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded-md transition-colors border border-transparent hover:border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
            JD
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default HeaderV;
