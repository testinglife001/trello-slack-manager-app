// frontend/src/component/canvas/Toolbar.jsx
import React, { useContext } from "react";
import { CanvasContext } from "../../context/CanvasContext";
import { fabric } from "fabric";

export default function Toolbar() {
  const { canvas } = useContext(CanvasContext);

  const addRect = () => {
    if (!canvas) return;
    canvas.add(
      new fabric.Rect({ left: 200, top: 150, width: 120, height: 80, fill: "#2563eb" })
    );
  };

  const addCircle = () => {
    if (!canvas) return;
    canvas.add(
      new fabric.Circle({ radius: 50, fill: "#22c55e", left: 250, top: 200 })
    );
  };

  const togglePen = () => {
    if (!canvas) return;
    canvas.isDrawingMode = !canvas.isDrawingMode;
  };

  return (
    <>
      <button onClick={addRect}>Rectangle</button>
      <button onClick={addCircle}>Circle</button>
      <button onClick={togglePen}>Pen</button>
    </>
  );
}