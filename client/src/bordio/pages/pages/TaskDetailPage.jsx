import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  X, 
  MoreHorizontal, 
  Clock, 
  User, 
  Paperclip, 
  CheckSquare, 
  MessageSquare, 
  Eye, 
  Share2,
  ChevronDown,
  Circle,
  FileText,
  Send,
  History
} from 'lucide-react';
import { request } from '../../../api/client';
import dayjs from 'dayjs';

const TaskDetailPage = () => {
  const { projectId, boardId, taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [boardTasks, setBoardTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");

  const loadTaskData = useCallback(async () => {
    if (!taskId) return;
    setLoading(true);
    try {
      const [taskData, boardData, activityData] = await Promise.all([
        request(`/cards/${taskId}`),
        request(`/boards/${boardId}/full`),
        request(`/cards/${taskId}/activity`)
      ]);

      setTask(taskData);
      setActivities(Array.isArray(activityData) ? activityData : []);
      
      // Flatten all cards from all lists to show in the left sidebar
      const allCards = boardData.flatMap(list => list.cards.map(c => ({ ...c, listName: list.name })));
      setBoardTasks(allCards);

    } catch (err) {
      console.error('Failed to load task details', err);
    } finally {
      setLoading(false);
    }
  }, [taskId, boardId]);

  useEffect(() => {
    loadTaskData();
  }, [loadTaskData]);

  const handleClose = () => {
    navigate(`/dashboard-v/${projectId}/${boardId}/kanban`);
  };

  const postComment = async () => {
    if (!comment.trim()) return;
    try {
      await request(`/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content: comment.trim(),
          card: taskId,
          project: projectId
        })
      });
      setComment("");
      // Refresh activities to show new comment
      const activityData = await request(`/cards/${taskId}/activity`);
      setActivities(Array.isArray(activityData) ? activityData : []);
    } catch (err) {
      console.error('Failed to post comment', err);
    }
  };

  if (loading && !task) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white text-gray-400 italic">
        Loading task details...
      </div>
    );
  }

  return (
    <div className="flex h-full bg-white animate-in slide-in-from-right duration-300">
      {/* Left Sidebar: Task List */}
      <div className="w-72 border-r border-gray-100 flex flex-col shrink-0 bg-gray-50/20">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-gray-500">Board Tasks</span>
          </div>
          <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-1.5 py-0.5 rounded-full">
            {boardTasks.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {boardTasks.map((t) => (
            <div 
              key={t._id} 
              onClick={() => navigate(`/dashboard-v/${projectId}/${boardId}/tasks/${t._id}`)}
              className={`px-4 py-3 text-xs cursor-pointer hover:bg-white border-b border-gray-100 transition-all duration-200 ${t._id === taskId ? 'bg-white shadow-sm font-bold border-l-4 border-l-blue-500 text-blue-600' : 'text-gray-600'}`}
            >
              <div className="flex flex-col gap-1">
                <span className="truncate">{t.title}</span>
                <span className="text-[9px] opacity-60 font-medium uppercase tracking-tighter">{t.listName}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Center: Task Detail */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-sm z-10">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
             <span className="truncate max-w-[100px]">{task?.listName || 'Task'}</span>
             <span>/</span>
             <span className="text-gray-600">Details</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 border-r border-gray-200 pr-4">
              <Eye className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
              <Share2 className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
              <MoreHorizontal className="w-4 h-4 text-gray-400 cursor-pointer hover:text-blue-500 transition-colors" />
            </div>
            <X 
              className="w-5 h-5 text-gray-400 cursor-pointer hover:text-red-500 transition-colors" 
              onClick={handleClose}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10 max-w-4xl mx-auto w-full scrollbar-hide">
          <h1 className="text-4xl font-black text-gray-900 mb-10 leading-tight">
            {task?.title}
          </h1>
          
          <div className="grid grid-cols-2 gap-y-8 gap-x-16 mb-12 p-6 bg-gray-50/50 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-24">Priority</span>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-tighter border ${
                task?.priority === 'high' ? 'bg-red-50 text-red-600 border-red-100' :
                task?.priority === 'medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' :
                'bg-blue-50 text-blue-600 border-blue-100'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  task?.priority === 'high' ? 'bg-red-500' :
                  task?.priority === 'medium' ? 'bg-yellow-500' :
                  'bg-blue-500'
                }`} />
                {task?.priority || 'Normal'}
              </div>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-24">Due date</span>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                <Clock className="w-4 h-4 text-blue-500" />
                {task?.dueDate ? dayjs(task.dueDate).format('DD MMM YYYY') : 'Not set'}
              </div>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-24">Assignee</span>
              <div className="flex items-center gap-2">
                {task?.assignees?.[0] ? (
                  <>
                    <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-black shadow-sm border-2 border-white">
                      {task.assignees[0].name?.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-gray-800">{task.assignees[0].name}</span>
                  </>
                ) : (
                  <span className="text-xs text-gray-400 italic font-medium">No assignee</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 w-24">Progress</span>
              <div className="flex items-center gap-3 flex-1 max-w-[120px]">
                <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-green-500 transition-all duration-500" 
                    style={{ width: `${task?.checklistProgress || 0}%` }}
                   />
                </div>
                <span className="text-[10px] font-black text-gray-500">{task?.checklistProgress || 0}%</span>
              </div>
            </div>
          </div>

          <div className="space-y-12">
            <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" /> Description
              </h3>
              <div className="text-gray-700 leading-relaxed text-sm bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[100px]">
                {task?.description || <span className="text-gray-400 italic">No description provided for this task.</span>}
              </div>
            </section>

            {task?.attachmentsCount > 0 && (
              <section>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-500" /> Attachments <span className="text-[10px] normal-case font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full ml-2">{task.attachmentsCount}</span>
                </h3>
                <div className="flex flex-wrap gap-4">
                  {/* Mock attachments for visual consistency */}
                  <div className="w-40 h-24 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all duration-300">
                    <Paperclip className="w-5 h-5 text-gray-400 mb-2" />
                    <span className="text-[10px] font-bold text-gray-500">Add file</span>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Right Sidebar: Activity */}
      <div className="w-80 border-l border-gray-100 flex flex-col shrink-0 bg-gray-50/20">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-gray-500">Activity</span>
          </div>
          <MessageSquare className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-hide">
          {activities.map((act, idx) => (
            <div key={idx} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-600 font-black shrink-0 shadow-sm border border-white">
                {act.actor?.name?.charAt(0) || 'U'}
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-800">{act.actor?.name || 'User'}</span> 
                  <span className="text-[9px] font-bold text-gray-400">{dayjs(act.createdAt).format('HH:mm')}</span>
                </div>
                <div className={`text-xs p-3 rounded-2xl shadow-sm border transition-all duration-200 ${
                  act.type === 'comment' ? 'bg-white border-blue-50 text-gray-700' : 'bg-gray-50 border-gray-100 text-gray-500 italic'
                }`}>
                  {act.content || act.type.replace(/_/g, ' ')}
                </div>
              </div>
            </div>
          ))}
          {activities.length === 0 && (
             <div className="p-10 text-center text-[10px] font-bold text-gray-300 uppercase italic">
               No activity yet
             </div>
          )}
        </div>
        <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
          <div className="relative group">
            <input 
              type="text" 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && postComment()}
              placeholder="Write a comment..." 
              className="w-full pl-4 pr-12 py-3 bg-gray-100 border-2 border-transparent rounded-2xl text-xs font-medium focus:ring-0 focus:border-blue-500 focus:bg-white transition-all outline-none"
            />
            <button 
              onClick={postComment}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-600 active:scale-90 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
