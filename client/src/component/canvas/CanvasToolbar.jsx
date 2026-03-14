// frontend/src/component/canvas/CanvasToolbar.jsx
import React from "react";
import Toolbar from "./Toolbar";

export default function CanvasToolbar() {
  return (
    <div
      className="canvas-toolbar"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderBottom: "1px solid #ddd",
        background: "#fafafa",
      }}
    >
      <Toolbar />
    </div>
  );
}