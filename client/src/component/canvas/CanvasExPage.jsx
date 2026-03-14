// 📁 src/components/canvas/CanvasExPage.jsx
import React from "react";
import FabricBoard from "./FabricBoard";
import CanvasToolbar from "./CanvasToolbar";
import LayersPanel from "./LayersPanel";
import ZoomControls from "./ZoomControls";
import FloatingLayer from "../floating/FloatingLayer";
import "./canvas-page.css";

export default function CanvasExPage() {
  return (
    <div className="canvas-page">

      <CanvasToolbar />

      <div className="canvas-body">
        <LayersPanel />

        <div className="canvas-center">
          <FabricBoard />
          <FloatingLayer />
          <ZoomControls />
        </div>
      </div>

    </div>
  );
}
