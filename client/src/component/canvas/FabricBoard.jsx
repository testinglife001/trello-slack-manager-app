// 📁 FabricBoard.jsx
import React, { useEffect, useRef, useContext } from "react";
import { fabric } from "fabric";
import { CanvasContext } from "../../context/CanvasContext";
import { setupCanvas } from "./fabricHelpers";
import HistoryManager from "./HistoryManager";

export default function FabricBoard() {
  const canvasRef = useRef(null);
  const { setCanvas } = useContext(CanvasContext);

  useEffect(() => {
    const canvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: "#0f172a",
      selection: true
    });

    setupCanvas(canvas);
    HistoryManager(canvas);

    setCanvas(canvas);

    return () => canvas.dispose();
  }, []);

  return <canvas ref={canvasRef} className="fabric-canvas" />;
}

