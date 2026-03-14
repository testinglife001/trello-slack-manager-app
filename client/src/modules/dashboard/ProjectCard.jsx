import { useNavigate } from "react-router-dom";
import { Folder, MoreVertical, Users } from "lucide-react";

export default function ProjectCard({ project }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/projects/${project._id}`)}
      className="group bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all cursor-pointer relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="flex items-start justify-between mb-6">
        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          <Folder size={24} />
        </div>
        <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>

      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
        {project.name}
      </h3>
      <p className="text-gray-500 text-sm font-medium line-clamp-2 leading-relaxed mb-6">
        {project.description || "No description provided for this project."}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-50">
        <div className="flex -space-x-2">
           {[1,2,3].map(i => (
             <div key={i} className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                <img src={`https://i.pravatar.cc/100?u=proj${project._id}${i}`} alt="" className="w-full h-full object-cover" />
             </div>
           ))}
           <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-bold text-gray-400">+2</div>
        </div>
        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-[10px] uppercase tracking-wider">
           <Users size={12} />
           <span>Team Only</span>
        </div>
      </div>
    </div>
  );
}
