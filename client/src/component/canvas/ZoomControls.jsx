// frontend/src/component/canvas/ZoomControls.jsx
import React, { useContext } from "react";
import { CanvasContext } from "../../context/CanvasContext";

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;

export default function ZoomControls() {
  const { canvas } = useContext(CanvasContext);

  const applyZoom = (factor) => {
    if (!canvas) return;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, canvas.getZoom() * factor));
    // Zoom toward the canvas centre
    const center = canvas.getCenter();
    canvas.zoomToPoint({ x: center.left, y: center.top }, next);
    canvas.renderAll();
  };

  const resetZoom = () => {
    if (!canvas) return;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.renderAll();
  };

  return (
    <div
      className="zoom-controls"
      style={{
        position: "absolute",
        bottom: 10,
        right: 220,
        display: "flex",
        flexDirection: "column",
        gap: 4,
        zIndex: 100,
      }}
    >
      <button onClick={() => applyZoom(1.15)} title="Zoom in">+</button>
      <button onClick={resetZoom} title="Reset zoom">⊙</button>
      <button onClick={() => applyZoom(0.87)} title="Zoom out">−</button>
    </div>
  );
}