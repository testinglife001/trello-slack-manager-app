import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSocket } from "./SocketContext";
import { request } from "../api/client";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

export default function NotificationProvider({ children }) {
  const { user } = useAuth();
  const socket = useSocket();

  const [items, setItems] = useState([]);

  const load = async () => {
    try {
      const data = await request("/notifications");
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    if (!user) {
      setItems([]);
      return;
    }
    load();
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const onNew = (n) => {
      setItems((prev) => [n, ...prev]);
    };

    socket.on("notification:new", onNew);
    return () => socket.off("notification:new", onNew);
  }, [socket]);

  const markRead = async (id) => {
    if (!id) return;

    try {
      await request(`/notifications/${id}/read`, { method: "PUT" });
    } catch {
      // Keep UI optimistic even if request fails.
    }

    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
  };

  const markAllRead = async () => {
    try {
      await request("/notifications/read-all", { method: "PUT" });
    } catch {
      // Keep UI optimistic even if request fails.
    }

    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadCount = useMemo(
    () => items.filter((i) => !i?.isRead).length,
    [items]
  );

  return (
    <NotificationContext.Provider value={{ items, unreadCount, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}
