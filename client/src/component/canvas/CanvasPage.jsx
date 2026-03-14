// frontend/src/component/canvas/CanvasPage.jsx
import React, { useEffect, useContext, useState } from "react";
import { CanvasContext } from "../../context/CanvasContext";
import { fabric } from "fabric";
import useFabric from "../../hooks/useFabric";
import useCRDT from "../../hooks/useCRDT";
import { connectNodes } from "../../utils/connector";

export default function CanvasPage() {
  const { canvas, setCanvas } = useContext(CanvasContext);

  const [roomId] = useState("room-1");
  // const [roomId] = useState("demo-room");
    const [tool, setTool] = useState("select");
  
  
  useFabric("canvas");
  useCRDT(roomId);

  useEffect(() => {
    const c = new fabric.Canvas("canvas", {
      width: window.innerWidth - 300,
      height: window.innerHeight - 50,
      selection: true
    });

    setCanvas(c);

    return () => c.dispose();
  }, []);

  const tools=[
    "select",
    "rect",
    "circle",
    "diamond",
    "line",
    "arrow",
    "pen",
    "connector",
    "text",
    "file",
    "url",
    "task"
  ];

  const addConnector = () => {
    if (nodes.length >= 2) {
      connectNodes(canvas, nodes[nodes.length - 2], nodes[nodes.length - 1]);
    }
  };

  return (
    <>
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar / Layer Panel */}
      <LayerPanel />

      {/* Main Canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        <canvas
          id="canvas"
          style={{ border: "1px solid #333", width: "100%", height: "100%" }}
        />

        {/* Tool Selector */}
        <div style={{ position: "absolute", top: 10, right: 10, background: "#fff", padding: 10, borderRadius: 8 }}>
          {tools.map((t) => (
            <button key={t} onClick={() => canvas.setActiveTool?.(t)} style={{ margin: 2 }}>{t}</button>
          ))}
          <button onClick={() => canvas.undo?.()}>Undo</button>
          <button onClick={() => canvas.redo?.()}>Redo</button>
          <button onClick={addConnector}>Add Connector</button>
          
        </div>

        <MiniMap />
      </div>
    </div>
    <div>
      
      {/*<canvas id="canvas" style={{ border: "1px solid #333" }} />*/}
    </div>
    </>
  );
}
