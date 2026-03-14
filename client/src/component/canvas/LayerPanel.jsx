// frontend/src/component/canvas/LayerPanel.jsx
// frontend/src/component/canvas/LayerPanel.jsx
import React, { useContext, useEffect, useState, useRef } from "react";
import { CanvasContext } from "../../context/CanvasContext";

export default function LayerPanel({ canvas, openLayerModal, logActivity }) {
  const { nodes, setNodes } = useContext(CanvasContext);
  const [objects, setObjects] = useState([]);
  const dragItemIndex = useRef(null);
  const dragOverIndex = useRef(null);

  // Keep local layer list in sync with canvas
  useEffect(() => {
    if (!canvas) return;
    const refresh = () => setObjects([...canvas.getObjects()]);
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

  // Select a layer
  const selectLayer = (obj) => {
    canvas.discardActiveObject();
    canvas.setActiveObject(obj);
    canvas.renderAll();
    openLayerModal?.(obj);
  };

  // Move object in fabric stack after drag
  const reorderObjects = () => {
    const newObjects = [...objects];
    const [dragged] = newObjects.splice(dragItemIndex.current, 1);
    newObjects.splice(dragOverIndex.current, 0, dragged);

    // Fabric renders stack top-to-bottom, so last object is on top
    newObjects.forEach((o, i) => o.moveTo(i));

    canvas.renderAll();
    setObjects(newObjects);
    setNodes(newObjects);
    logActivity(`${dragged.type} moved in stack`);
  };

  // Drag events
  const handleDragStart = (index) => (e) => {
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", "");
  };

  const handleDragOver = (index) => (e) => {
    e.preventDefault();
    dragOverIndex.current = index;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (dragItemIndex.current === null || dragOverIndex.current === null) return;
    reorderObjects();
    dragItemIndex.current = null;
    dragOverIndex.current = null;
  };

  // Layer actions
  const bringFront = (obj) => { obj.bringToFront(); canvas.renderAll(); logActivity(`${obj.type} to front`); };
  const sendBack = (obj) => { obj.sendToBack(); canvas.renderAll(); logActivity(`${obj.type} sent to back`); };
  const toggleVisibility = (obj) => { obj.visible = !obj.visible; canvas.renderAll(); logActivity(`${obj.type} visibility ${obj.visible ? "shown" : "hidden"}`); };
  const toggleLock = (obj) => { const locked = !obj.lockMovementX; obj.lockMovementX = obj.lockMovementY = locked; canvas.renderAll(); logActivity(`${obj.type} ${locked ? "locked" : "unlocked"}`); };
  const deleteLayer = (obj) => { canvas.remove(obj); canvas.renderAll(); logActivity(`Deleted ${obj.type}`); };

  return (
    <div
      style={{
        width: 250,
        borderRight: "1px solid #ddd",
        padding: 10,
        overflowY: "auto",
        flexShrink: 0,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Layers</h3>

      {objects.map((obj, i) => (
        <div
          key={obj._uuid || obj.id || i}
          draggable
          onDragStart={handleDragStart(i)}
          onDragOver={handleDragOver(i)}
          onDrop={handleDrop}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 4,
            padding: "4px 6px",
            borderRadius: 4,
            cursor: "grab",
            background: canvas.getActiveObject() === obj ? "#e8f0fe" : "transparent",
          }}
        >
          <span
            onClick={() => selectLayer(obj)}
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {obj.type || obj._uuid || `Node ${i + 1}`}
          </span>

          <div style={{ display: "flex", gap: 2 }}>
            <button title="Front" onClick={() => bringFront(obj)}>F</button>
            <button title="Back" onClick={() => sendBack(obj)}>B</button>
            <button title="Toggle Visibility" onClick={() => toggleVisibility(obj)}>
              {obj.visible ? "👁" : "🚫"}
            </button>
            <button title="Lock/Unlock" onClick={() => toggleLock(obj)}>
              {obj.lockMovementX ? "🔒" : "🔓"}
            </button>
            <button title="Delete" onClick={() => deleteLayer(obj)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}

