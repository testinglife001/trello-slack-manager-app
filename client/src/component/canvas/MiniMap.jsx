// frontend/src/component/canvas/MiniMap.jsx
// Static snapshot minimap — clones objects on change
import React, { useContext, useEffect, useRef } from "react";
import { CanvasContext } from "../../context/CanvasContext";
import { fabric } from "fabric";

export default function MiniMap() {
  const { canvas } = useContext(CanvasContext);
  const miniRef = useRef(null);
  const miniCanvasRef = useRef(null);

  useEffect(() => {
    if (!canvas || !miniRef.current) return;

    const mini = new fabric.StaticCanvas(miniRef.current, {
      width: 200,
      height: 150,
      selection: false,
    });
    miniCanvasRef.current = mini;

    const SCALE = 200 / (window.innerWidth - 300);

    const update = () => {
      mini.clear();
      canvas.getObjects().forEach((obj) => {
        obj.clone((cloned) => {
          cloned.scaleX = (cloned.scaleX || 1) * SCALE;
          cloned.scaleY = (cloned.scaleY || 1) * SCALE;
          cloned.left = (cloned.left || 0) * SCALE;
          cloned.top = (cloned.top || 0) * SCALE;
          cloned.selectable = false;
          cloned.evented = false;
          mini.add(cloned);
          mini.renderAll();
        });
      });
    };

    canvas.on("object:added", update);
    canvas.on("object:modified", update);
    canvas.on("object:moving", update);
    canvas.on("object:removed", update);

    update();

    return () => {
      canvas.off("object:added", update);
      canvas.off("object:modified", update);
      canvas.off("object:moving", update);
      canvas.off("object:removed", update);
      mini.dispose();
    };
  }, [canvas]);

  return (
    <canvas
      ref={miniRef}
      style={{
        position: "absolute",
        bottom: 10,
        right: 10,
        border: "1px solid #aaa",
        background: "#fff",
        borderRadius: 4,
        zIndex: 100,
      }}
    />
  );
}
