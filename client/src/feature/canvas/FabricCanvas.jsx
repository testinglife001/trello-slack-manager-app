// FabricCanvas.jsx

import { useEffect, useRef } from "react";
import { fabric } from "fabric";

export default function FabricCanvas() {
  const canvasRef = useRef();

  useEffect(() => {
    const canvas = new fabric.Canvas("board", {
      selection: true
    });

    // rectangle example
    const rect = new fabric.Rect({
      width: 120,
      height: 80,
      fill: "#4f46e5",
      left: 100,
      top: 100
    });

    canvas.add(rect);

    // zoom
    canvas.on("mouse:wheel", opt => {
      let zoom = canvas.getZoom();
      zoom *= 0.999 ** opt.e.deltaY;
      canvas.zoomToPoint(
        { x: opt.e.offsetX, y: opt.e.offsetY },
        zoom
      );
      opt.e.preventDefault();
    });

    canvasRef.current = canvas;

    return () => canvas.dispose();
  }, []);

  return <canvas id="board" width={2000} height={1200} />;
}
