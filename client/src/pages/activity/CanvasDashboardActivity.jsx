import { useCallback, useEffect, useMemo, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { request } from "../../api/client";

import ActivityFeed from "./ActivityFeed";
import VersionScrubber from "./VersionScrubber";
import NotificationsPanel from "./NotificationsPanel";
import CinematicReplay from "./CinematicReplay";
import LiveCursors from "./LiveCursors";
import MentionHighlights from "./MentionHighlights";

import "./CanvasActivity.css";

const EMPTY_SNAPSHOT = { nodes: [] };

export default function CanvasDashboardActivity({
  projectId,
  channelId,
  userId,
}) {
  const socket = useSocket();

  const [activities, setActivities] = useState([]);
  const [canvasActivities, setCanvasActivities] = useState([]);
  const [versions, setVersions] = useState([]);
  const [baseSnapshot, setBaseSnapshot] = useState(EMPTY_SNAPSHOT);
  const [replayOperations, setReplayOperations] = useState([]);
  const [liveOperations, setLiveOperations] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [mentions, setMentions] = useState([]);
  const [actors, setActors] = useState([]);
  const [speed, setSpeed] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      if (!projectId) {
        if (active) {
          setActivities([]);
          setVersions([]);
          setBaseSnapshot(EMPTY_SNAPSHOT);
          setReplayOperations([]);
          setCanvasActivities([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError("");

      try {
        const activityPromise = request(`/activity/project/${projectId}?limit=50`);

        if (!channelId) {
          const activityOnly = await activityPromise;
          if (!active) return;
          setActivities(Array.isArray(activityOnly) ? activityOnly : []);
          setVersions([]);
          setBaseSnapshot(EMPTY_SNAPSHOT);
          setReplayOperations([]);
          setCanvasActivities([]);
          return;
        }

        const [act, ver, playback, roomData] = await Promise.all([
          activityPromise,
          request(`/canvas-history/${channelId}`),
          request(`/canvas-playback/${channelId}`),
          request(`/mycanvas/room/${channelId}`),
        ]);

        if (!active) return;

        setActivities(Array.isArray(act) ? act : []);
        setVersions(Array.isArray(ver) ? ver : []);
        setBaseSnapshot(playback?.snapshot || EMPTY_SNAPSHOT);
        setReplayOperations(Array.isArray(playback?.operations) ? playback.operations : []);

        if (roomData?._id) {
          const canvasAct = await request(`/mycanvas/activity/${roomData._id}`);
          if (!active) return;
          setCanvasActivities(Array.isArray(canvasAct) ? canvasAct : []);
        } else {
          setCanvasActivities([]);
        }
      } catch (err) {
        if (active) {
          console.error("Failed to load dashboard data:", err);
          setError("Could not load activity dashboard data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [projectId, channelId]);

  useEffect(() => {
    if (!socket || !projectId) return;

    if (userId) socket.emit("join-user", userId);
    socket.emit("join-project", projectId);
    if (channelId) socket.emit("join-channel", channelId);

    const onCanvasUpdate = ({ op, actor }) => {
      if (!op) return;

      setLiveOperations((prev) => [...prev.slice(-199), op]);

      const id = actor?._id || actor?.id;
      if (!id) return;

      setActors((prev) => [
        ...prev.filter((a) => a.id !== id),
        {
          id,
          name: actor.name || "User",
          color: actor.color || "#4caf50",
          x: op.payload?.x,
          y: op.payload?.y,
        },
      ]);
    };

    const onMention = (mention) => {
      setMentions((prev) => [mention, ...prev].slice(0, 50));
    };

    const onActivity = (activity) => {
      setActivities((prev) => [activity, ...prev].slice(0, 100));
    };

    socket.on("canvas:update", onCanvasUpdate);
    socket.on("mention", onMention);
    socket.on("activity:new", onActivity);

    return () => {
      socket.off("canvas:update", onCanvasUpdate);
      socket.off("mention", onMention);
      socket.off("activity:new", onActivity);
    };
  }, [socket, projectId, channelId, userId]);

  const handleVersionSelect = useCallback(
    async (version) => {
      if (!channelId || !version) return;
      setSelectedVersion(version);

      try {
        const res = await request(
          `/canvas-playback/${channelId}?fromVersion=${version.version}`
        );

        if (res) {
          setBaseSnapshot(res.snapshot || EMPTY_SNAPSHOT);
          setReplayOperations(Array.isArray(res.operations) ? res.operations : []);
          setLiveOperations([]);
        }
      } catch (err) {
        console.error("Failed to load version playback:", err);
      }
    },
    [channelId]
  );

  const replayStream = useMemo(
    () => [...replayOperations, ...liveOperations],
    [replayOperations, liveOperations]
  );

  if (loading) {
    return <div className="canvas-dashboard-state">Loading activity dashboard…</div>;
  }

  return (
    <div className="canvas-dashboard-grid">
      <div className="dashboard-left">
        <h3>{channelId ? "Channel Activity" : "Project Activity"}</h3>
        {error && <div className="dashboard-error">{error}</div>}
        <ActivityFeed activities={activities} />

        {canvasActivities.length > 0 && (
          <div className="canvas-specific-activity">
            <h3>Canvas Engine Logs</h3>
            {canvasActivities.map((a) => (
              <div key={a._id} className="activity-item">
                <strong>{a.user?.username || a.user?.name || "User"}</strong> {a.action}
                <div className="activity-time">{new Date(a.createdAt).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {channelId && (
        <div className="dashboard-center">
          <VersionScrubber
            versions={versions}
            onSelect={handleVersionSelect}
            selectedVersion={selectedVersion}
          />

          <div className="cinematic-stage">
            <CinematicReplay base={baseSnapshot} operations={replayStream} speed={speed} />

            <LiveCursors actors={actors} />
            <MentionHighlights mentions={mentions} />

            <div className="speed-controls">
              <button
                className={speed === 0.5 ? "active" : ""}
                onClick={() => setSpeed(0.5)}
              >
                0.5x
              </button>
              <button
                className={speed === 1 ? "active" : ""}
                onClick={() => setSpeed(1)}
              >
                1x
              </button>
              <button
                className={speed === 2 ? "active" : ""}
                onClick={() => setSpeed(2)}
              >
                2x
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-right">
        <h3>Mentions & Alerts</h3>
        <NotificationsPanel mentions={mentions} />
      </div>
    </div>
  );
}
