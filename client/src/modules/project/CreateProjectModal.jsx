// modules/project/CreateProjectModal.jsx
import { useState } from "react";
import { request } from "../../api/client";
import Modal from "../../components/ui/Modal";
import { FolderPlus, Sparkles, X, Loader2 } from "lucide-react";

export default function CreateProjectModal({ onClose }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      const data = await request("/projects", {
        method: "POST",
        body: JSON.stringify({ name: name.trim() })
      });
      onClose();
      // Redirect to the new project or reload
      if (data && data._id) {
        window.location.href = `/projects/${data._id}`;
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-8 bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-100">
                 <FolderPlus size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight italic uppercase">New Project</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
              <X size={20} />
           </button>
        </div>

        <form onSubmit={create} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
              Project Title
            </label>
            <input 
              autoFocus
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 focus:bg-white transition-all outline-none placeholder:text-gray-300"
              placeholder="e.g. Mobile App Redesign"
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-emerald-100 text-sm font-black text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Initialize Project
                <Sparkles size={16} className="ml-2 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
}
