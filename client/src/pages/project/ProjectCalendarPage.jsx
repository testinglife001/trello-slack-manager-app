import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, Plus, Calendar as CalendarIcon, Filter, MoreHorizontal, Clock } from 'lucide-react';
import { useParams, useNavigate, Outlet } from 'react-router-dom';
import { request } from '../../api/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { clsx } from 'clsx';

const ProjectCalendarPage = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await request(`/cards/project/${projectId}`);
        setTasks(Array.isArray(data) ? data : []);
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
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const daysInMonth = eachDayOfInterval({ start: startDate, end: endDate });

  const handleTaskClick = (taskId) => {
    navigate(`/projects/${projectId}/calendar/tasks/${taskId}`);
  };

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getTasksForDay = (day) => {
    return tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), day));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden relative">
      {/* Calendar Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3 italic uppercase tracking-tight">
            <CalendarIcon size={24} className="text-blue-600" />
            Calendar
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

      <div className="flex-1 flex divide-x divide-gray-100 overflow-hidden">
        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 divide-x divide-gray-100 overflow-y-auto custom-scrollbar">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 bg-gray-50/50 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
              {day}
            </div>
          ))}
          {daysInMonth.map((day, idx) => {
            const dayTasks = getTasksForDay(day);
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = isSameDay(startOfMonth(day), startOfMonth(currentMonth));
            
            return (
              <div 
                key={idx} 
                className={clsx(
                  "flex flex-col min-h-[160px] border-b border-gray-100 transition-colors",
                  !isCurrentMonth ? 'bg-gray-50/20' : 'bg-white',
                  isToday && 'bg-blue-50/10'
                )}
              >
                <div className="p-3 flex items-center justify-between">
                  <span className={clsx(
                    "text-xs font-black px-2 py-1 rounded-lg transition-all",
                    isToday ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 
                    isCurrentMonth ? 'text-gray-900' : 'text-gray-300'
                  )}>
                    {format(day, 'd')}
                  </span>
                  {dayTasks.length > 0 && (
                    <span className="text-[10px] font-black text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                       {dayTasks.length}
                    </span>
                  )}
                </div>
                <div className="px-2 pb-2 space-y-1">
                  {dayTasks.map((task) => (
                    <div 
                      key={task._id} 
                      onClick={() => handleTaskClick(task._id)}
                      className={clsx(
                        "p-1.5 rounded-lg border shadow-sm cursor-pointer hover:shadow-md hover:scale-[1.02] transition-all text-[10px] font-black uppercase tracking-tight truncate",
                        task.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-100' :
                        task.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      )}
                    >
                      {task.title}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar - Quick View / Reminders */}
        <div className="w-80 bg-gray-50/30 flex flex-col shrink-0 overflow-y-auto border-l border-gray-100">
          <div className="p-8 border-b border-gray-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400">Project Highlights</h3>
          </div>
          <div className="p-8 space-y-6">
            <div>
               <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Upcoming Deadlines</h4>
               <div className="space-y-4">
                  {tasks
                    .filter(t => t.dueDate && new Date(t.dueDate) >= new Date())
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .slice(0, 5)
                    .map(task => (
                      <div key={task._id} onClick={() => handleTaskClick(task._id)} className="group flex gap-4 p-4 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all">
                        <div className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 shadow-inner",
                          task.priority === 'urgent' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        )}>
                          <Clock size={18} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <h4 className="text-xs font-black text-gray-800 truncate group-hover:text-blue-600 transition-colors uppercase italic tracking-tight">{task.title}</h4>
                          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">{format(new Date(task.dueDate), 'dd MMM yyyy')}</p>
                        </div>
                      </div>
                    ))}
                  
                  {tasks.filter(t => t.dueDate && new Date(t.dueDate) >= new Date()).length === 0 && (
                    <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                       <CalendarIcon size={32} className="mx-auto text-gray-100 mb-2" />
                       <p className="text-[10px] font-black text-gray-400 uppercase italic tracking-widest">No upcoming tasks</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="pt-4">
               <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-4">Stats</h4>
               <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total</p>
                     <p className="text-xl font-black text-gray-900">{tasks.length}</p>
                  </div>
                  <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
                     <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Urgent</p>
                     <p className="text-xl font-black text-red-500">{tasks.filter(t => t.priority === 'urgent').length}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
};

export default ProjectCalendarPage;
