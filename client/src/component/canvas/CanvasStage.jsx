// canvas/CanvasStage.jsx
import React, { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import PortalOverlay from "./PortalOverlay";
import usePortalSync from "../../hooks/usePortalSync";


export default function CanvasStage() {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    const c = new fabric.Canvas("fabric-canvas", {
      selection: true,
      preserveObjectStacking: true,
    });

    setCanvas(c);
    canvasRef.current = c;

    return () => c.dispose();
  }, []);

  const portalNodes = usePortalSync(canvas);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <canvas
        id="fabric-canvas"
        width={window.innerWidth}
        height={window.innerHeight}
      />

      <PortalOverlay nodes={portalNodes} />
    </div>
  );
}
