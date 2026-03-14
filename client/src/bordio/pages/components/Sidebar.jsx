import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { 
  Home, 
  Layers, 
  Users, 
  Hash, 
  Layout, 
  FileText, 
  UserPlus, 
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Plus
} from 'lucide-react';
import { request } from '../../../api/client';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectId, boardId } = useParams();

  const [projects, setProjects] = useState([]);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [projectBoards, setProjectBoards] = useState({}); // { projectId: [boards] }

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await request('/projects');
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to fetch projects', err);
      }
    };
    fetchProjects();
  }, []);

  const toggleProject = async (pId) => {
    const isExpanded = !!expandedProjects[pId];
    setExpandedProjects(prev => ({ ...prev, [pId]: !isExpanded }));

    if (!isExpanded && !projectBoards[pId]) {
      try {
        const boards = await request(`/boards/project/${pId}`);
        setProjectBoards(prev => ({ ...prev, [pId]: boards }));
      } catch (err) {
        console.error('Failed to fetch boards', err);
      }
    }
  };

  const handleBoardClick = (pId, bId) => {
    // Determine the current view (kanban, table, calendar, etc.) from the path
    const currentView = location.pathname.split('/').pop() || 'kanban';
    // If we're on a base dashboard route, default to kanban
    const view = ['kanban', 'table', 'calendar', 'gantt'].includes(currentView) ? currentView : 'kanban';
    
    navigate(`/dashboard-v/${pId}/${bId}/${view}`);
  };

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
        {/* Tools Section */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5b668a]">Tools</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-[#2d3a5a] hover:text-white">
              <Layout className="w-4 h-4" />
              <span className="text-sm font-medium">Dashboard</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 hover:bg-[#2d3a5a] hover:text-white">
              <Home className="w-4 h-4" />
              <span className="text-sm font-medium">My work</span>
            </div>
          </div>
        </div>

        {/* Projects Section (Dynamic) */}
        <div>
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#5b668a]">Projects</span>
            <Plus className="w-3 h-3 cursor-pointer hover:text-white" />
          </div>
          
          <div className="space-y-1">
            {projects.map((project) => (
              <div key={project._id}>
                <div 
                  onClick={() => toggleProject(project._id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-200 group hover:bg-[#2d3a5a] hover:text-white ${projectId === project._id ? 'bg-[#2d3a5a] text-white' : ''}`}
                >
                  <div className={`w-2 h-2 rounded-full bg-blue-400`} />
                  <span className="text-sm font-medium flex-1 truncate">{project.name}</span>
                  {expandedProjects[project._id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </div>

                {expandedProjects[project._id] && (
                  <div className="ml-8 mt-1 space-y-1 border-l border-[#2d3a5a]">
                    {projectBoards[project._id]?.map((board) => (
                      <div 
                        key={board._id} 
                        onClick={() => handleBoardClick(project._id, board._id)}
                        className={`px-3 py-1.5 text-xs font-medium cursor-pointer hover:text-white truncate ${boardId === board._id ? 'text-white font-bold' : ''}`}
                      >
                        {board.name}
                      </div>
                    ))}
                    {!projectBoards[project._id] && <div className="px-3 py-1.5 text-[10px] italic">Loading...</div>}
                    {projectBoards[project._id]?.length === 0 && <div className="px-3 py-1.5 text-[10px] italic">No boards found</div>}
                  </div>
                )}
              </div>
            ))}
            {projects.length === 0 && <div className="px-3 py-2 text-xs italic">No projects found</div>}
          </div>
        </div>
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
