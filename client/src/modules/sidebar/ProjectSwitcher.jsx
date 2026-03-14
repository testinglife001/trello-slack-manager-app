// modules/sidebar/ProjectSwitcher.jsx
import { useEffect, useState } from "react";
import { request } from "../../api/client";
import { useNavigate } from "react-router-dom";
import { useProject } from "../../context/ProjectContext";
import { ChevronRight, Plus, Folder } from "lucide-react";
import CreateProjectModal from "../project/CreateProjectModal";

export default function ProjectSwitcher() {
  const [projects, setProjects] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { projectId } = useProject();

  useEffect(() => {
    const load = async () => {
      try {
        const data = await request("/projects");
        setProjects(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    load();
  }, []);

  return (
    <div className="mb-6 px-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Your Projects</h4>
        <button 
          onClick={() => setOpen(true)}
          className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-1">
        {projects.map(p => (
          <div
            key={p._id}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
              p._id === projectId 
                ? "bg-blue-50 text-blue-600 shadow-sm" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
            onClick={() => navigate(`/projects/${p._id}`)}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              p._id === projectId ? "bg-blue-600 text-white shadow-lg shadow-blue-100" : "bg-gray-100 text-gray-400 group-hover:bg-blue-100 group-hover:text-blue-600"
            }`}>
              <Folder size={16} />
            </div>
            <span className="text-sm font-bold tracking-tight truncate flex-1">{p.name}</span>
            <ChevronRight size={14} className={`transition-all ${p._id === projectId ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
          </div>
        ))}
      </div>

      {open && <CreateProjectModal onClose={() => setOpen(false)} />}
    </div>
  );
}
