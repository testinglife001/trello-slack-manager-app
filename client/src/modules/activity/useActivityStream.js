// modules/activity/useActivityStream.js
import { useEffect, useState } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";

export default function useActivityStream(projectId) {
  const socket = useSocket();
  const [logs, setLogs] = useState([]);

  const load = async () => {
    if (!projectId) return;
    const data = await request(`/activity/project/${projectId}`);
    setLogs(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    load();
  }, [projectId]);

  useEffect(() => {
    if (!socket) return;

    const handler = (log) => {
      if (log.project !== projectId) return;
      setLogs(prev => [log, ...prev]);
    };

    socket.on("activity:new", handler);
    return () => socket.off("activity:new", handler);
  }, [socket, projectId]);

  return { logs, reload: load };
}
