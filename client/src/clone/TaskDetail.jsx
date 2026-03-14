import React from 'react';
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
  Send
} from 'lucide-react';
import { clsx } from 'clsx';

const TaskDetail = ({ task, onClose }) => {
  if (!task) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[800px] bg-white shadow-2xl z-50 flex flex-col border-l border-gray-100 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-14 px-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded text-gray-400 transition-colors"><X size={20} /></button>
          <div className="h-4 w-[1px] bg-gray-200 mx-2" />
          <div className="flex items-center gap-4 text-gray-500">
             <button className="flex items-center gap-2 hover:text-blue-600 transition-colors text-sm font-medium">
               <Share2 size={16} />
               <span>Share</span>
             </button>
             <button className="flex items-center gap-2 hover:text-red-600 transition-colors text-sm font-medium">
               <Trash2 size={16} />
               <span>Delete</span>
             </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
             <MoreHorizontal size={18} />
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 flex gap-8">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
           <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-800 leading-tight">Design a landing page</h1>
              
              <div className="grid grid-cols-2 gap-y-4 text-sm pt-4">
                 <div className="flex items-center gap-3 text-gray-400 font-medium">
                    <div className="w-8 flex justify-center"><CheckSquare size={18} /></div>
                    <span>Status</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md font-semibold text-xs border border-blue-100 flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full bg-blue-500" />
                       In Progress
                    </div>
                 </div>

                 <div className="flex items-center gap-3 text-gray-400 font-medium">
                    <div className="w-8 flex justify-center"><Type size={18} /></div>
                    <span>Type</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="px-3 py-1 bg-pink-50 text-pink-600 rounded-md font-semibold text-xs border border-pink-100">
                       Design
                    </div>
                 </div>

                 <div className="flex items-center gap-3 text-gray-400 font-medium">
                    <div className="w-8 flex justify-center"><Calendar size={18} /></div>
                    <span>Due date</span>
                 </div>
                 <div className="text-gray-700 font-medium">13 Apr 2024</div>

                 <div className="flex items-center gap-3 text-gray-400 font-medium">
                    <div className="w-8 flex justify-center"><User size={18} /></div>
                    <span>Responsible</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                       <img src="https://i.pravatar.cc/100?u=michael" alt="" />
                    </div>
                    <span className="text-gray-700 font-medium">Michael Martinez</span>
                 </div>
              </div>
           </div>

           <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center gap-3 text-gray-800 font-bold">
                 <AlignLeft size={20} className="text-gray-400" />
                 <h3>Description</h3>
              </div>
              <div className="pl-8 text-gray-600 space-y-4 leading-relaxed">
                 <p className="font-semibold text-gray-700">What we need on the Landing page:</p>
                 <ul className="list-disc pl-5 space-y-2 marker:text-gray-300">
                    <li>Photo of the main campaign character</li>
                    <li>Call to action above the fold</li>
                    <li>Pricing section</li>
                    <li>Section with Benefits</li>
                    <li>Client reviews</li>
                 </ul>
                 <p className="text-blue-500 font-medium cursor-pointer hover:underline">Please check the references attached to this task ✨</p>
              </div>
           </div>

           <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between text-gray-800 font-bold">
                 <div className="flex items-center gap-3">
                    <CheckSquare size={20} className="text-gray-400" />
                    <h3>Subtasks</h3>
                    <span className="text-gray-400 text-sm font-medium bg-gray-50 px-2 py-0.5 rounded ml-1">4</span>
                 </div>
                 <ChevronDown size={18} className="text-gray-300" />
              </div>
              <div className="pl-8 space-y-3">
                 {[
                   { title: 'Design the main screen', checked: false },
                   { title: 'Design the full Landing page for Desktop', checked: false },
                   { title: 'Adapt the Landing page design for Tablets', checked: false },
                   { title: 'Create a Mobile-friendly version of the Landing page', checked: false },
                 ].map((sub, i) => (
                   <div key={i} className="flex items-center gap-3 group">
                      <input type="checkbox" checked={sub.checked} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                      <span className="text-gray-600 text-sm group-hover:text-gray-900 transition-colors cursor-pointer">{sub.title}</span>
                   </div>
                 ))}
                 <button className="flex items-center gap-2 text-blue-600 text-sm font-semibold pt-2 hover:text-blue-700 transition-colors">
                    <Plus size={16} />
                    <span>Add Subtask</span>
                 </button>
              </div>
           </div>

           <div className="space-y-4 pt-4 border-t border-gray-50">
              <div className="flex items-center justify-between text-gray-800 font-bold">
                 <div className="flex items-center gap-3">
                    <AttachmentIcon size={20} className="text-gray-400" />
                    <h3>Files</h3>
                    <span className="text-gray-400 text-sm font-medium bg-gray-50 px-2 py-0.5 rounded ml-1">2</span>
                 </div>
                 <ChevronDown size={18} className="text-gray-300" />
              </div>
              <div className="pl-8 flex gap-4">
                 <div className="w-32 group cursor-pointer">
                    <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 group-hover:border-blue-400 transition-all overflow-hidden relative">
                       <span className="text-red-500 font-bold text-xs bg-white px-1.5 py-0.5 rounded shadow-sm z-10">PDF</span>
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
                    </div>
                    <span className="text-[11px] text-gray-500 mt-2 block truncate">Landing page structure.pdf</span>
                 </div>
                 <div className="w-32 group cursor-pointer">
                    <div className="aspect-[4/3] bg-gray-100 rounded-lg border border-gray-200 group-hover:border-blue-400 transition-all overflow-hidden relative">
                       <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400" className="w-full h-full object-cover" alt="" />
                       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all" />
                    </div>
                    <span className="text-[11px] text-gray-500 mt-2 block truncate">productivity marathon.png</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Sidebar / Activity */}
        <div className="w-[300px] border-l border-gray-50 pl-8 flex flex-col">
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                 <Share2 size={12} />
                 Following
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                 Followers
                 <div className="flex -space-x-1.5">
                    <div className="w-5 h-5 rounded-full border border-white bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/100?u=1" alt="" /></div>
                    <div className="w-5 h-5 rounded-full border border-white bg-gray-200 overflow-hidden"><img src="https://i.pravatar.cc/100?u=2" alt="" /></div>
                 </div>
              </div>
           </div>

           <div className="flex-1 overflow-y-auto space-y-6">
              <div className="text-center relative">
                 <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gray-100" />
                 <span className="bg-white relative px-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">10 Apr</span>
              </div>

              <div className="space-y-4">
                 {[
                   { user: 'Marry Williams', action: 'created a task', time: '12:45' },
                   { user: 'Marry Williams', action: 'added a new attachment', item: 'Landing page structure.pdf', time: '12:46' },
                   { user: 'Marry Williams', action: 'added a new attachment', item: 'productivity marathon.png', time: '12:47' },
                   { user: 'Marry Williams', action: 'added 4 new subtasks', time: '12:50' },
                 ].map((activity, i) => (
                   <div key={i} className="flex gap-3 text-[13px]">
                      <div className="w-6 h-6 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 mt-0.5">
                        <img src="https://i.pravatar.cc/100?u=marry" alt="" />
                      </div>
                      <div className="flex-1">
                         <p className="text-gray-800">
                           <span className="font-bold">{activity.user}</span> {activity.action}
                           {activity.item && <span className="block text-blue-500 font-medium mt-0.5 italic">{activity.item}</span>}
                         </p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="mt-auto pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-6 h-6 rounded-full bg-blue-100 overflow-hidden"><img src="https://i.pravatar.cc/100?u=me" alt="" /></div>
                 <div className="flex gap-1">
                   {[1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-200" />)}
                 </div>
              </div>
              <div className="relative">
                 <input 
                   type="text" 
                   placeholder="Type a message..." 
                   className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-4 pr-20 text-sm outline-none focus:border-blue-400 transition-all"
                 />
                 <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 text-gray-400">
                    <button className="p-1.5 hover:text-blue-500 transition-colors"><Smile size={18} /></button>
                    <button className="p-1.5 hover:text-blue-500 transition-colors"><Send size={18} /></button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
