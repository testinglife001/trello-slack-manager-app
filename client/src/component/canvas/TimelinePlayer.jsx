// frontend/src/component/canvas/TimelinePlayer.jsx
import { useState, useEffect, useRef } from "react";
import { request } from "../../api/client";

export default function TimelinePlayer({ canvas, activeBoard }) {
  const [snapshots, setSnapshots] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef(null);

  // Load snapshots from backend whenever activeBoard changes
  useEffect(() => {
    if (!activeBoard) return;

    const loadSnapshots = async () => {
      try {
        const data = await request(`/mycanvas/snapshots/${activeBoard._id}`);
        setSnapshots(data);
        setCurrentIndex(0);
      } catch (err) {
        console.error("Failed to load snapshots:", err);
      }
    };

    loadSnapshots();
  }, [activeBoard]);

  // Function to restore a single snapshot on the canvas
  const restoreSnapshotOnCanvas = (snapshot) => {
    if (!canvas || !snapshot?.fabricJson) return;
    canvas.loadFromJSON(snapshot.fabricJson, () => {
      canvas.renderAll();
    });
  };

  // Play snapshots as a timeline animation
  useEffect(() => {
    if (!playing || snapshots.length === 0) return;

    intervalRef.current = setInterval(() => {
      const snapshot = snapshots[currentIndex];
      if (snapshot) restoreSnapshotOnCanvas(snapshot);

      setCurrentIndex((prev) => {
        if (prev + 1 >= snapshots.length) {
          clearInterval(intervalRef.current);
          setPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1000); // 1 second per snapshot (adjust speed if needed)

    return () => clearInterval(intervalRef.current);
  }, [playing, currentIndex, snapshots, canvas]);

  const handlePlay = () => {
    if (snapshots.length === 0) return;
    setPlaying(true);
    setCurrentIndex(0);
  };

  const handlePause = () => {
    setPlaying(false);
    clearInterval(intervalRef.current);
  };

  const handleStepBack = () => {
    setPlaying(false);
    clearInterval(intervalRef.current);
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
    restoreSnapshotOnCanvas(snapshots[Math.max(currentIndex - 1, 0)]);
  };

  const handleStepForward = () => {
    setPlaying(false);
    clearInterval(intervalRef.current);
    setCurrentIndex((prev) => Math.min(prev + 1, snapshots.length - 1));
    restoreSnapshotOnCanvas(snapshots[Math.min(currentIndex + 1, snapshots.length - 1)]);
  };

  return (
    <div className="timeline-player" style={{ display: "flex", flexDirection: "column", padding: 8, borderTop: "1px solid #ccc" }}>
      <div className="controls" style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <button onClick={handleStepBack} disabled={currentIndex === 0}>⏮️</button>
        {playing ? (
          <button onClick={handlePause}>⏸️ Pause</button>
        ) : (
          <button onClick={handlePlay} disabled={snapshots.length === 0}>▶️ Play</button>
        )}
        <button onClick={handleStepForward} disabled={currentIndex >= snapshots.length - 1}>⏭️</button>
        <span>{snapshots.length > 0 ? `Snapshot ${currentIndex + 1} / ${snapshots.length}` : "No snapshots"}</span>
      </div>
      <div className="timeline-bar" style={{ height: 8, marginTop: 8, background: "#eee", position: "relative" }}>
        <div
          style={{
            height: "100%",
            width: snapshots.length > 0 ? `${((currentIndex + 1) / snapshots.length) * 100}%` : "0%",
            background: "#007bff",
            transition: "width 0.3s",
          }}
        />
      </div>
    </div>
  );
}