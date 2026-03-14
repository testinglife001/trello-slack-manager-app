// 1️⃣ frontend/src/component/canvas/DemoCanvasPage.jsx
import React, { useEffect, useContext, useState } from "react";
import { CanvasContext } from "../../context/CanvasContext";
import useCanvasEngine from "../../hooks/useCanvasEngine";
import LayerPanel from "./LayerPanel";
import MiniMap from "./MiniMap";
import { createTextNode, createImageNode, createTaskCardNode } from "../../utils/nodeFactory";
import { connectNodes } from "../../utils/connector";

export default function DemoCanvasPage() {
  const { canvas, nodes, setNodes } = useContext(CanvasContext);
  const [roomId] = useState("demo-room");
  const [noteText, setNoteText] = useState("");

  // Initialize canvas engine (CRDT + Fabric + Zoom/Pan/Undo/Redo)
  useCanvasEngine(roomId);

  // Add nodes
  const addTextNode = () => {
    const node = createTextNode("Hello World");
    node.left = 100;
    node.top = 100;
    canvas.add(node);
  };

  const addParagraphNode = () => {
    const node = createTextNode("This is a paragraph with multiple lines.\nYou can edit it.");
    node.left = 300;
    node.top = 100;
    node.width = 200;
    node.set({ fontSize: 14 });
    canvas.add(node);
  };

  const addChecklistNode = () => {
    const checklist = createTextNode("- [ ] Item 1\n- [ ] Item 2\n- [ ] Item 3");
    checklist.left = 100;
    checklist.top = 250;
    checklist.width = 180;
    checklist.set({ fontSize: 14, fill: "#333" });
    canvas.add(checklist);
  };

  const addImageNode = () => {
    createImageNode("https://via.placeholder.com/150").then((img) => {
      img.left = 350;
      img.top = 250;
      canvas.add(img);
    });
  };

  const addTaskCardNode = () => {
    const node = createTaskCardNode("Task Card Example");
    node.left = 200;
    node.top = 400;
    canvas.add(node);
  };

  // Add connector between first two nodes
  const addConnector = () => {
    if (nodes.length >= 2) {
      connectNodes(canvas, nodes[nodes.length - 2], nodes[nodes.length - 1]);
    }
  };

  // Add note inside canvas
  const addNote = () => {
    if (!noteText) return;
    const note = createTextNode(noteText, { fill: "#222", fontSize: 14, width: 200 });
    note.left = 150;
    note.top = 550;
    canvas.add(note);
    setNoteText("");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Layer Panel */}
      <LayerPanel />

      {/* Main Canvas */}
      <div style={{ flex: 1, position: "relative" }}>
        <canvas id="canvas" style={{ border: "1px solid #333", width: "100%", height: "100%" }} />

        {/* MiniMap */}
        <MiniMap />

        {/* Control Panel */}
        <div style={{ position: "absolute", top: 10, left: 10, background: "#fff", padding: 10, borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
          <button onClick={addTextNode}>Add Text Node</button>{" "}
          <button onClick={addParagraphNode}>Add Paragraph</button>{" "}
          <button onClick={addChecklistNode}>Add Checklist</button>{" "}
          <button onClick={addImageNode}>Add Image</button>{" "}
          <button onClick={addTaskCardNode}>Add Task Card</button>{" "}
          <button onClick={addConnector}>Add Connector</button>{" "}
          <button onClick={() => canvas.undo?.()}>Undo</button>{" "}
          <button onClick={() => canvas.redo?.()}>Redo</button>
          <div style={{ marginTop: 10 }}>
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add note"
              style={{ width: 150 }}
            />{" "}
            <button onClick={addNote}>Add Note</button>
          </div>
        </div>
      </div>
    </div>
  );
}
