import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import KanbanView from "../../clone/KanbanView";
import ChannelHeader from "../../modules/chat/ChannelHeader";
import MessageList from "../../modules/chat/MessageList";
import MessageInput from "../../modules/chat/MessageInput";
import TypingIndicator from "../../modules/chat/TypingIndicator";
import ThreadPanel from "../../modules/chat/ThreadPanel";
import { 
  Layout, 
  MessageSquare, 
  Settings, 
  Users, 
  Megaphone,
  Share2,
  BarChart2,
  Calendar as CalendarIcon,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';

import "./SocialMediaManager.css";

const SocialMediaManager = () => {
  const { channelId = "social-media-discussion" } = useParams();
  const [threadMsg, setThreadMsg] = useState(null);
  const [activeTab, setActiveTab] = useState("tasks"); // 'tasks' or 'analytics'
  const [selectedTask, setSelectedTask] = useState(null);
  const [discussionOpen, setDiscussionOpen] = useState(true);

  return (
    <div className="social-manager-container flex h-screen bg-gray-50 overflow-hidden font-sans text-gray-900">
      {/* Sidebar for Social Media Specifics */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 leading-tight">Ad Manager</h2>
              <p className="text-xs text-gray-500 font-medium tracking-wide uppercase">Social Media</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === 'tasks' ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Layout size={18} className={activeTab === 'tasks' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
            <span>Campaign Board</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${activeTab === 'calendar' ? 'bg-blue-50 text-blue-600 font-semibold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <CalendarIcon size={18} className={activeTab === 'calendar' ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
            <span>Content Calendar</span>
          </button>

          <button 
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
          >
            <BarChart2 size={18} className="text-gray-400 group-hover:text-gray-600" />
            <span>Performance</span>
          </button>

          <div className="pt-6 pb-2 px-4">
             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Platforms</span>
          </div>

          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
             <span className="text-sm font-medium">Facebook Ads</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
             <div className="w-2 h-2 rounded-full bg-pink-500"></div>
             <span className="text-sm font-medium">Instagram</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
             <div className="w-2 h-2 rounded-full bg-sky-400"></div>
             <span className="text-sm font-medium">Twitter / X</span>
          </button>
        </nav>

        <div className="p-4 mt-auto border-t border-gray-100">
          <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
                <img src="https://i.pravatar.cc/150?u=me" alt="User" />
             </div>
             <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">Alex Rivera</p>
                <p className="text-xs text-gray-500 truncate">Social Lead</p>
             </div>
             <Settings size={16} className="text-gray-400" />
          </div>
        </div>
      </div>

      {/* Main Feature Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white shadow-[-8px_0_24px_-12px_rgba(0,0,0,0.05)] z-10">
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Campaign Board</h1>
            <p className="text-sm text-gray-500 font-medium">Q1 Social Media Advertising Strategy</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
               {[1,2,3,4].map(i => (
                 <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden shadow-sm">
                    <img src={`https://i.pravatar.cc/100?u=team${i}`} alt="" />
                 </div>
               ))}
               <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shadow-sm">+8</div>
            </div>
            <div className="h-8 w-px bg-gray-200 mx-2"></div>
            
            <button 
              onClick={() => setDiscussionOpen(!discussionOpen)}
              className={`p-2.5 rounded-xl transition-all ${discussionOpen ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}
              title={discussionOpen ? "Close Discussion" : "Open Discussion"}
            >
              {discussionOpen ? <PanelRightClose size={20} /> : <MessageSquare size={20} />}
            </button>

            <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-blue-200 active:scale-95">
              <Share2 size={16} />
              <span>Share Campaign</span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden flex flex-col">
          <KanbanView onTaskClick={setSelectedTask} />
        </main>
      </div>

      {/* Slack-like Chat Sidebar for Group Discussion */}
      {discussionOpen && (
        <div className="w-[450px] flex flex-col border-l border-gray-200 bg-white transition-all animate-in slide-in-from-right duration-300">
          <div className="h-20 border-b border-gray-100 flex items-center px-6 flex-shrink-0">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600">
                  <MessageSquare size={18} />
               </div>
               <h3 className="font-bold text-gray-900">Team Discussion</h3>
            </div>
            <div className="ml-auto flex items-center gap-1">
               <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                  <span>Active</span>
               </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden relative social-chat-section">
             <MessageList openThread={setThreadMsg} />
             <div className="px-6 py-2">
               <TypingIndicator />
             </div>
             <div className="p-6 border-t border-gray-100 bg-white">
               <MessageInput />
             </div>
          </div>

          {threadMsg && (
            <div className="absolute inset-y-0 right-0 w-full bg-white z-20 border-l border-gray-200 flex flex-col shadow-2xl">
               <ThreadPanel message={threadMsg} onClose={() => setThreadMsg(null)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SocialMediaManager;
