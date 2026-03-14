// frontend/src/component/canvas/FloatingLayer.jsx
// FloatingLayer.jsx
// frontend/src/component/canvas/FloatingLayer.jsx
import { useEffect, useState, useContext, useRef } from "react";
import { CanvasContext } from "../../context/CanvasContext";
import { fabric } from "fabric";

export default function FloatingLayer() {
  const { canvas, logActivity } = useContext(CanvasContext);
  const [layers, setLayers] = useState([]);

  const addLayer = (obj) => {
    if (!canvas || !obj) return;

    obj.id = obj.id || Date.now().toString();
    obj.customType = obj.customType || "file"; // file/document
    obj.hasControls = true;
    obj.lockRotation = true;
    obj.cornerColor = "#4A90E2";
    obj.borderColor = "#4A90E2";
    obj.cornerStyle = "circle";
    obj.transparentCorners = false;

    canvas.add(obj);
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();

    logActivity(`Added ${obj.customType} (${obj.id})`);
  };

  const handleDelete = (obj) => {
    if (!canvas || !obj) return;
    canvas.remove(obj);
    canvas.requestRenderAll();
    logActivity(`Deleted ${obj.customType} (${obj.id})`);
  };

  // Track objects for re-render
  useEffect(() => {
    if (!canvas) return;

    const refresh = () => setLayers([...canvas.getObjects()]);
    canvas.on("object:added", refresh);
    canvas.on("object:removed", refresh);
    canvas.on("object:modified", refresh);
    refresh();

    return () => {
      canvas.off("object:added", refresh);
      canvas.off("object:removed", refresh);
      canvas.off("object:modified", refresh);
    };
  }, [canvas]);

  // Cursor feedback & log move/resize
  useEffect(() => {
    if (!canvas) return;

    const handleMoving = (e) => {
      const obj = e.target;
      canvas.hoverCursor = "grabbing";
    };
    const handleScaling = (e) => {
      const obj = e.target;
      canvas.hoverCursor = "nwse-resize";
    };
    const handleModified = (e) => {
      const obj = e.target;
      logActivity(`Modified ${obj.customType || obj.type} (${obj.id})`);
      canvas.hoverCursor = "grab";
    };
    const handleMouseUp = () => {
      canvas.hoverCursor = "grab";
    };

    canvas.on("object:moving", handleMoving);
    canvas.on("object:scaling", handleScaling);
    canvas.on("object:modified", handleModified);
    canvas.on("mouse:up", handleMouseUp);

    return () => {
      canvas.off("object:moving", handleMoving);
      canvas.off("object:scaling", handleScaling);
      canvas.off("object:modified", handleModified);
      canvas.off("mouse:up", handleMouseUp);
    };
  }, [canvas, logActivity]);

  return (
    <div className="floating-layer-container">
      {layers.map((obj) => (
        <div
          key={obj.id}
          className="floating-layer"
          style={{
            position: "absolute",
            top: obj.top,
            left: obj.left,
            border: "1px solid #4A90E2",
            padding: 4,
            background: "#fff",
            borderRadius: 6,
            cursor: "grab",
            zIndex: 999,
          }}
          onMouseDown={(e) => canvas.setActiveObject(obj)}
        >
          <span>{obj.customType}</span>
          <button
            style={{
              marginLeft: 6,
              border: "none",
              background: "red",
              color: "#fff",
              borderRadius: "50%",
              width: 18,
              height: 18,
              cursor: "pointer",
            }}
            onClick={() => handleDelete(obj)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
