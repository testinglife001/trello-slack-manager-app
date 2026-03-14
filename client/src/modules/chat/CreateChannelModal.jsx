// modules/chat/CreateChannelModal.jsx
import { useState } from "react";
import { request } from "../../api/client";
import { useProject } from "../../context/ProjectContext";
import Modal from "../../components/ui/Modal";
import { Hash, Sparkles, X, Loader2, Lock, Globe } from "lucide-react";
import { clsx } from "clsx";

export default function CreateChannelModal({ onClose }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("public");
  const [loading, setLoading] = useState(false);
  const { projectId } = useProject();

  const create = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await request("/channels", {
        method: "POST",
        body: JSON.stringify({ 
          name: name.trim().toLowerCase().replace(/\s+/g, '-'), 
          type,
          project: projectId 
        })
      });
      onClose();
      window.location.reload();
    } catch (err) {
      console.error("Failed to create channel:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className="p-8 bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                 <Hash size={20} />
              </div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight italic uppercase">New Channel</h2>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
              <X size={20} />
           </button>
        </div>

        <form onSubmit={create} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
              Channel Name
            </label>
            <div className="relative group">
               <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold">#</span>
               <input 
                 autoFocus
                 className="w-full pl-10 pr-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 focus:bg-white transition-all outline-none placeholder:text-gray-300"
                 placeholder="e.g. design-team"
                 value={name} 
                 onChange={e => setName(e.target.value)} 
               />
            </div>
            <p className="mt-2 text-[10px] text-gray-400 px-1 font-medium">Names must be lowercase and contain no spaces.</p>
          </div>

          <div>
             <label className="block text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-3 px-1">
               Privacy
             </label>
             <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('public')}
                  className={clsx(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                    type === 'public' ? "border-indigo-600 bg-indigo-50/50" : "border-gray-100 bg-white hover:border-gray-200"
                  )}
                >
                   <Globe size={18} className={type === 'public' ? "text-indigo-600" : "text-gray-400"} />
                   <span className={clsx("text-xs font-black uppercase tracking-widest", type === 'public' ? "text-indigo-600" : "text-gray-400")}>Public</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('private')}
                  className={clsx(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all",
                    type === 'private' ? "border-indigo-600 bg-indigo-50/50" : "border-gray-100 bg-white hover:border-gray-200"
                  )}
                >
                   <Lock size={18} className={type === 'private' ? "text-indigo-600" : "text-gray-400"} />
                   <span className={clsx("text-xs font-black uppercase tracking-widest", type === 'private' ? "text-indigo-600" : "text-gray-400")}>Private</span>
                </button>
             </div>
          </div>

          <button 
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-indigo-100 text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Create Channel
                <Sparkles size={16} className="ml-2 group-hover:rotate-12 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </Modal>
  );
}
