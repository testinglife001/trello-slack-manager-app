import React from 'react';
import { 
  Search, 
  LayoutDashboard, 
  Users, 
  ChevronDown, 
  Plus, 
  Monitor, 
  FileText, 
  UserPlus, 
  Settings,
  Calendar,
  Layers,
  CheckSquare,
  Globe,
  Palette,
  Megaphone,
  Terminal,
  Video,
  FileBarChart,
  Target,
  Smartphone,
  Cpu,
  Mail
} from 'lucide-react';
import { clsx } from 'clsx';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-[#1e2640] text-gray-300 flex flex-col border-r border-gray-700 select-none">
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-[#1e2640] font-bold">G</div>
          <div className="flex items-center gap-1 font-semibold text-white">
            GIM Agency
            <ChevronDown size={14} className="mt-0.5" />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide py-4">
        {/* Global Search */}
        <div className="px-4 mb-6">
          <div className="relative group">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full bg-gray-800/50 border border-transparent focus:border-blue-500/50 focus:bg-[#2a3454] rounded-md py-2 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-gray-500"
            />
          </div>
        </div>

        {/* My Work */}
        <div className="px-2 mb-6">
          <div className="flex items-center gap-2 px-3 py-2 text-yellow-500 font-medium">
            <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center text-[10px] text-[#1e2640] font-black">M</div>
            <span>My work</span>
          </div>
        </div>

        {/* Teams Section */}
        <div className="mb-6">
          <div className="px-4 mb-2 flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <ChevronDown size={14} />
              <span>Teams</span>
            </div>
            <Plus size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-0.5 px-2">
            <SidebarItem label="Marketing" />
            <SidebarItem label="Design" active />
            <SidebarItem label="Development" />
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-6">
          <div className="px-4 mb-2 flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <ChevronDown size={14} />
              <span>Projects</span>
            </div>
            <Plus size={14} className="text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-0.5 px-2">
            <SidebarItem label="Blog Post Writing" />
            <SidebarItem label="Employee Training" />
            <SidebarItem label="Video Recording" />
            <SidebarItem label="New Website" subItems={['Website Development', 'Website Translation']} />
            <SidebarItem label="Sales Funnel" />
            <SidebarItem label="Marketing campaign" active />
            <SidebarItem label="Mobile App" />
            <SidebarItem label="CRM Integration" />
            <SidebarItem label="Webinar" />
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-700/50 mt-auto">
        <button className="flex items-center gap-3 w-full px-3 py-2 hover:bg-white/10 rounded-lg transition-colors group">
          <UserPlus size={20} className="text-gray-400 group-hover:text-blue-400" />
          <span className="font-medium text-sm">Invite people</span>
        </button>
      </div>
    </div>
  );
};

const SidebarItem = ({ label, active, subItems }) => {
  return (
    <div>
      <div className={clsx(
        "flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm",
        active ? "bg-blue-600/20 text-white font-medium shadow-inner" : "hover:bg-white/5 hover:text-white"
      )}>
        <div className={clsx(
          "w-4 h-4 rounded-sm",
          label === 'Marketing' && "bg-orange-500",
          label === 'Design' && "bg-blue-500",
          label === 'Development' && "bg-green-500",
          label === 'Blog Post Writing' && "bg-purple-500",
          label === 'Marketing campaign' && "bg-blue-500",
          !['Marketing', 'Design', 'Development', 'Blog Post Writing', 'Marketing campaign'].includes(label) && "bg-gray-500/50"
        )} />
        <span className="flex-1 truncate">{label}</span>
        {subItems && <ChevronDown size={14} className="text-gray-500" />}
      </div>
      {subItems && (
        <div className="ml-9 mt-1 space-y-1 border-l border-gray-700/50 pl-3">
          {subItems.map((item, idx) => (
            <div key={idx} className="text-xs py-1.5 hover:text-white cursor-pointer transition-colors text-gray-500">
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Sidebar;
