// layouts/ProjectNavbar.jsx
import { useState } from "react";
import CreateBoardModal from "../modules/board/CreateBoardModal";
import CreateChannelModal from "../modules/chat/CreateChannelModal";
import { Menu, Plus, Sidebar, Sparkles, Layout, Hash } from "lucide-react";
import { useProject } from "../context/ProjectContext";

export default function ProjectNavbar({
  toggleSidebar,
  toggleCanvas,
  showCanvasButton
}) {
  const [boardOpen, setBoardOpen] = useState(false);
  const [channelOpen, setChannelOpen] = useState(false);
  const { project } = useProject();

  return (
    <div className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shrink-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-colors"
        >
          <Menu size={22} />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
             <Sparkles size={18} />
          </div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight italic uppercase">{project?.name || "Workspace"}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {showCanvasButton && (
          <button 
            onClick={toggleCanvas}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm shadow-indigo-100/50"
          >
            <Sidebar size={16} />
            Canvas
          </button>
        )}

        <div className="h-6 w-px bg-gray-100 mx-2"></div>

        <button 
          onClick={() => setBoardOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white hover:text-blue-600 hover:border-blue-200 border border-gray-100 transition-all shadow-sm"
        >
          <Layout size={16} />
          New Board
        </button>

        <button 
          onClick={() => setChannelOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <Plus size={16} />
          New Channel
        </button>
      </div>

      {boardOpen && <CreateBoardModal onClose={() => setBoardOpen(false)} />}
      {channelOpen && <CreateChannelModal onClose={() => setChannelOpen(false)} />}
    </div>
  );
}
