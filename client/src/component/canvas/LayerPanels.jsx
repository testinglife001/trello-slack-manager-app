// frontend/src/component/canvas/LayerPanels.jsx
// frontend/src/component/canvas/LayerPanels.jsx
import React, { useState, useEffect, useRef } from "react";

export default function LayerPanels({ canvas, openLayerModal, logActivity, snapshots = [], restoreSnapshot, setSnapshots }) {
  const [objects, setObjects] = useState([]);
  const [showSnapshots, setShowSnapshots] = useState(true);
  const dragItemIndex = useRef(null);
  const dragOverIndex = useRef(null);
  const dragType = useRef("layer"); // "layer" or "snapshot"

  // -------------------- Sync layers --------------------
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

  const selectLayer = (obj) => {
    canvas.discardActiveObject();
    canvas.setActiveObject(obj);
    canvas.renderAll();
    openLayerModal?.(obj);
  };

  // -------------------- Drag & Drop for Layers --------------------
  const reorderLayers = () => {
    const newObjects = [...objects];
    const [dragged] = newObjects.splice(dragItemIndex.current, 1);
    newObjects.splice(dragOverIndex.current, 0, dragged);
    newObjects.forEach((o, i) => o.moveTo(i));
    canvas.renderAll();
    setObjects(newObjects);
    logActivity(`${dragged.type} moved in stack`);
    dragItemIndex.current = null;
    dragOverIndex.current = null;
  };

  // -------------------- Drag & Drop for Snapshots --------------------
  const reorderSnapshots = () => {
    if (!setSnapshots) return;
    const newSnapshots = [...snapshots];
    const [dragged] = newSnapshots.splice(dragItemIndex.current, 1);
    newSnapshots.splice(dragOverIndex.current, 0, dragged);
    setSnapshots(newSnapshots);
    dragItemIndex.current = null;
    dragOverIndex.current = null;
  };

  const handleDragStart = (index, type) => (e) => {
    dragItemIndex.current = index;
    dragOverIndex.current = null;
    dragType.current = type;
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
    if (dragType.current === "layer") reorderLayers();
    else if (dragType.current === "snapshot") reorderSnapshots();
  };

  // -------------------- Layer Actions --------------------
  const bringFront = (obj) => { obj.bringToFront(); canvas.renderAll(); logActivity(`${obj.type} to front`); };
  const sendBack = (obj) => { obj.sendToBack(); canvas.renderAll(); logActivity(`${obj.type} sent to back`); };
  const toggleVisibility = (obj) => { obj.visible = !obj.visible; canvas.renderAll(); logActivity(`${obj.type} visibility ${obj.visible ? "shown" : "hidden"}`); };
  const toggleLock = (obj) => { const locked = !obj.lockMovementX; obj.lockMovementX = obj.lockMovementY = locked; canvas.renderAll(); logActivity(`${obj.type} ${locked ? "locked" : "unlocked"}`); };
  const deleteLayer = (obj) => { canvas.remove(obj); canvas.renderAll(); logActivity(`Deleted ${obj.type}`); };

  return (
    <div className="layer-panel" style={{ width: 250, padding: 10, overflowY: "auto", flexShrink: 0 }}>
      <h4>Layers</h4>

      {objects.map((obj, i) => (
        <div
          key={obj._uuid || obj.id || i}
          draggable
          onDragStart={handleDragStart(i, "layer")}
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
            style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
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

      <hr />
      <button onClick={() => setShowSnapshots(v => !v)}>
        {showSnapshots ? "Hide Snapshots" : "Show Snapshots"}
      </button>

      {showSnapshots && snapshots.length > 0 && (
        <div className="snapshots-list" style={{ marginTop: 8 }}>
          {snapshots.map((snap, i) => (
            <div
              key={snap._id}
              draggable
              onDragStart={handleDragStart(i, "snapshot")}
              onDragOver={handleDragOver(i)}
              onDrop={handleDrop}
              style={{
                display: "flex",
                flexDirection: "column",
                marginBottom: 6,
                padding: 4,
                border: "1px solid #ddd",
                borderRadius: 4,
                background: "#f9f9f9",
                cursor: "grab",
              }}
            >
              {snap.thumbnail && <img src={snap.thumbnail} alt="snapshot" width="120" style={{ marginBottom: 4 }} />}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12 }}>{new Date(snap.createdAt).toLocaleString()}</span>
                <button onClick={() => restoreSnapshot(snap)}>Restore</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}







/*
// frontend/src/component/canvas/LayerPanels.jsx
import React, { useState, useEffect, useRef } from "react";

export default function LayerPanels({ canvas, openLayerModal, logActivity, snapshots = [], restoreSnapshot }) {
  const [objects, setObjects] = useState([]);
  const [showSnapshots, setShowSnapshots] = useState(true);
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

  // Drag & Drop reorder
  const reorderObjects = () => {
    const newObjects = [...objects];
    const [dragged] = newObjects.splice(dragItemIndex.current, 1);
    newObjects.splice(dragOverIndex.current, 0, dragged);
    newObjects.forEach((o, i) => o.moveTo(i));
    canvas.renderAll();
    setObjects(newObjects);
    logActivity(`${dragged.type} moved in stack`);
  };

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
    <div className="layer-panel" style={{ width: 250, padding: 10, overflowY: "auto", flexShrink: 0 }}>
      <h4>Layers</h4>

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
            style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
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

      <hr />
      <button onClick={() => setShowSnapshots(v => !v)}>
        {showSnapshots ? "Hide Snapshots" : "Show Snapshots"}
      </button>

      {showSnapshots && snapshots.length > 0 && (
        <div className="snapshots-list" style={{ marginTop: 8 }}>
          {snapshots.map(snap => (
            <div key={snap._id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>{new Date(snap.createdAt).toLocaleString()}</span>
              <button onClick={() => restoreSnapshot(snap)}>Restore</button>
            </div>
          ))}
       
          {snapshots.map((snap) => (
            <div key={snap._id} className="snapshot-item" style={{ marginTop: 6 }}>
              {snap.thumbnail && <img src={snap.thumbnail} alt="snapshot" width="120" style={{ display: "block", marginBottom: 4 }} />}
              <button onClick={() => restoreSnapshot(snap)}>Restore Snapshot</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
*/






/*
import { useState } from "react";

export default function LayerPanels({ canvas, openLayerModal, logActivity, snapshots = [], restoreSnapshot }) {
  const [showSnapshots, setShowSnapshots] = useState(true);

  return (
    <div className="layer-panel">
      <h4>Layers</h4>
      {canvas?.getObjects().map(obj => (
        <div key={obj.id} className="layer-item" onClick={() => openLayerModal(obj)}>
          {obj.type} - {obj.id}
        </div>
      ))}

      <hr />
      <button onClick={() => setShowSnapshots(v => !v)}>
        {showSnapshots ? "Hide Snapshots" : "Show Snapshots"}
      </button>

      {showSnapshots && snapshots.length > 0 && (
        <div className="snapshots-list" style={{ marginTop: 8 }}>
          {snapshots.map(snap => (
            <div key={snap._id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <span>{new Date(snap.createdAt).toLocaleString()}</span>
              <button onClick={() => restoreSnapshot(snap)}>Restore</button>
            </div>
          ))}
        </div>
      )}

      {snapshots.map((s) => (
      <div key={s._id} className="snapshot-item">

        <img
          src={s.thumbnail}
          alt="snapshot"
          width="120"
        />

        <button onClick={() => restoreSnapshot(s)}>
          Restore Snapshot
        </button>

      </div>
      ))}
    </div>

  );
}
*/
