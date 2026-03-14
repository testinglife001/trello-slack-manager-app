// frontend/src/component/canvas/MiniMapLive.jsx
// Live-scaled minimap using canvas.toDataURL for a pixel-perfect preview
import React, { useContext, useEffect, useRef } from "react";
import { CanvasContext } from "../../context/CanvasContext";

export default function MiniMapLive() {
  const { canvas } = useContext(CanvasContext);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!canvas) return;

    const update = () => {
      if (!imgRef.current) return;
      // toDataURL gives a true pixel snapshot — no cloning needed
      imgRef.current.src = canvas.toDataURL({ multiplier: 0.15 });
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
    };
  }, [canvas]);

  return (
    <img
      ref={imgRef}
      alt="Live minimap"
      style={{
        position: "absolute",
        right: 220, // sit beside MiniMap
        bottom: 10,
        width: 200,
        height: 150,
        border: "1px solid #333",
        background: "#f5f5f5",
        borderRadius: 4,
        zIndex: 100,
        objectFit: "contain",
      }}
    />
  );
}