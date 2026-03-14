import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Settings2, MoreHorizontal, Clock, Calendar as CalendarIcon } from 'lucide-react';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import { request } from '../../../api/client';

dayjs.extend(isBetween);

const GanttPage = () => {
  const { projectId, boardId } = useParams();
  const navigate = useNavigate();
  const activeBoardId = boardId || '6992477995434ce6c19991ce';

  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadBoard = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request(`/boards/${activeBoardId}/full`);
      setLists(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load board for Gantt', err);
    } finally {
      setLoading(false);
    }
  }, [activeBoardId]);

  useEffect(() => {
    loadBoard();
  }, [loadBoard]);

  // Flatten tasks that have at least a startDate or dueDate
  const tasks = useMemo(() => {
    const allTasks = [];
    lists.forEach(list => {
      list.cards?.forEach(card => {
        if (card.startDate || card.dueDate) {
          allTasks.push({
            ...card,
            listName: list.name,
            // Fallback for missing start or end dates to make them visible
            displayStart: card.startDate ? dayjs(card.startDate) : dayjs(card.dueDate).subtract(2, 'day'),
            displayEnd: card.dueDate ? dayjs(card.dueDate) : dayjs(card.startDate).add(2, 'day'),
            color: getTaskColor(card.priority)
          });
        }
      });
    });
    return allTasks.sort((a, b) => a.displayStart.unix() - b.displayStart.unix());
  }, [lists]);

  function getTaskColor(priority) {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  }

  const daysInMonth = currentMonth.daysInMonth();
  const timelineDays = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const monthName = currentMonth.format('MMMM YYYY');
  const today = dayjs();

  const handleTaskClick = (taskId) => {
    navigate(`/dashboard-v/${projectId}/${boardId}/tasks/${taskId}`);
  };

  const getDayPosition = (date) => {
    if (!date.isSame(currentMonth, 'month')) {
      if (date.isBefore(currentMonth, 'month')) return -100;
      return 5000;
    }
    return (date.date() - 1) * 40;
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-gray-400 italic font-bold uppercase tracking-widest text-xs">
        Generating Timeline...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white select-none animate-in fade-in duration-300">
      {/* Gantt Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Timeline View</span>
            <span className="font-black text-xl text-gray-800 tracking-tight">{monthName}</span>
          </div>
          <div className="flex items-center bg-gray-100 rounded-xl p-1 shadow-inner">
            <button 
              onClick={() => setCurrentMonth(dayjs().startOf('month'))}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-wider bg-white shadow-sm rounded-lg hover:bg-gray-50 transition-all active:scale-95"
            >
              Today
            </button>
            <div className="flex items-center px-2 gap-2">
              <ChevronLeft 
                onClick={() => setCurrentMonth(prev => prev.subtract(1, 'month'))}
                className="w-5 h-5 cursor-pointer text-gray-500 hover:text-blue-600 transition-colors" 
              />
              <ChevronRight 
                onClick={() => setCurrentMonth(prev => prev.add(1, 'month'))}
                className="w-5 h-5 cursor-pointer text-gray-500 hover:text-blue-600 transition-colors" 
              />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400">
             <CalendarIcon className="w-3.5 h-3.5" />
             Month View
          </div>
          <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
            <Settings2 className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Gantt Content */}
      <div className="flex-1 overflow-auto flex scrollbar-hide">
        {/* Left: Task Names */}
        <div className="w-72 border-r border-gray-100 shrink-0 bg-white sticky left-0 z-10 shadow-[4px_0_15px_-3px_rgba(0,0,0,0.02)]">
          <div className="h-12 border-b border-gray-100 flex items-center px-6 text-[10px] font-black uppercase text-gray-400 tracking-widest bg-gray-50/50">
            Task Name
          </div>
          {tasks.map((task) => (
            <div 
              key={task._id} 
              onClick={() => handleTaskClick(task._id)}
              className="h-14 border-b border-gray-50 flex items-center px-6 text-xs font-bold text-gray-700 truncate group hover:bg-blue-50/50 hover:text-blue-600 transition-all cursor-pointer"
            >
              <div className="flex flex-col gap-0.5 overflow-hidden">
                <span className="truncate">{task.title}</span>
                <span className="text-[9px] opacity-50 font-black uppercase tracking-tighter">{task.listName}</span>
              </div>
            </div>
          ))}
          {tasks.length === 0 && (
             <div className="p-10 text-center text-[10px] font-bold text-gray-300 uppercase italic">
               No scheduled tasks
             </div>
          )}
        </div>

        {/* Right: Timeline Grid */}
        <div className="flex-1 min-w-0 bg-gray-50/10">
          <div className="flex border-b border-gray-100 h-12 sticky top-0 bg-white/95 backdrop-blur-sm z-10">
            {timelineDays.map(day => {
              const date = currentMonth.date(day);
              const isToday = date.isSame(today, 'day');
              const isWeekend = date.day() === 0 || date.day() === 6;
              return (
                <div 
                  key={day} 
                  className={`w-10 shrink-0 border-r border-gray-100 flex flex-col items-center justify-center transition-colors ${isToday ? 'bg-blue-50/50' : isWeekend ? 'bg-gray-50/80' : ''}`}
                >
                  <span className={`text-[8px] font-black uppercase tracking-tighter ${isToday ? 'text-blue-600' : 'text-gray-400'}`}>
                    {date.format('ddd')}
                  </span>
                  <span className={`text-[11px] font-black ${isToday ? 'text-blue-700' : 'text-gray-600'}`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="relative" style={{ height: `${Math.max(tasks.length * 56, 400)}px` }}>
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {timelineDays.map(day => {
                const isWeekend = currentMonth.date(day).day() === 0 || currentMonth.date(day).day() === 6;
                return (
                  <div key={day} className={`w-10 border-r border-gray-100/50 h-full shrink-0 ${isWeekend ? 'bg-gray-50/30' : ''}`} />
                );
              })}
            </div>

            {/* Today Indicator Line */}
            {today.isSame(currentMonth, 'month') && (
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-blue-500/30 z-20 pointer-events-none"
                style={{ left: `${(today.date() - 1) * 40 + 20}px` }}
              >
                <div className="w-3 h-3 rounded-full bg-blue-500 -ml-1.5 mt-0 shadow-lg shadow-blue-500/50" />
              </div>
            )}

            {/* Task Bars */}
            <div className="relative z-1">
              {tasks.map((task) => {
                const left = getDayPosition(task.displayStart);
                const right = getDayPosition(task.displayEnd) + 40;
                
                // Only show if it overlaps with current view
                if (left > daysInMonth * 40 || right < 0) return <div key={task._id} className="h-14 border-b border-transparent" />;

                const clampedLeft = Math.max(0, left);
                const clampedRight = Math.min(daysInMonth * 40, right);
                const width = Math.max(20, clampedRight - clampedLeft);

                return (
                  <div key={task._id} className="h-14 border-b border-transparent flex items-center group">
                    <div 
                      onClick={() => handleTaskClick(task._id)}
                      className={`h-7 rounded-2xl ${task.color} relative cursor-pointer hover:brightness-110 shadow-lg shadow-black/5 transition-all duration-300 flex items-center group/bar`}
                      style={{ 
                        marginLeft: `${clampedLeft}px`, 
                        width: `${width}px` 
                      }}
                    >
                      {/* Progress bar overlay */}
                      <div 
                        className="absolute inset-0 bg-black/20 rounded-2xl" 
                        style={{ width: `${task.checklistProgress || 0}%` }} 
                      />
                      
                      <div className="px-3 relative z-10 flex items-center gap-2 overflow-hidden w-full">
                         <span className="text-[10px] text-white font-black whitespace-nowrap opacity-90">
                           {task.checklistProgress || 0}%
                         </span>
                         <span className="text-[10px] text-white font-bold whitespace-nowrap truncate opacity-0 group-hover/bar:opacity-100 transition-opacity">
                           {task.title}
                         </span>
                      </div>

                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-[9px] font-bold rounded opacity-0 group-hover/bar:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-200 z-50">
                        {task.displayStart.format('D MMM')} - {task.displayEnd.format('D MMM')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GanttPage;
