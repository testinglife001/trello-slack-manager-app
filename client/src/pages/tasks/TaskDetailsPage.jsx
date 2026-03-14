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
  Flag
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import cardApi from '../../api/cardApi';
import { format, formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

const TaskDetailsPage = () => {
  const navigate = useNavigate();
  const { projectId, taskId } = useParams();
  const [task, setTask] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [subtasks, setSubtasks] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTaskDetails = async () => {
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
    navigate(`/projects/${projectId}/tasks`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await cardApi.delete(taskId);
        navigate(`/projects/${projectId}/tasks`);
      } catch (err) {
        console.error('Failed to delete task:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white">
        <h2 className="text-xl font-bold text-gray-800">Task not found</h2>
        <button onClick={handleClose} className="mt-4 text-blue-600 hover:underline">Back to tasks</button>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white h-full flex flex-col overflow-hidden relative">
      {/* Header */}
      <div className="h-16 px-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <X size={20} />
          </button>
          <div className="h-6 w-[1px] bg-gray-200 mx-2" />
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Task Details</h2>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 hover:bg-gray-50 px-3 py-1.5 rounded-md text-gray-500 transition-colors text-sm font-medium border border-gray-200">
             <Share2 size={16} />
             <span>Share</span>
           </button>
           <button onClick={handleDelete} className="flex items-center gap-2 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-md text-gray-500 transition-colors text-sm font-medium border border-gray-200">
             <Trash2 size={16} />
             <span>Delete</span>
           </button>
           <button className="p-2 hover:bg-gray-50 rounded-md text-gray-500 border border-gray-200">
             <MoreHorizontal size={18} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-10 flex gap-12">
        {/* Main Content */}
        <div className="flex-1 space-y-10">
           <div className="space-y-6">
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">{task.title}</h1>
              
              <div className="grid grid-cols-2 gap-y-6 text-sm pt-4 max-w-xl">
                 <div className="flex items-center gap-3 text-gray-400 font-medium">
                    <div className="w-8 flex justify-center"><CheckSquare size={18} /></div>
                    <span>Status</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className={clsx(
                      "px-3 py-1.5 rounded-lg font-bold text-xs border flex items-center gap-2 capitalize",
                      task.status === 'todo' && "bg-gray-50 text-gray-600 border-gray-100",
                      task.status === 'in-progress' && "bg-blue-50 text-blue-600 border-blue-100",
                      task.status === 'done' && "bg-green-50 text-green-600 border-green-100"
                    )}>
                       <div className={clsx(
                         "w-2 h-2 rounded-full",
                         task.status === 'todo' && "bg-gray-500",
                         task.status === 'in-progress' && "bg-blue-500",
                         task.status === 'done' && "bg-green-500"
                       )} />
                       {task.status}
                    </div>
                 </div>

                 <div className="flex items-center gap-3 text-gray-400 font-medium">
                    <div className="w-8 flex justify-center"><Flag size={18} /></div>
                    <span>Priority</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className={clsx(
                      "px-3 py-1.5 rounded-lg font-bold text-xs border capitalize",
                      task.priority === 'low' && "bg-blue-50 text-blue-600 border-blue-100",
                      task.priority === 'normal' && "bg-gray-50 text-gray-600 border-gray-100",
                      task.priority === 'high' && "bg-orange-50 text-orange-600 border-orange-100",
                      task.priority === 'urgent' && "bg-red-50 text-red-600 border-red-100"
                    )}>
                       {task.priority}
                    </div>
                 </div>

                 <div className="flex items-center gap-3 text-gray-400 font-medium">
                    <div className="w-8 flex justify-center"><Calendar size={18} /></div>
                    <span>Due date</span>
                 </div>
                 <div className="text-gray-800 font-semibold">
                   {task.dueDate ? format(new Date(task.dueDate), 'dd MMM yyyy') : 'No due date'}
                 </div>

                 <div className="flex items-center gap-3 text-gray-400 font-medium">
                    <div className="w-8 flex justify-center"><User size={18} /></div>
                    <span>Assignees</span>
                 </div>
                 <div className="flex items-center gap-3 flex-wrap">
                    {task.assignees && task.assignees.length > 0 ? (
                      task.assignees.map(user => (
                        <div key={user._id} className="flex items-center gap-2 bg-gray-50 pr-3 rounded-full border border-gray-100">
                           <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                              <img src={user.avatar || `https://i.pravatar.cc/100?u=${user._id}`} alt="" />
                           </div>
                           <span className="text-gray-800 font-semibold text-xs">{user.name}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-gray-400 italic">Unassigned</span>
                    )}
                 </div>
              </div>
           </div>

           <div className="space-y-4 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-3 text-gray-900 font-bold text-lg">
                 <AlignLeft size={22} className="text-gray-400" />
                 <h3>Description</h3>
              </div>
              <div className="pl-9 text-gray-600 space-y-4 leading-relaxed text-base">
                 {task.description ? (
                   <div dangerouslySetInnerHTML={{ __html: typeof task.description === 'string' ? task.description : JSON.stringify(task.description) }} />
                 ) : (
                   <p className="text-gray-400 italic">No description provided.</p>
                 )}
              </div>
           </div>

           <div className="space-y-4 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between text-gray-900 font-bold text-lg">
                 <div className="flex items-center gap-3">
                    <CheckSquare size={22} className="text-gray-400" />
                    <h3>Subtasks</h3>
                    <span className="text-gray-400 text-sm font-bold bg-gray-100 px-2.5 py-0.5 rounded-full ml-1">{subtasks.length}</span>
                 </div>
                 <ChevronDown size={20} className="text-gray-300" />
              </div>
              <div className="pl-9 space-y-4">
                 {subtasks.length > 0 ? (
                   subtasks.map((sub) => (
                    <div key={sub._id} className="flex items-center gap-4 group">
                        <input type="checkbox" checked={sub.completed} className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer transition-all" readOnly />
                        <span className={clsx(
                          "text-gray-700 group-hover:text-gray-900 transition-colors cursor-pointer font-medium",
                          sub.completed && "line-through text-gray-400"
                        )}>{sub.title}</span>
                    </div>
                   ))
                 ) : (
                   <p className="text-gray-400 italic text-sm">No subtasks yet</p>
                 )}
                 <button className="flex items-center gap-2 text-blue-600 font-bold pt-2 hover:text-blue-700 transition-colors group">
                    <div className="bg-blue-50 p-1 rounded group-hover:bg-blue-100 transition-colors">
                      <Plus size={16} />
                    </div>
                    <span>Add Subtask</span>
                 </button>
              </div>
           </div>

           {/* Files section */}
           <div className="space-y-4 pt-8 border-t border-gray-100">
              <div className="flex items-center justify-between text-gray-900 font-bold text-lg">
                 <div className="flex items-center gap-3">
                    <AttachmentIcon size={22} className="text-gray-400" />
                    <h3>Files</h3>
                    <span className="text-gray-400 text-sm font-bold bg-gray-100 px-2.5 py-0.5 rounded-full ml-1">{attachments.length}</span>
                 </div>
                 <ChevronDown size={20} className="text-gray-300" />
              </div>
              <div className="pl-9 flex gap-6 flex-wrap">
                 {attachments.length > 0 ? (
                   attachments.map((file) => (
                    <div key={file._id} className="w-40 group cursor-pointer">
                        <div className="aspect-video bg-gray-50 rounded-xl flex items-center justify-center border-2 border-gray-100 group-hover:border-blue-300 transition-all overflow-hidden relative shadow-sm">
                          {file.fileType?.includes('image') ? (
                            <img src={file.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                          ) : (
                            <span className="text-blue-500 font-black text-xs bg-white px-2 py-1 rounded-md shadow-sm z-10 border border-blue-100 uppercase">
                              {file.fileType?.split('/')[1] || 'FILE'}
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
                        </div>
                        <span className="text-xs text-gray-600 mt-3 block truncate font-semibold">{file.fileName}</span>
                    </div>
                   ))
                 ) : (
                   <div className="w-full py-8 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 italic text-sm">
                      No attachments yet
                   </div>
                 )}
              </div>
           </div>
        </div>

        {/* Sidebar / Activity */}
        <div className="w-[340px] border-l border-gray-100 pl-10 flex flex-col bg-gray-50/30 rounded-l-3xl">
           <div className="flex items-center justify-between mb-8 mt-4">
              <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">
                 <Share2 size={12} />
                 Following
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                 Followers
                 <div className="flex -space-x-2">
                    {task.watchers?.slice(0, 2).map(user => (
                      <div key={user._id} className="w-6 h-6 rounded-full border-2 border-white bg-gray-200 overflow-hidden"><img src={user.avatar || `https://i.pravatar.cc/100?u=${user._id}`} alt="" /></div>
                    ))}
                 </div>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto space-y-8 pr-4 custom-scrollbar">
              <div className="text-center relative">
                 <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-200" />
                 <span className="bg-[#fcfcfd] relative px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Activity Log</span>
              </div>

              <div className="space-y-6">
                {activity.map((item) => (
                  <div key={item._id} className="flex gap-4 text-sm">
                      <div className="w-8 h-8 rounded-full bg-white shadow-sm overflow-hidden flex-shrink-0 mt-0.5 border border-gray-100">
                        <img src={item.actor.avatar || `https://ui-avatars.com/api/?name=${item.actor.name}`} alt={item.actor.name} />
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800 leading-snug">
                          <span className="font-bold text-gray-900">{item.actor.name}</span> <span className="text-gray-500">{item.action.replace("_", " ")} this task</span>
                        </p>
                        <span className="text-[10px] text-gray-400 font-bold uppercase mt-2 block">{formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}</span>
                      </div>
                  </div>
                ))}
              </div>
           </div>

           <div className="mt-auto pt-8 border-t border-gray-100 pb-4">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden border-2 border-white shadow-sm"><img src="https://i.pravatar.cc/100?u=me" alt="" /></div>
              </div>
              <div className="relative">
                 <input 
                   type="text" 
                   placeholder="Write a comment..." 
                   className="w-full bg-white border border-gray-200 rounded-2xl py-3.5 pl-5 pr-24 text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all shadow-sm"
                 />
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-400">
                    <button className="p-2 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-all"><Smile size={20} /></button>
                    <button className="p-2 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all transform active:scale-95"><Send size={18} /></button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsPage;
