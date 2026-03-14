// modules/sidebar/SidebarSearch.jsx
import { useState } from "react";
import { Search, X } from "lucide-react";

export default function SidebarSearch() {
  const [q, setQ] = useState("");

  return (
    <div className="px-4 mb-6">
      <div className="relative group">
        <Search 
          size={16} 
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" 
        />
        <input
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white transition-all outline-none placeholder:text-gray-400"
          placeholder="Quick search..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        {q && (
          <button 
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
