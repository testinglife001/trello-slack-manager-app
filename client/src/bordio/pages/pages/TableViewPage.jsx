import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  ChevronDown, 
  ChevronRight, 
  MoreHorizontal, 
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  Pause
} from 'lucide-react';
import { request } from '../../../api/client';

const TableViewPage = () => {
  const { boardId } = useParams();
  const activeBoardId = boardId || '6992477995434ce6c19991ce';

  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collapsedLists, setCollapsedLists] = useState({});

  const loadBoard = useCallback(async () => {
    try {
      const data = await request(`/boards/${activeBoardId}/full`);
      setLists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load board for table view', err);
    } finally {
      setLoading(false);
    }
  }, [activeBoardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Timer interval update
  useEffect(() => {
    const interval = setInterval(() => {
      setLists(prev => prev.map(list => ({
        ...list,
        cards: list.cards.map(card => {
          if (card.isTimerRunning && card.timerStartedAt) {
            const now = new Date();
            const start = new Date(card.timerStartedAt);
            const extraSeconds = Math.floor((now - start) / 1000);
            return { ...card, displayTimeTracked: (card.timeTracked || 0) + extraSeconds };
          }
          return { ...card, displayTimeTracked: card.timeTracked };
        })
      })));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleTimer = async (taskId) => {
    try {
      await request(`/cards/${taskId}/toggle-timer`, { method: 'POST' });
      loadBoard();
    } catch (err) {
      console.error('Failed to toggle timer', err);
    }
  };

  const toggleList = (listId) => {
    setCollapsedLists(prev => ({ ...prev, [listId]: !prev[listId] }));
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0s';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-gray-400 italic">
        Loading tasks...
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white overflow-auto select-none">
      <div className="min-w-[1000px]">
        {/* Table Header */}
        <div className="flex items-center px-6 py-3 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-50/30 sticky top-0 z-10 backdrop-blur-sm">
          <div className="flex-1">Task name</div>
          <div className="w-40">Status</div>
          <div className="w-32">Priority</div>
          <div className="w-32">Due date</div>
          <div className="w-24 text-center">Timer</div>
          <div className="w-40">Responsible</div>
          <div className="w-10"></div>
        </div>

        {/* Table Content */}
        <div className="pb-10">
          {lists.map((list) => (
            <div key={list._id}>
              {/* Section Header */}
              <div 
                onClick={() => toggleList(list._id)}
                className="flex items-center px-4 py-2 bg-gray-50/50 border-b border-gray-100 group cursor-pointer hover:bg-gray-100 transition-colors"
              >
                {collapsedLists[list._id] ? (
                  <ChevronRight className="w-4 h-4 text-gray-400 mr-2" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400 mr-2" />
                )}
                <span className="text-xs font-bold text-gray-700 mr-2 uppercase tracking-wide">{list.name}</span>
                <span className="text-[10px] bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">
                  {list.cards?.length || 0}
                </span>
                <Plus className="w-3.5 h-3.5 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Tasks */}
              {!collapsedLists[list._id] && (
                <div className="animate-in fade-in slide-in-from-top-1 duration-200">
                  {list.cards?.map((card) => {
                    const displayTime = card.displayTimeTracked || card.timeTracked || 0;
                    return (
                      <div 
                        key={card._id} 
                        className="flex items-center px-6 py-3 border-b border-gray-50 hover:bg-blue-50/30 transition-colors group cursor-pointer"
                      >
                        <div className="flex-1 flex items-center gap-3">
                          <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                            {list.name.toLowerCase().includes('done') || list.name.toLowerCase().includes('complete') ? (
                              <CheckCircle2 className="w-4 h-4 text-green-500" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </div>
                          <span className={`text-sm font-medium ${
                            (list.name.toLowerCase().includes('done') || list.name.toLowerCase().includes('complete')) 
                            ? 'text-gray-400 line-through' 
                            : 'text-gray-700'
                          }`}>
                            {card.title}
                          </span>
                        </div>
                        
                        <div className="w-40">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            list.name.toLowerCase().includes('progress') ? 'bg-orange-50 text-orange-600' :
                            list.name.toLowerCase().includes('review') ? 'bg-purple-50 text-purple-600' :
                            list.name.toLowerCase().includes('done') ? 'bg-green-50 text-green-600' :
                            'bg-blue-50 text-blue-600'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              list.name.toLowerCase().includes('progress') ? 'bg-orange-400' :
                              list.name.toLowerCase().includes('review') ? 'bg-purple-400' :
                              list.name.toLowerCase().includes('done') ? 'bg-green-400' :
                              'bg-blue-400'
                            }`} />
                            {list.name}
                          </div>
                        </div>

                        <div className="w-32">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                            card.priority === 'high' ? 'bg-red-50 text-red-600' :
                            card.priority === 'medium' ? 'bg-yellow-50 text-yellow-600' :
                            'bg-gray-100 text-gray-500'
                          }`}>
                            {card.priority || 'Normal'}
                          </span>
                        </div>

                        <div className="w-32 text-xs text-gray-500 flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          {card.dueDate ? new Date(card.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-'}
                        </div>

                        {/* Timer Column */}
                        <div className="w-24 flex items-center justify-center gap-2">
                           <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTimer(card._id);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${card.isTimerRunning ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-gray-50 text-gray-400 hover:bg-blue-50 hover:text-blue-600 opacity-0 group-hover:opacity-100'}`}
                          >
                            {card.isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
                          </button>
                          <span className={`text-[10px] font-black tabular-nums ${card.isTimerRunning ? 'text-blue-600 animate-pulse' : 'text-gray-400'}`}>
                            {formatTime(displayTime)}
                          </span>
                        </div>

                        <div className="w-40 flex items-center gap-2">
                          {card.assignees && card.assignees.length > 0 ? (
                            <>
                              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold border-2 border-white">
                                {card.assignees[0].name?.charAt(0) || 'U'}
                              </div>
                              <span className="text-xs text-gray-600 truncate">{card.assignees[0].name || 'User'}</span>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Unassigned</span>
                          )}
                        </div>

                        <div className="w-10 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {lists.length === 0 && !loading && (
             <div className="p-10 text-center text-gray-400 italic">
               No lists found for this board.
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TableViewPage;
