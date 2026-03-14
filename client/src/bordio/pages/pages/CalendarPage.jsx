import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, Plus, Clock } from 'lucide-react';
import dayjs from 'dayjs';
import { request } from '../../../api/client';

const CalendarPage = () => {
  const { boardId } = useParams();
  const activeBoardId = boardId || '6992477995434ce6c19991ce';

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request(`/boards/${activeBoardId}/full`);
      setLists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load board for calendar', err);
    } finally {
      setLoading(false);
    }
  }, [activeBoardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Generate 4 days starting from currentDate
  const days = Array.from({ length: 4 }).map((_, i) => currentDate.add(i, 'day'));

  // Filter tasks for each day
  const dayTasks = days.map(day => {
    const tasks = [];
    lists.forEach(list => {
      list.cards?.forEach(card => {
        if (card.dueDate && dayjs(card.dueDate).isSame(day, 'day')) {
          tasks.push({
            ...card,
            listName: list.name,
            color: getTaskColor(card.priority)
          });
        }
      });
    });
    return {
      date: day,
      tasks: tasks.sort((a, b) => (a.order || 0) - (b.order || 0))
    };
  });

  // Tasks without due dates go to the waiting list
  const waitingList = [];
  lists.forEach(list => {
    list.cards?.forEach(card => {
      if (!card.dueDate) {
        waitingList.push({
          ...card,
          listName: list.name
        });
      }
    });
  });

  function getTaskColor(priority) {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  }

  const formatTime = (seconds) => {
    if (!seconds) return '0h';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-gray-400 italic">
        Loading calendar...
      </div>
    );
  }

  return (
    <div className="flex h-full animate-in fade-in duration-300">
      {/* Calendar Area */}
      <div className="flex-1 flex flex-col bg-white border-r border-gray-200">
        {/* Calendar Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-6">
            <span className="font-bold text-xl text-gray-800">{currentDate.format('MMMM')}</span>
            <div className="flex items-center bg-gray-100 rounded-lg p-1 shadow-inner">
              <button 
                onClick={() => setCurrentDate(dayjs())}
                className="px-3 py-1 text-xs font-bold bg-white shadow-sm rounded-md hover:bg-gray-50 transition-colors"
              >
                Today
              </button>
              <div className="flex items-center px-2 gap-1">
                <ChevronLeft 
                  onClick={() => setCurrentDate(prev => prev.subtract(1, 'day'))}
                  className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600 transition-colors" 
                />
                <ChevronRight 
                  onClick={() => setCurrentDate(prev => prev.add(1, 'day'))}
                  className="w-4 h-4 cursor-pointer text-gray-500 hover:text-blue-600 transition-colors" 
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-12 mr-10">
            {dayTasks.map((dt, i) => (
              <div key={i} className="flex flex-col items-center min-w-[60px]">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{dt.date.format('ddd')}</span>
                <span className={`text-lg font-black mt-0.5 ${dt.date.isSame(dayjs(), 'day') ? 'text-blue-600' : 'text-gray-700'}`}>
                  {dt.date.format('D')}
                </span>
                {dt.date.isSame(dayjs(), 'day') && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1 shadow-sm" />}
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-y-auto grid grid-cols-4 divide-x divide-gray-100 bg-gray-50/20">
          {dayTasks.map((dt, idx) => (
            <div key={idx} className="p-3 space-y-3 min-h-full transition-colors hover:bg-gray-100/30">
              {dt.tasks.map((task) => (
                <div 
                  key={task._id} 
                  className={`p-3 rounded-xl border shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${task.color} group relative overflow-hidden`}
                >
                  <div className="absolute right-0 top-0 bottom-0 w-1 opacity-20 bg-black group-hover:opacity-40 transition-opacity" />
                  <div className="text-[9px] font-black uppercase mb-1.5 flex items-center gap-1 opacity-70">
                    <Clock className="w-2.5 h-2.5" />
                    {task.listName}
                  </div>
                  <div className="text-xs font-bold leading-snug pr-2">{task.title}</div>
                  <div className="mt-2 flex items-center justify-between">
                     <span className="text-[9px] font-medium opacity-60 italic">{formatTime(task.timeTracked)}</span>
                     {task.assignees?.length > 0 && (
                        <div className="w-5 h-5 rounded-full bg-white/50 flex items-center justify-center text-[8px] font-black border border-black/5">
                          {task.assignees[0].name?.charAt(0)}
                        </div>
                     )}
                  </div>
                </div>
              ))}
              {dt.tasks.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center opacity-10 pointer-events-none py-20">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-gray-400 mb-2" />
                  <span className="text-[10px] font-bold uppercase">No Tasks</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Waiting List Sidebar */}
      <div className="w-72 bg-white flex flex-col shrink-0 border-l border-gray-50 shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.02)]">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
          <span className="font-black text-xs uppercase tracking-widest text-gray-500">Waiting list</span>
          <div className="flex items-center gap-3">
            <Plus className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
            <Search className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
          </div>
        </div>
        <div className="p-4 space-y-3 overflow-y-auto flex-1 scrollbar-hide">
          {waitingList.map((item) => (
            <div 
              key={item._id} 
              className="p-4 border border-gray-100 rounded-xl hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer transition-all duration-300 bg-white group"
            >
              <div className="text-xs font-bold text-gray-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{item.title}</div>
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-gray-400 tracking-tighter">{item.listName}</span>
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-md">{formatTime(item.timeTracked)}</span>
              </div>
            </div>
          ))}
          {waitingList.length === 0 && (
            <div className="p-8 text-center text-[10px] font-bold text-gray-300 uppercase italic">
              All tasks are scheduled
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
