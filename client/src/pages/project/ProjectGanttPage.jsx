import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Settings2, MoreHorizontal, Plus, Filter, BarChart3, Clock } from 'lucide-react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { request } from '../../api/client';
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, addMonths, subMonths } from 'date-fns';
import { clsx } from 'clsx';

const ProjectGanttPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await request(`/cards/project/${projectId}`);
        // Filter tasks that have at least a start or due date for Gantt
        setTasks(Array.isArray(data) ? data.filter(t => t.startDate || t.dueDate) : []);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const timelineDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = new Date();

  const handleTaskClick = (taskId) => {
    navigate(`/projects/${projectId}/gantt/tasks/${taskId}`);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white select-none overflow-hidden relative">
      {/* Gantt Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3 italic uppercase tracking-tight">
            <BarChart3 size={24} className="text-blue-600" />
            Gantt Chart
          </h1>
          <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
            <button className="px-4 py-1.5 text-xs font-black bg-white shadow-sm rounded-lg text-gray-900 uppercase tracking-widest">Month</button>
            <button className="px-4 py-1.5 text-xs font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">Week</button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 mr-4 bg-gray-50 rounded-xl p-1 border border-gray-100">
            <button onClick={prevMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-blue-600 transition-all">
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-black text-gray-700 w-36 text-center uppercase italic tracking-tight">{format(currentMonth, 'MMMM yyyy')}</span>
            <button onClick={nextMonth} className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-400 hover:text-blue-600 transition-all">
              <ChevronRight size={20} />
            </button>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100">
            <Plus size={18} />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Gantt Content */}
      <div className="flex-1 overflow-auto flex relative custom-scrollbar">
        {/* Left: Task Names Sticky Column */}
        <div className="w-80 border-r border-gray-100 shrink-0 bg-white sticky left-0 z-30 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
          <div className="h-14 border-b border-gray-100 flex items-center px-8 text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] bg-gray-50/50">
            Active Timeline
          </div>
          <div className="divide-y divide-gray-50">
            {tasks.map((task) => (
              <div 
                key={task._id} 
                onClick={() => handleTaskClick(task._id)}
                className="h-20 flex flex-col justify-center px-8 group hover:bg-blue-50/50 cursor-pointer transition-all border-b border-gray-50"
              >
                <div className="flex items-center gap-3 mb-1">
                  <div className={clsx(
                    "w-2 h-2 rounded-full",
                    task.priority === 'urgent' ? 'bg-red-500' :
                    task.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                  )} />
                  <span className="text-xs font-black text-gray-800 truncate group-hover:text-blue-600 transition-colors uppercase italic tracking-tight">{task.title}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   <Clock size={10} />
                   <span>{task.startDate ? format(new Date(task.startDate), 'dd MMM') : 'N/A'} - {task.dueDate ? format(new Date(task.dueDate), 'dd MMM') : 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-6">
             <button className="w-full py-4 border-2 border-dashed border-gray-100 rounded-[1.5rem] flex items-center justify-center text-gray-300 hover:border-blue-200 hover:text-blue-400 hover:bg-blue-50/30 transition-all group">
                <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
             </button>
          </div>
        </div>

        {/* Right: Timeline Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex border-b border-gray-100 h-14 bg-gray-50/50 sticky top-0 z-20">
            {timelineDays.map(day => (
              <div key={day.toISOString()} className={clsx(
                "w-12 shrink-0 border-r border-gray-100 flex items-center justify-center text-[10px] font-black transition-colors",
                format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? 'text-blue-600 bg-blue-50/50' : 'text-gray-400'
              )}>
                {format(day, 'd')}
              </div>
            ))}
          </div>

          <div className="relative min-h-full">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {timelineDays.map(day => (
                <div key={day.toISOString()} className={clsx(
                  "w-12 border-r h-full shrink-0",
                  format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd') ? 'border-blue-200/50 bg-blue-50/10' : 'border-gray-100/30'
                )} />
              ))}
            </div>

            {/* Today Indicator Line */}
            {isWithinInterval(today, { start: monthStart, end: monthEnd }) && (
              <div 
                className="absolute top-0 bottom-0 w-px bg-blue-500 z-20 pointer-events-none"
                style={{ left: `${(differenceInDays(today, monthStart)) * 48 + 24}px` }}
              >
                <div className="w-3 h-3 rounded-full bg-blue-500 -ml-[5.5px] shadow-lg shadow-blue-200 border-2 border-white" />
              </div>
            )}

            {/* Task Bars */}
            <div className="relative z-10 pt-0">
              {tasks.map((task) => {
                const start = task.startDate ? new Date(task.startDate) : (task.dueDate ? new Date(task.dueDate) : today);
                const end = task.dueDate ? new Date(task.dueDate) : start;
                
                // Only show if overlaps with current month
                const overlaps = (start <= monthEnd && end >= monthStart);
                if (!overlaps) return <div key={task._id} className="h-20 border-b border-transparent" />;

                const displayStart = start < monthStart ? monthStart : start;
                const displayEnd = end > monthEnd ? monthEnd : end;
                
                const left = differenceInDays(displayStart, monthStart) * 48;
                const width = Math.max((differenceInDays(displayEnd, displayStart) + 1) * 48, 48);

                return (
                  <div key={task._id} className="h-20 border-b border-gray-50/50 flex items-center group">
                    <div 
                      onClick={() => handleTaskClick(task._id)}
                      className={clsx(
                        "h-10 rounded-2xl relative cursor-pointer hover:brightness-110 shadow-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 flex items-center overflow-hidden mx-1 border-2 border-white/20 group/bar",
                        task.priority === 'urgent' ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/20' :
                        task.priority === 'high' ? 'bg-gradient-to-r from-orange-500 to-orange-600 shadow-orange-500/20' : 
                        'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20'
                      )}
                      style={{ 
                        marginLeft: `${left}px`, 
                        width: `${width}px` 
                      }}
                    >
                      {/* Progress bar overlay */}
                      <div 
                        className="absolute inset-0 bg-white/20 backdrop-blur-sm" 
                        style={{ width: `${task.checklistProgress || 0}%` }} 
                      />
                      <div className="flex items-center justify-between w-full px-4 relative z-10">
                        <span className="text-[10px] text-white font-black uppercase tracking-wider whitespace-nowrap opacity-0 group-hover/bar:opacity-100 transition-opacity">
                           Progress: {task.checklistProgress || 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default ProjectGanttPage;
