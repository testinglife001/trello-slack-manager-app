// modules/chat/ChannelHeader.jsx
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { request } from "../../api/client";
import { Hash, Lock, Users, Sidebar, ExternalLink, MoreVertical } from "lucide-react";
import "./channelHeader.css";

export default function ChannelHeader({ canvasOpen, toggleCanvas }) {
  const { channelId, projectId } = useParams();
  const navigate = useNavigate();
  const socket = useSocket();

  const [online, setOnline] = useState([]);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);

  // =============================
  // LOAD CHANNEL INFO
  // =============================
  useEffect(() => {
    const load = async () => {
      try {
        const data = await request(`/channels/${channelId}`);
        setChannel(data);
        setLoading(false);
      } catch {
        setChannel(null);
      }
    };

    if (channelId) load();
  }, [channelId]);

  // =============================
  // PRESENCE
  // =============================
  useEffect(() => {
    if (!socket) return;
    socket.on("presence:update", setOnline);
    return () => socket.off("presence:update");
  }, [socket]);

  if (loading) return (
    <div className="h-16 flex items-center px-8 border-b border-gray-100 bg-white">
      <div className="w-48 h-4 bg-gray-100 animate-pulse rounded-full"></div>
    </div>
  );
  if (!channel) return null;

  const openCanvasPage = () => {
    navigate(`/projects/${projectId}/canvas/${channelId}`);
  };

  return (
    <div className="channel-header h-16 flex items-center justify-between px-8 border-b border-gray-100 bg-white shrink-0">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
           {channel.type === 'private' ? <Lock size={18} className="text-gray-400" /> : <Hash size={20} className="text-gray-400" />}
           <h3 className="font-black text-gray-900 tracking-tight italic uppercase">{channel.name}</h3>
        </div>
        <div className="h-4 w-px bg-gray-200"></div>
        <div className="flex items-center gap-1.5 text-gray-400 font-bold text-xs uppercase tracking-widest cursor-pointer hover:text-blue-600 transition-colors">
           <Users size={14} />
           <span>{online.length} Online</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={openCanvasPage}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
          title="Open Full Canvas"
        >
          <ExternalLink size={20} />
        </button>
        
        <button 
          onClick={toggleCanvas}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            canvasOpen 
              ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
              : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 border border-gray-200"
          }`}
        >
          <Sidebar size={16} />
          {canvasOpen ? "Hide" : "Show"}
        </button>

        <button className="p-2 text-gray-400 hover:text-gray-900 rounded-xl transition-colors">
           <MoreVertical size={20} />
        </button>
      </div>
    </div>
  );
}








/*
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { request } from "../../services/api";
 import "./channelHeader.css";

export default function ChannelHeader({ canvasOpen, toggleCanvas }) {

  
    const [loading, setLoading] = useState(true);

  const { channelId } = useParams();
  const socket = useSocket();

  const [online, setOnline] = useState([]);
  const [channel, setChannel] = useState(null);

  // =============================
  // LOAD CHANNEL INFO
  // =============================
  useEffect(() => {
    const load = async () => {
        try {
            const data = await request(`/channels/${channelId}`);
            console.log("CHANNEL:", data);   // 👈 ADD
            setChannel(data);
            setLoading(false);

        } catch (err) {
            console.log("CHANNEL ERROR:", err);  // 👈 ADD
            setChannel(null);
        }
    };


    if (channelId) load();
  }, [channelId]);

  // =============================
  // PRESENCE
  // =============================
  useEffect(() => {
    if (!socket) return;

    socket.on("presence:update", setOnline);
    return () => socket.off("presence:update");
  }, [socket]);

  
  if (!channel) {
    return (
      <div className="channel-header loading">
        Loading...
      </div>
    );
  }
  
  if (loading) return <div>Loading...</div>;

  return (
    <div className="channel-header" style={{marginTop:'0'}}>
      <div className="channel-main">


        <h3># {channel.name}</h3>
        <span className={`badge ${channel.type}`}>
          {channel.type}
        </span>
      </div>

     <div className="channel-meta">
        {online.length} online

        <button
          className="canvas-toggle"
          onClick={toggleCanvas}
        >
          {canvasOpen ? "Hide Canvas" : "Show Canvas"}
        </button>
      </div>
    </div>
  );
}
*/

