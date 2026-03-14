// ActivityFeed.jsx
import { useEffect, useState } from "react";
import { request } from "../api/client";

export default function ActivityFeed({ projectId }) {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const load = async () => {
      const data = await request(`/activity/project/${projectId}`);
      setActivities(data);
    };
    load();
  }, [projectId]);

  return (
    <div className="activity-feed">
      <h3>Activity Feed</h3>
      {activities.map(a => (
        <div key={a._id} className="activity-item">
          <strong>{a.actor?.name}</strong> {a.action} <em>{a.entityType}</em>
          <span>{new Date(a.createdAt).toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}
