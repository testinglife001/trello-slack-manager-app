import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Search, 
  Hash, 
  Layout, 
  FileText, 
  Command, 
  ArrowRight,
  Loader2,
  Clock,
  User,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { request } from '../../../api/client';

const CommandPalette = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Search logic
  const performSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      // Use existing search endpoint
      const data = await request(`/search?q=${encodeURIComponent(q)}`);
      setResults(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query) performSearch(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  const handleSelect = (item) => {
    onClose();
    if (item.type === 'card') {
      // Go to task detail in current project if possible
      navigate(`/dashboard-v/${item.project}/${item.board}/tasks/${item._id}`);
    } else if (item.type === 'channel') {
      navigate(`/projects/${item.project}/channels/${item._id}`);
    }
  };

  const getIcon = (type) => {
    switch (item.type) {
      case 'card': return <FileText className="w-4 h-4" />;
      case 'channel': return <Hash className="w-4 h-4" />;
      default: return <Layout className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#1e2640]/40 backdrop-blur-sm"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl shadow-blue-900/20 border border-gray-100 overflow-hidden"
          >
            <div className="flex items-center px-5 py-4 border-b border-gray-100">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, channels, boards..."
                className="flex-1 bg-transparent border-none outline-none text-base font-medium text-gray-800 placeholder-gray-400"
              />
              <div className="flex items-center gap-1 ml-3 px-1.5 py-0.5 bg-gray-100 rounded-md">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tighter">ESC</span>
              </div>
            </div>

            <div className="max-h-[60vh] overflow-y-auto py-2 scrollbar-hide">
              {loading && results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-2 opacity-50" />
                  <span className="text-xs font-bold uppercase tracking-widest">Searching Knowledge Base...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="px-2">
                  <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Search Results</div>
                  {results.map((item, idx) => (
                    <div
                      key={item._id}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${idx === selectedIndex ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${idx === selectedIndex ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'}`}>
                        {item.type === 'card' ? <FileText className="w-4 h-4" /> : 
                         item.type === 'channel' ? <Hash className="w-4 h-4" /> : 
                         <Layout className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate leading-none mb-1">{item.title || item.name}</div>
                        <div className="text-[10px] font-medium opacity-60 uppercase tracking-tight flex items-center gap-2">
                           <span>{item.type}</span>
                           {item.boardName && <span>• {item.boardName}</span>}
                        </div>
                      </div>
                      {idx === selectedIndex && (
                        <motion.div layoutId="arrow" className="text-blue-500">
                          <ArrowRight className="w-4 h-4" />
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              ) : query ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Search className="w-8 h-8 mb-2 opacity-20" />
                  <span className="text-xs font-bold uppercase tracking-widest">No matching records found</span>
                </div>
              ) : (
                <div className="px-4 py-2 space-y-4">
                   <div>
                      <div className="px-3 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Quick Actions</div>
                      <div className="grid grid-cols-2 gap-2">
                         <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all group">
                            <Plus className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                            <span className="text-xs font-bold">New Task</span>
                         </div>
                         <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all group">
                            <Clock className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
                            <span className="text-xs font-bold">Recent History</span>
                         </div>
                      </div>
                   </div>
                   <div className="bg-blue-600 rounded-2xl p-6 text-white overflow-hidden relative">
                      <div className="relative z-10">
                         <div className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">Pro Tip</div>
                         <div className="text-sm font-bold leading-tight max-w-[200px]">Use keywords like "High" or "Overdue" to filter results.</div>
                      </div>
                      <Command className="w-32 h-32 absolute -right-8 -bottom-8 opacity-10 rotate-12" />
                   </div>
                </div>
              )}
            </div>

            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3 rotate-90" /> Navigate</div>
                  <div className="flex items-center gap-1.5"><ArrowRight className="w-3 h-3 rotate-180" /> Select</div>
               </div>
               <div>GM Hybrid Workspace</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
