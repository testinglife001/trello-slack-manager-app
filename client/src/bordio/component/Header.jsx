import React from 'react';
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

const Header = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { name: 'Table view', icon: TableIcon },
    { name: 'Kanban board', icon: KanbanIcon },
    { name: 'Calendar', icon: CalendarIcon },
    { name: 'Task Detail', icon: LayoutGrid }, // Using Task Detail as one of the tabs for easy navigation
    { name: 'Gantt', icon: GanttChartSquare },
  ];

  return (
    <div className="h-14 border-b border-gray-200 bg-white flex items-center px-4 justify-between shrink-0 select-none">
      <div className="flex items-center gap-4 h-full">
        {/* Tools Button */}
        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-600">
          <LayoutGrid className="w-4 h-4" />
          Tools
        </button>

        {/* Add Task Button */}
        <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-md text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" />
          Add task
        </button>

        {/* Tabs */}
        <div className="flex items-center h-full ml-4">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`h-full px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.name 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.name ? 'text-blue-500' : 'text-gray-400'}`} />
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="pl-9 pr-4 py-1.5 bg-gray-100 border-none rounded-md text-sm w-48 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Filter */}
        <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-medium">
          <SlidersHorizontal className="w-4 h-4" />
          Filter
        </button>

        {/* Notifications */}
        <div className="relative cursor-pointer group">
          <Bell className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full font-bold">
            5
          </span>
        </div>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded-md transition-colors">
          <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white font-bold text-xs">
            JD
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
};

export default Header;
