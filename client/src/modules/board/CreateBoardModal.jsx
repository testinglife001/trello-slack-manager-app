// modules/board/CreateBoardModal.jsx
import { useState } from "react";
import { request } from "../../api/client";
import { useProject } from "../../context/ProjectContext";
import Modal from "../../components/ui/Modal";
import { Layout, Sparkles, X, Loader2 } from "lucide-react";

export default function CreateBoardModal({ onClose }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { projectId } = useProject();

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await request("/boards", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          project: projectId
        })
      });
      onClose();
      // Optional: trigger a refresh or notification
      window.location.reload(); 
    } catch (err) {
      console.error("Failed to create board:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-8 bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
                 <Layout size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight italic uppercase">Create Board</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
              <X size={20} />
           </button>
        </div>

        <form onSubmit={create} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
              Board Name
            </label>
            <input 
              autoFocus
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white transition-all outline-none placeholder:text-gray-300"
              placeholder="e.g. Q1 Marketing Campaign"
              value={name} 
              onChange={e => setName(e.target.value)} 
            />
          </div>

          <button 
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-blue-100 text-sm font-black text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Create Board
                <Sparkles size={16} className="ml-2 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
}
