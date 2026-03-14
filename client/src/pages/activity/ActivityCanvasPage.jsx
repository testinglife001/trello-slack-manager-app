// src/pages/activity/ActivityCanvasPage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../api/client";
import "./ActivityCanvas.css";

export default function ActivityCanvasPage() {
  const { channelId } = useParams();
  const [room, setRoom] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!channelId) return;
      try {
        setLoading(true);
        // 1. Get Room from ChannelId
        const roomData = await request(`/mycanvas/room/${channelId}`);
        setRoom(roomData);

        // 2. Get Activity from RoomId
        const activityData = await request(`/mycanvas/activity/${roomData._id}`);
        setActivities(activityData);
      } catch (err) {
        console.error("Failed to load activity canvas:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [channelId]);

  if (loading) return <div>Loading Activity Canvas...</div>;
  if (!room) return <div>No Canvas Room found for this channel.</div>;

  return (
    <div className="activity-canvas-container">
      <h2>Activity for {room.name || "Untitled Room"}</h2>
      <div className="activity-canvas-list">
        {activities.map((a) => (
          <div key={a._id} className="activity-canvas-item">
            <div className="activity-user">
              <strong>{a.user?.username || "Unknown User"}</strong>
            </div>
            <div className="activity-action">{a.action}</div>
            <div className="activity-meta">
               {a.metadata && Object.keys(a.metadata).length > 0 && (
                 <pre>{JSON.stringify(a.metadata, null, 2)}</pre>
               )}
            </div>
            <div className="activity-time">
              {new Date(a.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
        {activities.length === 0 && <p>No activities yet.</p>}
      </div>
    </div>
  );
}
