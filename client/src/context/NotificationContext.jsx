// src/context/NotificationContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { useSocket } from "./SocketContext";
import { request } from "../api/client";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext();
export const useNotifications = () => useContext(NotificationContext);

export default function NotificationProvider({ children }) {
  const { user } = useAuth();

  const socket = useSocket();
  const [items, setItems] = useState([]);

  const load = async () => {
    const data = await request("/notifications");
    setItems(data || []);   // ⭐ protection
  };


  useEffect(() => {
    if (!user) return;   // ⭐ stop when logged out
    load();
  }, [user]);


  useEffect(() => {
    if (!socket) return;

    socket.on("notification:new", n => {
      setItems(prev => [n, ...prev]);
    });

    return () => socket.off("notification:new");
  }, [socket]);

  const markRead = async (id) => {
    await request(`/notifications/${id}/read`, { method: "PUT" });
    setItems(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
  };

  return (
    <NotificationContext.Provider value={{ items, markRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
