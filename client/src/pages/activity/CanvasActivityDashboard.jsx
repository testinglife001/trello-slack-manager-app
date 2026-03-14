// CanvasActivityDashboard.jsx
import { useEffect, useState } from "react";
import { request } from "../../api/client";
import { useSocket } from "../../context/SocketContext";
import ActivityFeeds from "./ActivityFeeds";
import Timelines from "./Timelines";
import CinematicReplay from "./CinematicReplay";

export default function CanvasActivityDashboard({ projectId, channelId }) {
  const socket = useSocket();

  const [activities, setActivities] = useState([]);
  const [versions, setVersions] = useState([]);
  const [snapshot, setSnapshot] = useState({ nodes: [] });
  const [operations, setOperations] = useState([]);
  const [mentions, setMentions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);

  // ─────────────────────────────
  // Initial Load
  // ─────────────────────────────
  useEffect(() => {
    async function load() {
      const act = await request(`/activity/project/${projectId}`);
      const vers = await request(`/canvas-history/${channelId}`);
      const playback = await request(`/canvas-playback/${channelId}`);

      setActivities(act || []);
      setVersions(vers || []);
      setSnapshot(playback?.snapshot || { nodes: [] });
      setOperations(playback?.operations || []);
    }

    load();
  }, [projectId, channelId]);

  // ─────────────────────────────
  // Real-time
  // ─────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.emit("join-project", projectId);
    socket.emit("join-channel", channelId);

    socket.on("activity:new", activity => {
      setActivities(prev => [activity, ...prev]);
    });

    socket.on("canvas:update", data => {
      setOperations(prev => [...prev, data.op]);
    });

    socket.on("mention", mention => {
      setMentions(prev => [mention, ...prev]);
    });

    return () => {
      socket.off("activity:new");
      socket.off("canvas:update");
      socket.off("mention");
    };
  }, [socket, projectId, channelId]);

  // ─────────────────────────────
  // Version Select
  // ─────────────────────────────
  const handleVersionSelect = async (version) => {
    const data = await request(`/canvas-history/${channelId}/${version}`);
    if (data?.snapshot) {
      setSnapshot(data.snapshot);
      setSelectedVersion(version);
    }
  };

  return (
    <div className="dashboard-grid">

      {/* LEFT: ACTIVITY FEED */}
      <div className="left-panel">
        <h3>Activity Feed</h3>
        <ActivityFeeds activities={activities} />
      </div>

      {/* CENTER: TIMELINE + REPLAY */}
      <div className="center-panel">
        <h3>Timeline</h3>
        <Timelines
          versions={versions}
          onSelect={handleVersionSelect}
        />

        <h3>Cinematic Replay</h3>
        <CinematicReplay
          base={snapshot}
          operations={operations}
        />
      </div>

      {/* RIGHT: MENTIONS */}
      <div className="right-panel">
        <h3>Mentions</h3>
        {mentions.map((m, i) => (
          <div key={i} className="mention-card">
            <strong>{m.actor?.name}</strong> mentioned you
          </div>
        ))}
      </div>

    </div>
  );
}
