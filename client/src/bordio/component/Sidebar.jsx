import React from 'react';
import { 
  Home, 
  Layers, 
  Users, 
  Hash, 
  Layout, 
  FileText, 
  UserPlus, 
  ChevronRight,
  MoreVertical,
  Plus
} from 'lucide-react';

const Sidebar = () => {
  const sections = [
    {
      title: 'Tools',
      items: [
        { icon: Layout, label: 'Dashboard', count: null },
        { icon: Home, label: 'My work', count: null },
      ],
    },
    {
      title: 'Teams',
      items: [
        { label: 'Marketing', color: 'bg-blue-400' },
        { label: 'Design', color: 'bg-pink-400' },
        { label: 'Development', color: 'bg-yellow-400' },
      ],
    },
    {
      title: 'Projects',
      items: [
        { label: 'Blog Post Writing', color: 'bg-purple-400' },
        { label: 'Employee Training', color: 'bg-indigo-400' },
        { label: 'Video Recording', color: 'bg-red-400' },
        { label: 'New Website', color: 'bg-green-400', subItems: [
          'Website Development',
          'Website Translation'
        ]},
        { label: 'Sales Funnel', color: 'bg-orange-400' },
        { label: 'Marketing campaign', color: 'bg-blue-500' },
        { label: 'Mobile App', color: 'bg-teal-400' },
        { label: 'CRM Integration', color: 'bg-cyan-400' },
      ],
    }
  ];

  return (
    <div className="w-64 bg-[#1e2640] text-[#a3abb8] flex flex-col h-full shrink-0 select-none">
      {/* Brand */}
      <div className="p-5 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
          G
        </div>
        <span className="text-white font-semibold text-lg">GM Agency</span>
        <MoreVertical className="ml-auto w-4 h-4 cursor-pointer hover:text-white transition-colors" />
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-2 space-y-6 scrollbar-hide py-4">
        {sections.map((section, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5b668a]">
                {section.title}
              </span>
              {section.title === 'Projects' && <Plus className="w-3 h-3 cursor-pointer" />}
            </div>
            
            <div className="space-y-1">
              {section.items.map((item, iIdx) => (
                <div key={iIdx}>
                  <div className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 group hover:bg-[#2d3a5a] hover:text-white ${item.label === 'Marketing campaign' ? 'bg-[#2d3a5a] text-white' : ''}`}>
                    {item.icon ? (
                      <item.icon className="w-4 h-4" />
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${item.color || 'bg-gray-400'}`} />
                    )}
                    <span className="text-sm font-medium flex-1 truncate">{item.label}</span>
                    {item.subItems && <ChevronRight className="w-4 h-4" />}
                  </div>
                  {item.subItems && (
                    <div className="ml-8 mt-1 space-y-1 border-l border-[#2d3a5a]">
                      {item.subItems.map((sub, sIdx) => (
                        <div key={sIdx} className="px-3 py-1.5 text-xs font-medium cursor-pointer hover:text-white truncate">
                          {sub}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 mt-auto border-t border-[#2d3a5a]">
        <button className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#2d3a5a] text-white rounded-lg text-sm font-semibold hover:bg-blue-600 transition-colors">
          <UserPlus className="w-4 h-4" />
          Invite people
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
