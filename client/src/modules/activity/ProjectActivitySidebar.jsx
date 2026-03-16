import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import { request } from "../../api/client";
import { useProject } from "../../context/ProjectContext";
import { useSocket } from "../../context/SocketContext";

export default function ProjectActivitySidebar() {
  const { projectId } = useProject();
  const socket = useSocket();

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    if (!projectId) {
      setActivities([]);
      return;
    }

    const load = async () => {
      try {
        const data = await request(`/activity/project/${projectId}?limit=20`);
        setActivities(Array.isArray(data) ? data : []);
      } catch {
        setActivities([]);
      }
    };

    load();
  }, [projectId]);

  useEffect(() => {
    if (!socket || !projectId) return;

    const onNew = (entry) => {
      if (entry?.project && String(entry.project) !== String(projectId)) return;
      setActivities((prev) => [entry, ...prev].slice(0, 20));
    };

    socket.on("activity:new", onNew);
    return () => socket.off("activity:new", onNew);
  }, [socket, projectId]);

  return (
    <aside className="layout-activity-sidebar custom-scrollbar">
      <div className="activity-sidebar-header">
        <div className="title-wrap">
          <Activity size={15} />
          <h3>Activity Log</h3>
        </div>
      </div>

      <div className="activity-sidebar-list">
        {activities.length === 0 ? (
          <p className="empty">No activity yet.</p>
        ) : (
          activities.map((entry) => (
            <div key={entry._id} className="activity-entry">
              <div className="line1">
                <strong>{entry.actor?.name || "Someone"}</strong>
                <span>{entry.action || entry.type || "updated"}</span>
              </div>
              {entry.meta?.title && <div className="meta">{entry.meta.title}</div>}
              <div className="time">{new Date(entry.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
