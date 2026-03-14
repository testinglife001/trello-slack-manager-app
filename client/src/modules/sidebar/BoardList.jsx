// modules/sidebar/BoardList.jsx
import { useEffect, useState } from "react";
import { request } from "../../api/client";
import { useProject } from "../../context/ProjectContext";
import { useNavigate, useParams } from "react-router-dom";
import { Layout, Plus, ChevronRight } from "lucide-react";
import CreateBoardModal from "../board/CreateBoardModal";

export default function BoardList() {
  const { projectId } = useProject();
  const { boardId } = useParams();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await request(`/boards/project/${projectId}`);
        setBoards(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load boards", err);
      }
    };
    if (projectId) load();
  }, [projectId]);

  return (
    <div className="mb-6 px-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Project Boards</h4>
        <button 
          onClick={() => setOpen(true)}
          className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-1">
        {boards.map(b => (
          <div
            key={b._id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
              b._id === boardId 
                ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => navigate(`/projects/${projectId}/boards/${b._id}`)}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              b._id === boardId ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
            }`}>
              <Layout size={14} />
            </div>
            <span className="text-sm font-bold tracking-tight truncate flex-1">{b.name}</span>
            <ChevronRight size={14} className={`transition-all ${b._id === boardId ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
          </div>
        ))}

        {boards.length === 0 && (
          <p className="px-3 py-4 text-[10px] font-black text-gray-300 uppercase tracking-widest text-center border-2 border-dashed border-gray-50 rounded-2xl italic">
            No boards created
          </p>
        )}
      </div>

      {open && <CreateBoardModal onClose={() => setOpen(false)} />}
    </div>
  );
}
