// CanvasDashboardActivity.jsx
import { useEffect, useState, useRef } from "react";
import { useSocket } from "../../context/SocketContext";
import { request } from "../../api/client";

import ActivityFeed from "./ActivityFeed";
import VersionScrubber from "./VersionScrubber";
import NotificationsPanel from "./NotificationsPanel";
import CinematicReplay from "./CinematicReplay";
import LiveCursors from "./LiveCursors";
import MentionHighlights from "./MentionHighlights";

import "./CanvasActivity.css";

export default function CanvasDashboardActivity({
  projectId,
  channelId,
  userId
}) {
  const socket = useSocket();

  const [activities, setActivities] = useState([]);
  const [canvasActivities, setCanvasActivities] = useState([]);
  const [versions, setVersions] = useState([]);
  const [baseSnapshot, setBaseSnapshot] = useState({ nodes: [] });
  const [replayOperations, setReplayOperations] = useState([]);
  const [liveOperations, setLiveOperations] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [mentions, setMentions] = useState([]);
  const [actors, setActors] = useState([]);
  const [speed, setSpeed] = useState(1);

  // ---------------- INITIAL LOAD ----------------
  useEffect(() => {
    async function load() {
      try {
        const fetches = [request(`/activity/project/${projectId}`)];
        
        if (channelId) {
          fetches.push(request(`/canvas-history/${channelId}`));
          fetches.push(request(`/canvas-playback/${channelId}`));
          fetches.push(request(`/mycanvas/room/${channelId}`));
        }

        const [act, ver, playback, roomData] = await Promise.all(fetches);

        setActivities(act || []);
        
        if (channelId) {
          setVersions(ver || []);
          setBaseSnapshot(playback?.snapshot || { nodes: [] });
          setReplayOperations(playback?.operations || []);

          if (roomData?._id) {
            const canvasAct = await request(`/mycanvas/activity/${roomData._id}`);
            setCanvasActivities(canvasAct || []);
          }
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    }

    if (projectId) {
      load();
    }
  }, [projectId, channelId]);

  // ---------------- SOCKET SETUP ----------------
  useEffect(() => {
    if (!socket) return;

    socket.emit("join-user", userId);
    socket.emit("join-project", projectId);
    if (channelId) socket.emit("join-channel", channelId);

    socket.on("canvas:update", ({ op, actor }) => {
      setLiveOperations(prev => [...prev, op]);

      const id = actor?._id || actor?.id;
      if (id) {
        setActors(prev => [
          ...prev.filter(a => a.id !== id),
          {
            id,
            name: actor.name,
            color: actor.color || "#4caf50",
            x: op.payload?.x,
            y: op.payload?.y
          }
        ]);
      }
    });

    socket.on("mention", mention => {
      setMentions(prev => [mention, ...prev]);
    });

    socket.on("activity:new", activity => {
      setActivities(prev => [activity, ...prev]);
    });

    return () => {
      socket.off("canvas:update");
      socket.off("mention");
      socket.off("activity:new");
    };
  }, [socket, projectId, channelId, userId]);

  // ---------------- VERSION SELECT ----------------
  const handleVersionSelect = async version => {
    if (!channelId) return;
    setSelectedVersion(version);

    try {
      const res = await request(
        `/canvas-playback/${channelId}?fromVersion=${version.version}`
      );

      if (res) {
        setBaseSnapshot(res.snapshot || { nodes: [] });
        setReplayOperations(res.operations || []);
        setLiveOperations([]);
      }
    } catch (err) {
      console.error("Failed to load version playback:", err);
    }
  };

  return (
    <div className="canvas-dashboard-grid">
      {/* LEFT: ACTIVITY FEED */}
      <div className="dashboard-left">
        <h3>{channelId ? "Channel Activity" : "Project Activity"}</h3>
        <ActivityFeed activities={activities} />
        
        {canvasActivities.length > 0 && (
          <div className="canvas-specific-activity">
            <h3>Canvas Engine Logs</h3>
            {canvasActivities.map(a => (
              <div key={a._id} className="activity-item">
                <strong>{a.user?.username}</strong> {a.action}
                <div className="activity-time">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CENTER: TIMELINE & REPLAY (Only if channelId provided) */}
      {channelId && (
        <div className="dashboard-center">
          <VersionScrubber
            versions={versions}
            onSelect={handleVersionSelect}
            selectedVersion={selectedVersion}
          />

          <div className="cinematic-stage">
            <CinematicReplay
              base={baseSnapshot}
              operations={[...replayOperations, ...liveOperations]}
              speed={speed}
            />

            <LiveCursors actors={actors} />
            <MentionHighlights mentions={mentions} />

            <div className="speed-controls">
              <button onClick={() => setSpeed(0.5)}>0.5x</button>
              <button onClick={() => setSpeed(1)}>1x</button>
              <button onClick={() => setSpeed(2)}>2x</button>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT: NOTIFICATIONS */}
      <div className="dashboard-right">
        <h3>Mentions & Alerts</h3>
        <NotificationsPanel mentions={mentions} />
      </div>
    </div>
  );
}
