// modules/sidebar/ChannelList.jsx
import { useEffect, useState, useMemo } from "react";
import { request } from "../../api/client";
import { useProject } from "../../context/ProjectContext";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import { Hash, Lock, Plus, ChevronRight } from "lucide-react";
import UnreadBadge from "./UnreadBadge";
import PresenceDot from "./PresenceDot";
import CreateChannelModal from "../chat/CreateChannelModal";

export default function ChannelList() {
  const { projectId } = useProject();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const { channelId } = useParams();

  const [channels, setChannels] = useState([]);
  const [unread, setUnread] = useState({});
  const [mentions, setMentions] = useState({});
  const [presence, setPresence] = useState({});
  const [open, setOpen] = useState(false);

  // =============================
  // LOAD CHANNELS
  // =============================
  useEffect(() => {
    const load = async () => {
      try {
        const data = await request(`/channels/project/${projectId}`);
        setChannels(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load channels", err);
      }
    };
    if (projectId) load();
  }, [projectId]);

  // =============================
  // SOCKET LISTENERS
  // =============================
  useEffect(() => {
    if (!socket) return;

    const onNew = (msg) => {
      if (!msg.channel) return;
      if (msg.channel === channelId) return;

      setUnread(prev => ({
        ...prev,
        [msg.channel]: (prev[msg.channel] || 0) + 1
      }));

      if (msg.mentions?.includes(user?._id)) {
        setMentions(prev => ({
          ...prev,
          [msg.channel]: true
        }));
      }
    };

    const onRead = ({ channel }) => {
      setUnread(prev => ({ ...prev, [channel]: 0 }));
      setMentions(prev => ({ ...prev, [channel]: false }));
    };

    const onPresence = (data) => {
      setPresence(data);
    };

    socket.on("message:new", onNew);
    socket.on("message:read", onRead);
    socket.on("presence:update", onPresence);

    return () => {
      socket.off("message:new", onNew);
      socket.off("message:read", onRead);
      socket.off("presence:update", onPresence);
    };
  }, [socket, channelId, user]);

  // =============================
  // PERMISSION FILTER
  // =============================
  const visible = useMemo(() => {
    return channels.filter(c => {
      if (c.type === "public") return true;
      return c.members?.includes(user?._id);
    });
  }, [channels, user]);

  return (
    <div className="mb-6 px-4">
      <div className="flex items-center justify-between mb-4 px-2">
        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Team Channels</h4>
        <button 
          onClick={() => setOpen(true)}
          className="p-1 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-indigo-600 transition-all"
        >
          <Plus size={16} />
        </button>
      </div>

      <div className="space-y-1">
        {visible.map(c => {
          const isActive = c._id === channelId;

          return (
            <div
              key={c._id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all group ${
                isActive 
                  ? "bg-indigo-50 text-indigo-600 shadow-sm" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
              onClick={() => navigate(`/projects/${projectId}/channels/${c._id}`)}
            >
              <div className="relative">
                 {c.type === 'private' ? <Lock size={14} className="text-gray-400" /> : <Hash size={16} className="text-gray-400 group-hover:text-indigo-500" />}
                 {presence[c._id] && (
                   <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border-2 border-white"></div>
                 )}
              </div>
              
              <span className="text-sm font-bold tracking-tight truncate flex-1">{c.name}</span>
              
              <UnreadBadge
                count={unread[c._id]}
                mention={mentions[c._id]}
              />

              <ChevronRight size={14} className={`transition-all ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"}`} />
            </div>
          );
        })}

        {visible.length === 0 && (
          <p className="px-3 py-4 text-[10px] font-black text-gray-300 uppercase tracking-widest text-center border-2 border-dashed border-gray-50 rounded-2xl italic">
            No channels available
          </p>
        )}
      </div>

      {open && <CreateChannelModal onClose={() => setOpen(false)} />}
    </div>
  );
}
