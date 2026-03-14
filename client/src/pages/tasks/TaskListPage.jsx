import React, { useEffect, useState, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Plus,
  Layout,
  List as ListIcon,
  Search,
  Filter
} from 'lucide-react';
import { clsx } from 'clsx';
import { useNavigate, useParams, Outlet } from 'react-router-dom';
import { request } from '../../api/client';
import { format } from 'date-fns';

const TaskListPage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch all cards for the project
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

  // Group tasks by Board and then by List
  const groupedTasks = useMemo(() => {
    const groups = {};
    tasks.forEach(task => {
      const boardName = task.board?.name || 'Unassigned Board';
      const listName = task.list?.name || 'No List';
      
      if (!groups[boardName]) groups[boardName] = {};
      if (!groups[boardName][listName]) groups[boardName][listName] = [];
      
      groups[boardName][listName].push(task);
    });
    return groups;
  }, [tasks]);

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTaskClick = (taskId) => {
    navigate(`/projects/${projectId}/tasks/${taskId}`);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white h-full relative">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex flex-col gap-6 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">Project Tasks</h1>
            <p className="text-sm text-gray-500 font-medium mt-1">Manage and track all tasks across your project boards.</p>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 bg-gray-50 text-gray-600 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all border border-gray-100">
               <Filter size={18} />
               Filter
             </button>
             <button className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 group">
               <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
               New Task
             </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Search tasks by name..." 
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-blue-50 focus:border-blue-500 focus:bg-white transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex items-center bg-gray-50 p-1 rounded-xl border border-gray-200">
              <button className="p-2 bg-white shadow-sm rounded-lg text-blue-600"><Layout size={18} /></button>
              <button className="p-2 text-gray-400 hover:text-gray-600"><ListIcon size={18} /></button>
           </div>
        </div>
      </div>

      {/* Task Content */}
      <div className="flex-1 overflow-auto custom-scrollbar p-8">
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <CheckCircle2 size={48} className="mb-4 opacity-20" />
            <p className="font-black italic uppercase tracking-widest text-xs">No tasks found in this project.</p>
          </div>
        ) : (
          Object.entries(groupedTasks).map(([boardName, lists]) => (
            <div key={boardName} className="mb-10">
              <div 
                className="flex items-center gap-3 mb-6 cursor-pointer group"
                onClick={() => toggleGroup(boardName)}
              >
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                   <Layout size={16} />
                </div>
                <h2 className="text-lg font-black text-gray-800 tracking-tight uppercase italic">{boardName}</h2>
                <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-1 rounded-full border border-gray-200 uppercase tracking-widest">
                   {Object.values(lists).flat().length} Tasks
                </span>
                <ChevronDown 
                  size={20} 
                  className={clsx(
                    "text-gray-300 ml-auto transition-transform duration-300",
                    expandedGroups[boardName] === false && "-rotate-90"
                  )} 
                />
              </div>

              {expandedGroups[boardName] !== false && (
                <div className="space-y-8 pl-4 border-l-2 border-gray-50">
                  {Object.entries(lists).map(([listName, listTasks]) => (
                    <div key={listName}>
                      <div className="flex items-center gap-2 mb-4">
                        <ListIcon size={14} className="text-gray-400" />
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{listName}</h3>
                        <div className="h-px flex-1 bg-gray-50 ml-2"></div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {listTasks.map(task => (
                          <div 
                            key={task._id}
                            onClick={() => handleTaskClick(task._id)}
                            className="group flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
                          >
                            <div className={clsx(
                              "absolute left-0 top-0 bottom-0 w-1",
                              task.priority === 'urgent' ? 'bg-red-500' :
                              task.priority === 'high' ? 'bg-orange-500' : 'bg-blue-500'
                            )} />
                            
                            <div className="flex-1 min-w-0">
                               <div className="flex items-center gap-3 mb-1">
                                  <h4 className="font-black text-gray-800 truncate group-hover:text-blue-600 transition-colors uppercase italic tracking-tight">{task.title}</h4>
                                  {task.priority === 'urgent' && (
                                    <span className="text-[9px] font-black bg-red-50 text-red-500 px-1.5 py-0.5 rounded uppercase tracking-[0.1em] border border-red-100">Urgent</span>
                                  )}
                               </div>
                               <div className="flex items-center gap-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                  <div className="flex items-center gap-1.5">
                                     <Clock size={12} className="text-gray-300" />
                                     <span>{task.dueDate ? format(new Date(task.dueDate), 'dd MMM') : 'No Due Date'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                     <Circle size={8} className={clsx(
                                       task.status === 'done' ? 'text-green-500 fill-green-500' : 
                                       task.status === 'in-progress' ? 'text-blue-500 fill-blue-500' : 'text-gray-300'
                                     )} />
                                     <span>{task.status || 'todo'}</span>
                                  </div>
                               </div>
                            </div>

                            <div className="flex items-center -space-x-2">
                               {task.assignees?.slice(0, 3).map(user => (
                                 <div key={user._id} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm">
                                    <img src={user.avatar || `https://i.pravatar.cc/100?u=${user._id}`} alt="" />
                                 </div>
                               ))}
                               {task.assignees?.length > 3 && (
                                 <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-[10px] font-black text-gray-400">
                                    +{task.assignees.length - 3}
                                 </div>
                               )}
                            </div>

                            <button className="p-2 text-gray-300 hover:text-gray-900 transition-colors">
                               <MoreHorizontal size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Outlet />
    </div>
  );
};

export default TaskListPage;
