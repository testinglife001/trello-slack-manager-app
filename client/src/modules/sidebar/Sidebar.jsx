// modules/sidebar/Sidebar.jsx
import { useProject } from "../../context/ProjectContext";
import ProjectSwitcher from "./ProjectSwitcher";
import SidebarSearch from "./SidebarSearch";
import PinSection from "./PinSection";
import BoardList from "./BoardList";
import ChannelList from "./ChannelList";
import CanvasChannelList from "./CanvasChannelList"; // Make sure this is created
import { NavLink } from "react-router-dom";
import { Activity, Layout, Hash } from "lucide-react";

export default function Sidebar() {
  const { project } = useProject();

  return (
    <div className="sidebar">
      <ProjectSwitcher />

      {project && (
        <>
          <SidebarSearch />
          <PinSection />
          <BoardList />
          <ChannelList 
          />
          
          {/* Canvas Channels Section */}
          <CanvasChannelList />

          {/* Project Activity Link */}
          <div className="mb-6 px-4">
             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Project</h4>
             <NavLink
               to="activity"
               className={({ isActive }) => 
                 `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${isActive ? "bg-blue-50 text-blue-600 shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`
               }
             >
               <Activity size={16} className="text-gray-400 group-hover:text-blue-500" />
               <span className="text-sm font-bold tracking-tight">Project Activity</span>
             </NavLink>
          </div>
        </>
      )}
    </div>
  );
}
