// frontend/src/component/canvas/MiniMapTimeline.jsx
import React, { useState, useEffect, useContext } from "react";
import { CanvasContext } from "../../context/CanvasContext";

const MAX_SNAPSHOTS = 20;

export default function MiniMapTimeline() {
  const { canvas } = useContext(CanvasContext);
  const [snapshots, setSnapshots] = useState([]);

  useEffect(() => {
    if (!canvas) return;

    const interval = setInterval(() => {
      setSnapshots((prev) => {
        const next = [...prev, JSON.stringify(canvas.toJSON())];
        // Cap history so it doesn't grow unbounded
        return next.length > MAX_SNAPSHOTS ? next.slice(-MAX_SNAPSHOTS) : next;
      });
    }, 10_000); // snapshot every 10 s

    return () => clearInterval(interval);
  }, [canvas]);

  const loadSnapshot = (snap) => {
    canvas.loadFromJSON(snap, canvas.renderAll.bind(canvas));
  };

  if (!snapshots.length) return null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 10,
        left: 270, // clear of LayerPanel
        background: "#fff",
        padding: "6px 10px",
        borderRadius: 4,
        border: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        gap: 4,
        zIndex: 100,
      }}
    >
      <strong style={{ marginRight: 6, fontSize: 12 }}>Timeline</strong>
      {snapshots.map((s, i) => (
        <button
          key={i}
          onClick={() => loadSnapshot(s)}
          title={`Restore snapshot ${i + 1}`}
          style={{ fontSize: 11 }}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}