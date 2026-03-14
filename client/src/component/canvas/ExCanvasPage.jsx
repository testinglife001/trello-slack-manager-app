// ExCanvasPage.jsx
// 3️⃣ Integrate Into ExCanvasPage.jsx
import React, { useState, useContext } from "react";
import { CanvasContext } from "../../context/CanvasContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";
import LayerPanel from "./LayerPanel";
import MiniMap from "./MiniMap";
import { createTextNode, createTaskCardNode } from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";
import MiniMapLive from "./MiniMapLive";

export default function ExCanvasPage() {
  const { canvas, nodes } = useContext(CanvasContext);
  const [roomId] = useState("demo-room");

  useCanvasEngine(roomId);

  const tools = ["select","rect","circle","diamond","line","arrow","pen","connector","text"];

  const addConnector = () => {
    if (nodes.length >= 2) {
      connectNodes(canvas, nodes[nodes.length - 2], nodes[nodes.length - 1]);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <LayerPanel />

      <div style={{ flex: 1, position: "relative" }}>
        <canvas id="canvas" style={{ border: "1px solid #333", width: "100%", height: "100%" }} />

        {/* Tool Selector */}
        <div style={{ position: "absolute", top: 10, right: 10, background: "#fff", padding: 10, borderRadius: 8 }}>
          {tools.map((t) => (
            <button key={t} onClick={() => canvas.setActiveTool?.(t)} style={{ margin: 2 }}>{t}</button>
          ))}
          <button onClick={() => canvas.undo?.()}>Undo</button>
          <button onClick={() => canvas.redo?.()}>Redo</button>
          <button onClick={addConnector}>Add Connector</button>
        </div>

        <MiniMapLive />
      </div>
    </div>
  );
}
