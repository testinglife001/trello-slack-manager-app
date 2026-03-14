import React, { useEffect, useState } from 'react';
import { 
  X, 
  MoreHorizontal, 
  Share2, 
  Trash2, 
  Calendar, 
  User, 
  Type, 
  AlignLeft, 
  CheckSquare, 
  Paperclip, 
  MessageSquare,
  ChevronDown,
  Paperclip as AttachmentIcon,
  Smile,
  Send,
  Plus,
  Flag,
  Clock
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import cardApi from '../../api/cardApi';
import { format, formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';
import Modal from '../../components/ui/Modal';

const TaskDetailsModal = () => {
  const navigate = useNavigate();
  const { projectId, taskId } = useParams();
  const [task, setTask] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!taskId) return;
    
    const fetchTaskDetails = async () => {
      setLoading(true);
      try {
        const [detailsRes, activityRes] = await Promise.all([
          cardApi.getOne(taskId),
          cardApi.getActivity(taskId)
        ]);
        
        setTask(detailsRes.data.card);
        setAttachments(detailsRes.data.attachments || []);
        setSubtasks(detailsRes.data.subtasks || []);
        setActivity(activityRes.data || []);

      } catch (err) {
        console.error('Failed to fetch task details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const handleClose = () => {
    // Navigate back to the previous view (tasks, boards, calendar, etc.)
    // We can use a simple strategy to go back to the parent project route
    const currentPath = window.location.pathname;
    const newPath = currentPath.split('/tasks/')[0] || `/projects/${projectId}/tasks`;
    navigate(newPath);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await cardApi.delete(taskId);
        handleClose();
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  if (!taskId) return null;

  return (
    <Modal onClose={handleClose} width={1000}>
      <div className="flex flex-col h-[85vh] bg-white rounded-3xl overflow-hidden relative">
        {/* Header */}
        <div className="h-16 px-8 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
              <X size={20} />
            </button>
            <div className="h-6 w-[1px] bg-gray-200 mx-2" />
            <div className="flex items-center gap-2">
               <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center text-blue-600">
                  <CheckSquare size={14} />
               </div>
               <span className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Task Details</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button className="flex items-center gap-2 hover:bg-gray-50 px-3 py-1.5 rounded-xl text-gray-500 transition-colors text-xs font-black uppercase tracking-widest border border-gray-100">
               <Share2 size={14} />
               <span>Share</span>
             </button>
             <button onClick={handleDelete} className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-xl text-gray-500 transition-colors text-xs font-black uppercase tracking-widest border border-gray-100">
               <Trash2 size={14} />
               <span>Delete</span>
             </button>
             <button className="p-2 hover:bg-gray-50 rounded-xl text-gray-500 border border-gray-100">
               <MoreHorizontal size={18} />
             </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : task ? (
          <div className="flex-1 overflow-hidden flex divide-x divide-gray-100">
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-gray-200">
                        {task.board?.name || 'Board'}
                     </span>
                     <span className="text-gray-300">/</span>
                     <span className="px-2.5 py-1 bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-lg border border-blue-100">
                        {task.list?.name || 'List'}
                     </span>
                  </div>
                  <h1 className="text-3xl font-black text-gray-900 leading-tight italic uppercase tracking-tight">{task.title}</h1>
                  
                  <div className="grid grid-cols-2 gap-y-6 text-sm pt-4 max-w-xl">
                     <div className="flex items-center gap-3 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                        <div className="w-8 flex justify-center"><CheckSquare size={18} className="text-blue-500" /></div>
                        <span>Status</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className={clsx(
                          "px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border flex items-center gap-2",
                          task.status === 'todo' && "bg-gray-50 text-gray-600 border-gray-100",
                          task.status === 'in-progress' && "bg-blue-50 text-blue-600 border-blue-100",
                          task.status === 'done' && "bg-green-50 text-green-600 border-green-100"
                        )}>
                           <div className={clsx(
                             "w-1.5 h-1.5 rounded-full",
                             task.status === 'todo' && "bg-gray-500",
                             task.status === 'in-progress' && "bg-blue-500",
                             task.status === 'done' && "bg-green-500"
                           )} />
                           {task.status || 'todo'}
                        </div>
                     </div>

                     <div className="flex items-center gap-3 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                        <div className="w-8 flex justify-center"><Flag size={18} className="text-orange-500" /></div>
                        <span>Priority</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className={clsx(
                          "px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest border",
                          task.priority === 'low' && "bg-blue-50 text-blue-600 border-blue-100",
                          task.priority === 'normal' && "bg-gray-50 text-gray-600 border-gray-100",
                          task.priority === 'high' && "bg-orange-50 text-orange-600 border-orange-100",
                          task.priority === 'urgent' && "bg-red-50 text-red-600 border-red-100"
                        )}>
                           {task.priority || 'normal'}
                        </div>
                     </div>

                     <div className="flex items-center gap-3 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                        <div className="w-8 flex justify-center"><Calendar size={18} className="text-purple-500" /></div>
                        <span>Due date</span>
                     </div>
                     <div className="text-gray-900 font-black italic uppercase text-xs tracking-tight">
                       {task.dueDate ? format(new Date(task.dueDate), 'dd MMM yyyy') : 'No due date'}
                     </div>

                     <div className="flex items-center gap-3 text-gray-400 font-black uppercase tracking-widest text-[10px]">
                        <div className="w-8 flex justify-center"><User size={18} className="text-indigo-500" /></div>
                        <span>Assignees</span>
                     </div>
                     <div className="flex items-center gap-3 flex-wrap">
                        {task.assignees && task.assignees.length > 0 ? (
                          task.assignees.map(user => (
                            <div key={user._id} className="flex items-center gap-2 bg-gray-50 pr-3 rounded-full border border-gray-100">
                               <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                                  <img src={user.avatar || `https://i.pravatar.cc/100?u=${user._id}`} alt="" />
                               </div>
                               <span className="text-gray-900 font-black text-[10px] uppercase tracking-widest">{user.name}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-400 italic text-[10px] font-bold uppercase tracking-widest">Unassigned</span>
                        )}
                     </div>
                  </div>
               </div>

               <div className="space-y-4 pt-8 border-t border-gray-100">
                  <div className="flex items-center gap-3 text-gray-900">
                     <AlignLeft size={20} className="text-gray-400" />
                     <h3 className="font-black italic uppercase text-sm tracking-widest">Description</h3>
                  </div>
                  <div className="pl-8 text-gray-600 space-y-4 leading-relaxed text-sm">
                     {task.description ? (
                       <div dangerouslySetInnerHTML={{ __html: typeof task.description === 'string' ? task.description : JSON.stringify(task.description) }} />
                     ) : (
                       <p className="text-gray-400 italic text-[10px] font-bold uppercase tracking-widest">No description provided.</p>
                     )}
                  </div>
               </div>

               <div className="space-y-4 pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <CheckSquare size={20} className="text-gray-400" />
                        <h3 className="font-black italic uppercase text-sm tracking-widest">Subtasks</h3>
                        <span className="text-gray-400 text-[10px] font-black bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{subtasks.length}</span>
                     </div>
                  </div>
                  <div className="pl-8 space-y-3">
                     {subtasks.length > 0 ? (
                       subtasks.map((sub) => (
                        <div key={sub._id} className="flex items-center gap-3 group bg-gray-50/50 p-3 rounded-2xl border border-transparent hover:border-gray-100 hover:bg-white transition-all cursor-pointer">
                            <input type="checkbox" checked={sub.completed} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all" readOnly />
                            <span className={clsx(
                              "text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors",
                              sub.completed && "line-through text-gray-400"
                            )}>{sub.title}</span>
                        </div>
                       ))
                     ) : (
                       <p className="text-gray-400 italic text-[10px] font-bold uppercase tracking-widest">No subtasks yet</p>
                     )}
                     <button className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] pt-2 hover:text-blue-700 transition-colors group">
                        <div className="bg-blue-50 p-1 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <Plus size={14} />
                        </div>
                        <span>Add Subtask</span>
                     </button>
                  </div>
               </div>

               <div className="space-y-4 pt-8 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <AttachmentIcon size={20} className="text-gray-400" />
                        <h3 className="font-black italic uppercase text-sm tracking-widest">Files</h3>
                        <span className="text-gray-400 text-[10px] font-black bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">{attachments.length}</span>
                     </div>
                  </div>
                  <div className="pl-8 flex gap-4 flex-wrap">
                     {attachments.length > 0 ? (
                       attachments.map((file) => (
                        <div key={file._id} className="w-32 group cursor-pointer">
                            <div className="aspect-video bg-gray-50 rounded-2xl flex items-center justify-center border-2 border-gray-100 group-hover:border-blue-300 transition-all overflow-hidden relative shadow-sm">
                              {file.fileType?.includes('image') ? (
                                <img src={file.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                              ) : (
                                <span className="text-blue-500 font-black text-[10px] bg-white px-2 py-1 rounded-lg shadow-sm z-10 border border-blue-50 uppercase tracking-widest">
                                  {file.fileType?.split('/')[1] || 'FILE'}
                                </span>
                              )}
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
                            </div>
                            <span className="text-[10px] font-bold text-gray-600 mt-2 block truncate uppercase tracking-widest">{file.fileName}</span>
                        </div>
                       ))
                     ) : (
                       <div className="w-full py-8 border-2 border-dashed border-gray-50 rounded-3xl flex items-center justify-center text-gray-400 italic text-[10px] font-black uppercase tracking-widest">
                          No attachments yet
                       </div>
                     )}
                  </div>
               </div>
            </div>

            {/* Sidebar / Activity */}
            <div className="w-[360px] flex flex-col bg-gray-50/20 shrink-0">
               <div className="p-8 border-b border-gray-100 bg-white/50 backdrop-blur-md">
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Following</h4>
                    <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">Manage</button>
                  </div>
                  <div className="flex -space-x-3">
                    {task.watchers?.map(user => (
                      <div key={user._id} className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 overflow-hidden shadow-sm hover:scale-110 hover:z-10 transition-all cursor-pointer">
                        <img src={user.avatar || `https://i.pravatar.cc/100?u=${user._id}`} alt="" />
                      </div>
                    ))}
                    <button className="w-10 h-10 rounded-full border-2 border-white bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors">
                      <Plus size={16} />
                    </button>
                  </div>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                  <div className="text-center relative">
                     <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-100" />
                     <span className="bg-[#fcfcfd] relative px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Activity Log</span>
                  </div>

                  <div className="space-y-6">
                    {activity.length === 0 ? (
                      <p className="text-center py-10 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] italic">No recent activity</p>
                    ) : (
                      activity.map((item) => (
                        <div key={item._id} className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-white shadow-sm overflow-hidden flex-shrink-0 border border-gray-100">
                              <img src={item.actor.avatar || `https://ui-avatars.com/api/?name=${item.actor.name}`} alt={item.actor.name} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-800 leading-snug">
                                <span className="font-black text-gray-900">{item.actor.name}</span> <span className="text-gray-500 font-medium">{item.action.replace("_", " ")}</span>
                              </p>
                              <div className="flex items-center gap-1.5 mt-1.5 text-gray-400">
                                 <Clock size={10} />
                                 <span className="text-[9px] font-black uppercase tracking-widest">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                              </div>
                            </div>
                        </div>
                      ))
                    )}
                  </div>
               </div>

               <div className="p-8 border-t border-gray-100 bg-white/50">
                  <div className="relative">
                     <input 
                       type="text" 
                       placeholder="Write a comment..." 
                       className="w-full bg-white border border-gray-100 rounded-[1.5rem] py-4 pl-6 pr-14 text-xs font-bold outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                     />
                     <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95">
                       <Send size={16} />
                     </button>
                  </div>
               </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-10 text-center">
            <h2 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter">Task not found</h2>
            <p className="text-sm text-gray-400 font-medium mt-2">The task you are looking for may have been deleted.</p>
            <button onClick={handleClose} className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all">Back to Project</button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default TaskDetailsModal;
