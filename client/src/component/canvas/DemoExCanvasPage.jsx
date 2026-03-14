//  DemoExCanvasPage.jsx 
// 3️⃣ Enhanced DemoExCanvasPage.jsx with Tools & Timeline
import React, { useState, useContext } from "react";
import { CanvasContext } from "../../context/CanvasContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";
import LayerPanel from "./LayerPanel";
import MiniMapTimeline from "./MiniMapTimeline";
import { createTextNode, createTaskCardNode } from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";

export default function DemoExCanvasPage() {
  const { canvas, nodes } = useContext(CanvasContext);
  const [roomId] = useState("demo-room");
  const [tool, setTool] = useState("select");

  useCanvasEngine(roomId);

  const tools = ["select","rect","circle","diamond","line","arrow","pen","connector","text"];

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
        </div>

        <MiniMapTimeline />
      </div>
    </div>
  );
}
