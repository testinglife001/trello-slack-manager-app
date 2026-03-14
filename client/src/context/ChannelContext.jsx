// context/ChannelContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSocket } from "./SocketContext";
import { request } from "../services/api";

const ChannelContext = createContext(null);

export function ChannelProvider({ children }) {
  const { projectId } = useParams();
  const socket = useSocket();

  const [channels, setChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState(null);
  const [loading, setLoading] = useState(false);

  // ── Load channels for the current project ───────────────────────────────────
  useEffect(() => {
    if (!projectId) return;

    setLoading(true);
    request(`/projects/${projectId}/channels`)
      .then(data => setChannels(data || []))
      .catch(err => console.error("Failed to load channels:", err))
      .finally(() => setLoading(false));
  }, [projectId]);

  // ── Join / leave active channel socket room ─────────────────────────────────
  useEffect(() => {
    if (!socket || !activeChannel) return;

    socket.emit("join-channel", activeChannel);

    return () => socket.emit("leave-channel", activeChannel);
  }, [socket, activeChannel]);

  return (
    <ChannelContext.Provider
      value={{
        channels,
        setChannels,
        activeChannel,
        setActiveChannel,
        loading,
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
}

export const useChannel = () => {
  const ctx = useContext(ChannelContext);
  if (!ctx) throw new Error("useChannel must be used inside <ChannelProvider>");
  return ctx;
};




/*
// context/ChannelContext.jsx
import {createContext,useContext,useState} from "react";

const ChannelContext=createContext();

export function ChannelProvider({children}){

 const [channels,setChannels]=useState([]);
 const [activeChannel,setActiveChannel]=useState(null);

 return(
  <ChannelContext.Provider value={{
    channels,
    setChannels,
    activeChannel,
    setActiveChannel
  }}>
    {children}
  </ChannelContext.Provider>
 );
}

export const useChannel=()=>useContext(ChannelContext);
*/
