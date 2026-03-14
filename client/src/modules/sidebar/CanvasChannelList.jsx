// modules/sidebar/CanvasChannelList.jsx
import { useEffect, useState } from "react";
import { request } from "../../api/client";
import { useProject } from "../../context/ProjectContext";
import { useNavigate, useParams, NavLink } from "react-router-dom";
import { Layout, ChevronRight, Sparkles, History, Box, Activity, Layers, PlayCircle } from "lucide-react";

export default function CanvasChannelList() {
  const { projectId } = useProject();
  const navigate = useNavigate();
  const { channelId: currentChannelId } = useParams();
  const [channels, setChannels] = useState([]);

  // =============================
  // LOAD CHANNELS
  // =============================
  useEffect(() => {
    const load = async () => {
      try {
        const data = await request(`/channels/project/${projectId}`);
        setChannels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load channels", err);
      }
    };
    if (projectId) load();
  }, [projectId]);

  return (
    <div className="mb-6 px-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Canvas Rooms</h4>
      </div>

      <div className="space-y-3">
        {channels.map(c => {
          const isActive = c._id === currentChannelId;

          return (
            <div key={c._id} className="space-y-1">
              {/* Main Canvas link for this channel */}
              <div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
                  isActive 
                    ? "bg-blue-50 text-blue-600 shadow-sm" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
                onClick={() => navigate(`/projects/${projectId}/canvas/${c._id}`)}
              >
                <div className="relative">
                   <Layout size={16} className={isActive ? "text-blue-600" : "text-gray-400 group-hover:text-blue-500"} />
                </div>
                
                <span className="text-sm font-bold tracking-tight truncate flex-1">{c.name} Canvas</span>
                
                <ChevronRight size={14} className={`transition-all ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
              </div>

              {/* Sub-links for deeper canvas features if active */}
              {isActive && (
                <div className="ml-8 space-y-1 mt-2 pb-2 border-l-2 border-blue-100 pl-4 transition-all animate-in slide-in-from-left duration-300">
                   {/* Sub-menu Header */}
                   <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">Canvas Tools</div>

                   <NavLink 
                     to={`/projects/${projectId}/canvas/${c._id}/playback`}
                     className={({isActive}) => `flex items-center gap-2 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                   >
                      <History size={12} />
                      <span>Playback</span>
                   </NavLink>

                   <NavLink 
                     to={`/projects/${projectId}/activity-canvas/${c._id}`}
                     className={({isActive}) => `flex items-center gap-2 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                   >
                      <Activity size={12} />
                      <span>Activity</span>
                   </NavLink>

                   <NavLink 
                     to={`/projects/${projectId}/my-canvas/${c._id}`}
                     className={({isActive}) => `flex items-center gap-2 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                   >
                      <Box size={12} />
                      <span>MyCanvas</span>
                   </NavLink>

                   <NavLink 
                     to={`/projects/${projectId}/my-canvas-ex/${c._id}`}
                     className={({isActive}) => `flex items-center gap-2 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                   >
                      <Sparkles size={12} />
                      <span>Extra View</span>
                   </NavLink>

                   <NavLink 
                     to={`/projects/${projectId}/my-canvas-ex-i/${c._id}`}
                     className={({isActive}) => `flex items-center gap-2 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                   >
                      <PlayCircle size={12} />
                      <span>View I</span>
                   </NavLink>

                   <NavLink 
                     to={`/projects/${projectId}/my-canvas-layout/${c._id}`}
                     className={({isActive}) => `flex items-center gap-2 py-1.5 text-[11px] font-black uppercase tracking-wider transition-all ${isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
                   >
                      <Layers size={12} />
                      <span>Layout</span>
                   </NavLink>
                </div>
              )}
            </div>
          );
        })}

        {channels.length === 0 && (
          <p className="px-3 py-4 text-[10px] font-black text-gray-300 uppercase tracking-widest text-center border-2 border-dashed border-gray-50 rounded-2xl italic">
            No canvases available
          </p>
        )}
      </div>
    </div>
  );
}
