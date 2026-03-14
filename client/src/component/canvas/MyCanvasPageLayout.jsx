// frontend/src/component/canvas/MyCanvasPageLayout.jsx
import { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { CanvasContext } from "../../context/CanvasContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";

import LayerPanel from "./LayerPanel";
import MiniMap from "./MiniMap";
import MiniMapLive from "./MiniMapLive";
import MiniMapTimeline from "./MiniMapTimeline";
import ZoomControls from "./ZoomControls";
import CanvasToolbar from "./CanvasToolbar";

import FloatingLayer from "./FloatingLayer";

import "./canvas-layout.css";

export default function MyCanvasPageLayout({ channelId: channelIdProp }) {
  const { channelId: channelIdParam } = useParams();
  const channelId = channelIdProp || channelIdParam;

  const { canvas } = useContext(CanvasContext);
  const roomId = channelId || "demo-room";

  const [canvasReady, setCanvasReady] = useState(false);
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [leftTab, setLeftTab] = useState("tools");
  const [rightTab, setRightTab] = useState("zoom");

  useCanvasEngine(roomId);

  useEffect(() => {
    if (canvas) setCanvasReady(true);
  }, [canvas]);

   const defaultLayout = {
      leftOpen: true,
      rightOpen: true,
      leftWidth: 280,
      rightWidth: 300,
      dock: "default"
    };
  
    const [layout, setLayout] = useState(() => {
      const saved = localStorage.getItem("canvas-layout");
      return saved ? JSON.parse(saved) : defaultLayout;
    });
  
    useEffect(() => {
      localStorage.setItem("canvas-layout", JSON.stringify(layout));
    }, [layout]);

  return (
    <div className="canvas-layout">

      {/* ───────── Sticky Header ───────── */}
      <div className="canvas-header">
        <div className="header-left">
          <h4>Canvas Room: {roomId}</h4>
        </div>

        <div className="header-center">
          <button onClick={() => setLeftOpen(!leftOpen)}>☰</button>
          <button onClick={() => setRightOpen(!rightOpen)}>⚙</button>
        </div>

        <div className="header-right">
          <button onClick={() => canvas?.undo?.()}>Undo</button>
          <button onClick={() => canvas?.redo?.()}>Redo</button>
        </div>
      </div>

      {/* ───────── Body Layout ───────── */}
      <div className="canvas-body">

        {/* ───────── Left Sidebar ───────── */}
        {leftOpen && (
         <div
            className={`sidebar left ${layout.leftOpen ? "open" : "closed"}`}
            style={{ width: layout.leftOpen ? layout.leftWidth : 0 }}
         >

            <div className="sidebar-tabs">
              <button
                className={leftTab === "tools" ? "active" : ""}
                onClick={() => setLeftTab("tools")}
              >
                Tools
              </button>
              <button
                className={leftTab === "nodes" ? "active" : ""}
                onClick={() => setLeftTab("nodes")}
              >
                Nodes
              </button>
              <button
                className={leftTab === "layers" ? "active" : ""}
                onClick={() => setLeftTab("layers")}
              >
                Layers
              </button>
            </div>

            <div className="sidebar-content">
              {leftTab === "tools" && <CanvasToolbar />}
              {leftTab === "nodes" && <FloatingLayer />}
              {leftTab === "layers" && <LayerPanel />}
            </div>
          </div>
        )}

        {/* ───────── Canvas Area ───────── */}
        <div className="canvas-wrapper">
          <canvas id="canvas" className="fabric-canvas" />

          {!canvasReady && (
            <div className="canvas-loading">
              Initialising canvas…
            </div>
          )}
        </div>

        {/* ───────── Right Sidebar ───────── */}
        {rightOpen && (
          <div className="sidebar right">

            <div className="sidebar-tabs">
              <button
                className={rightTab === "zoom" ? "active" : ""}
                onClick={() => setRightTab("zoom")}
              >
                Zoom
              </button>
              <button
                className={rightTab === "minimap" ? "active" : ""}
                onClick={() => setRightTab("minimap")}
              >
                Minimap
              </button>
              <button
                className={rightTab === "timeline" ? "active" : ""}
                onClick={() => setRightTab("timeline")}
              >
                Timeline
              </button>
              <button
                className={rightTab === "live" ? "active" : ""}
                onClick={() => setRightTab("live")}
              >
                Live
              </button>
            </div>

            <div className="sidebar-content">
              {rightTab === "zoom" && <ZoomControls />}
              {rightTab === "minimap" && <MiniMap />}
              {rightTab === "timeline" && <MiniMapTimeline />}
              {rightTab === "live" && <MiniMapLive />}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
