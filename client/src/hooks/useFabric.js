// 2️⃣ frontend/src/hooks/useFabric.js
import { useEffect, useContext } from "react";
import { CanvasContext } from "../context/CanvasContext";
import { fabric } from "fabric";

export default function useFabric(canvasId) {
  const { canvas, setCanvas, nodes, setNodes } = useContext(CanvasContext);

  useEffect(() => {
    if (canvas) return;

    const c = new fabric.Canvas(canvasId, {
      width: window.innerWidth - 300,
      height: window.innerHeight - 50,
      selection: true,
    });

    setCanvas(c);

    // Track added objects
    c.on("object:added", (e) => {
      if (!e.target._addedByEngine) return;
      setNodes((prev) => [...prev, e.target]);
    });

    // Track modifications for undo/redo
    c.on("object:modified", () => {
      setNodes([...c.getObjects()]);
    });

    return () => c.dispose();
  }, []);
}
