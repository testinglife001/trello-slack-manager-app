// useCanvasEngine.js
// frontend/src/hooks/useCanvasEngine.js
import { useEffect, useContext, useRef } from "react";
import { CanvasContext } from "../context/CanvasContext";
import { fabric } from "fabric";
import * as Y from "yjs";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

export default function useCanvasEngine(roomId) {
  const { canvas, setCanvas, setNodes } = useContext(CanvasContext);

  const undoStack   = useRef([]);
  const redoStack   = useRef([]);
  const ydocRef     = useRef(null);
  const socketRef   = useRef(null);
  const currentTool = useRef("select");
  // Track whether we are mid-pan so tool handler can skip
  const isPanning   = useRef(false);

  useEffect(() => {
    // Only initialise once — canvas state persists in context
    if (canvas) return;

    // ── Create Fabric canvas ─────────────────────────────────────────────────
    const c = new fabric.Canvas("canvas", {
      width: window.innerWidth - 300,
      height: window.innerHeight - 50,
      selection: true,
      preserveObjectStacking: true,
      fireRightClick: true,
    });

    // ── Yjs CRDT ────────────────────────────────────────────────────────────
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;

    // ── Socket ───────────────────────────────────────────────────────────────
    const socket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;
    socket.emit("join-room", roomId);

    socket.on("connect_error", (err) =>
      console.warn("Canvas socket error:", err.message)
    );

    socket.on("sync", (updateBuf) => {
      Y.applyUpdate(ydoc, new Uint8Array(updateBuf));
      const json = ydoc.toJSON();
      c.loadFromJSON(json, () => {
        c.renderAll();
        setNodes([...c.getObjects()]);
      });
    });

    // ── Helpers ──────────────────────────────────────────────────────────────
    const pushUndo = () => {
      undoStack.current.push(JSON.stringify(c.toJSON()));
      redoStack.current = [];
    };

    const pushYjs = () => {
      const buf = Y.encodeStateAsUpdate(ydoc);
      socket.emit("update", buf);
    };

    const syncNodes = () => setNodes([...c.getObjects()]);

    // ── Object lifecycle events ───────────────────────────────────────────────
    c.on("object:added", (e) => {
      // Assign stable UUID on first add (skip clones that already have one)
      if (!e.target._uuid) e.target._uuid = uuidv4();
      pushUndo();
      syncNodes();
      pushYjs();
    });

    c.on("object:modified", () => { pushUndo(); syncNodes(); pushYjs(); });
    c.on("object:removed",  () => { pushUndo(); syncNodes(); pushYjs(); });

    // ── Zoom (mouse wheel) ────────────────────────────────────────────────────
    c.on("mouse:wheel", (opt) => {
      let zoom = c.getZoom();
      zoom *= 0.999 ** opt.e.deltaY;
      zoom = Math.max(0.2, Math.min(5, zoom));
      c.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    // ── Pan + Tool — SINGLE mouse:down handler ────────────────────────────────
    // Combining both into one handler avoids Fabric's event de-duplication
    // dropping the second listener registered to the same event name.
    let lastX = 0;
    let lastY = 0;

    c.on("mouse:down", (opt) => {
      // Alt+drag → pan
      if (opt.e.altKey) {
        isPanning.current = true;
        lastX = opt.e.clientX;
        lastY = opt.e.clientY;
        c.selection = false;
        return; // don't spawn a shape while panning
      }

      // Tool spawn
      const tool = currentTool.current;
      if (!tool || tool === "select" || tool === "pen" || tool === "connector") return;

      const pointer = c.getPointer(opt.e);
      let obj;

      switch (tool) {
        case "rect":
          obj = new fabric.Rect({
            left: pointer.x, top: pointer.y,
            width: 100, height: 60, fill: "#AAF",
          });
          break;

        case "circle":
          obj = new fabric.Circle({
            left: pointer.x, top: pointer.y,
            radius: 40, fill: "#FAA",
          });
          break;

        case "diamond":
          obj = new fabric.Polygon(
            [
              { x: pointer.x,      y: pointer.y - 40 },
              { x: pointer.x + 60, y: pointer.y      },
              { x: pointer.x,      y: pointer.y + 40 },
              { x: pointer.x - 60, y: pointer.y      },
            ],
            { fill: "#FFA" }
          );
          break;

        case "line":
          obj = new fabric.Line(
            [pointer.x, pointer.y, pointer.x + 100, pointer.y],
            { stroke: "#000", strokeWidth: 2, fill: null }
          );
          break;

        case "arrow":
          // Fabric has no built-in arrow; use a line with a marker comment
          obj = new fabric.Line(
            [pointer.x, pointer.y, pointer.x + 100, pointer.y],
            { stroke: "#000", strokeWidth: 2, fill: null }
          );
          obj._isArrow = true; // flag for custom rendering if needed
          break;

        case "text":
          obj = new fabric.Textbox("New Text", {
            left: pointer.x, top: pointer.y,
            width: 150, fontSize: 16,
          });
          break;

        case "task":
          obj = new fabric.Group(
            [
              new fabric.Rect({ width: 180, height: 80, fill: "#f9f9a9", rx: 6, ry: 6 }),
              new fabric.Textbox("Task", { left: 8, top: 8, width: 164, fontSize: 14 }),
            ],
            { left: pointer.x, top: pointer.y }
          );
          break;

        default:
          break;
      }

      if (obj) c.add(obj);
    });

    c.on("mouse:move", (opt) => {
      if (!isPanning.current) return;
      const vpt = c.viewportTransform;
      vpt[4] += opt.e.clientX - lastX;
      vpt[5] += opt.e.clientY - lastY;
      c.requestRenderAll();
      lastX = opt.e.clientX;
      lastY = opt.e.clientY;
    });

    c.on("mouse:up", () => {
      if (isPanning.current) {
        isPanning.current = false;
        c.selection = true;
      }
    });

    // ── Pen mode toggling ─────────────────────────────────────────────────────
    // Handled via setActiveTool below; Fabric's isDrawingMode does the rest.

    // ── Undo / Redo — exposed on the canvas instance ──────────────────────────
    c.undo = () => {
      if (!undoStack.current.length) return;
      const snapshot = undoStack.current.pop();
      redoStack.current.push(JSON.stringify(c.toJSON()));
      c.loadFromJSON(snapshot, () => { c.renderAll(); syncNodes(); });
      pushYjs();
    };

    c.redo = () => {
      if (!redoStack.current.length) return;
      const snapshot = redoStack.current.pop();
      undoStack.current.push(JSON.stringify(c.toJSON()));
      c.loadFromJSON(snapshot, () => { c.renderAll(); syncNodes(); });
      pushYjs();
    };

    // ── Active tool setter ────────────────────────────────────────────────────
    c.setActiveTool = (tool) => {
      currentTool.current = tool;
      // Pen mode is a special Fabric drawing mode
      c.isDrawingMode = tool === "pen";
      // Connector mode disables default selection to let user click two nodes
      c.selection = tool !== "connector";
    };

    // ── Resize canvas on window resize ────────────────────────────────────────
    const onResize = () => {
      c.setWidth(window.innerWidth - 300);
      c.setHeight(window.innerHeight - 50);
      c.renderAll();
    };
    window.addEventListener("resize", onResize);

    // ── Commit to context ONCE, after everything is wired ─────────────────────
    setCanvas(c);

    // ── Cleanup ───────────────────────────────────────────────────────────────
    return () => {
      window.removeEventListener("resize", onResize);
      socket.disconnect();
      c.dispose();
    };

  }, [roomId]); // re-init only if the room changes
}




/*
// 1️⃣ Update useCanvasEngine.js with Tool Support + Drag & Multi-Select
import { useEffect, useContext, useRef } from "react";
import { CanvasContext } from "../context/CanvasContext";
import { fabric } from "fabric";
import * as Y from "yjs";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

export default function useCanvasEngine(roomId) {
  const { canvas, setCanvas, nodes, setNodes } = useContext(CanvasContext);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const ydocRef = useRef(null);
  const socketRef = useRef(null);
  const currentTool = useRef("select");
  // Track whether we are mid-pan so tool handler can skip
  const isPanning   = useRef(false);

  useEffect(() => {
    if (canvas) return;

    const c = new fabric.Canvas("canvas", {
      width: window.innerWidth - 300,
      height: window.innerHeight - 50,
      selection: true,
      preserveObjectStacking: true,
      fireRightClick: true,
    });
    setCanvas(c);

    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    const socket = io("http://localhost:5000");
    socketRef.current = socket;
    socket.emit("join-room", roomId);

    // Sync CRDT updates
    socket.on("sync", (updateBuf) => {
      Y.applyUpdate(ydoc, updateBuf);
      const json = ydoc.toJSON();
      c.loadFromJSON(json, c.renderAll.bind(c));
      setNodes([...c.getObjects()]);
    });

    const pushUndo = () => {
      undoStack.current.push(JSON.stringify(c.toJSON()));
      redoStack.current = [];
    };

    const pushYjs = () => {
      const updateBuf = Y.encodeStateAsUpdate(ydoc);
      socket.emit("update", updateBuf);
    };

    // --- Fabric object events ---
    c.on("object:added", (e) => {
      e.target._uuid = uuidv4();
      pushUndo();
      setNodes([...c.getObjects()]);
      pushYjs();
    });
    c.on("object:modified", () => { pushUndo(); setNodes([...c.getObjects()]); pushYjs(); });
    c.on("object:removed", () => { pushUndo(); setNodes([...c.getObjects()]); pushYjs(); });

    // --- Zoom & Pan ---
    c.on("mouse:wheel", (opt) => {
      let zoom = c.getZoom();
      zoom *= 0.999 ** opt.e.deltaY;
      zoom = Math.max(0.2, Math.min(5, zoom));
      c.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    let isDragging = false, lastX, lastY;
    c.on("mouse:down", (opt) => {
      if (opt.e.altKey) { isDragging = true; lastX = opt.e.clientX; lastY = opt.e.clientY; }
    });
    c.on("mouse:move", (opt) => {
      if (isDragging) {
        const vpt = c.viewportTransform;
        vpt[4] += opt.e.clientX - lastX;
        vpt[5] += opt.e.clientY - lastY;
        c.requestRenderAll();
        lastX = opt.e.clientX; lastY = opt.e.clientY;
      }
    });
    c.on("mouse:up", () => { isDragging = false; });

    // --- Multi-select handles
    c.on("selection:created", () => {});
    c.on("selection:updated", () => {});
    c.on("selection:cleared", () => {});

    // --- Undo/Redo ---
    c.undo = () => {
      if (!undoStack.current.length) return;
      const json = undoStack.current.pop();
      redoStack.current.push(JSON.stringify(c.toJSON()));
      c.loadFromJSON(json, c.renderAll.bind(c));
      pushYjs();
    };
    c.redo = () => {
      if (!redoStack.current.length) return;
      const json = redoStack.current.pop();
      undoStack.current.push(JSON.stringify(c.toJSON()));
      c.loadFromJSON(json, c.renderAll.bind(c));
      pushYjs();
    };

    // --- Tool handling ---
    c.setActiveTool = (tool) => currentTool.current = tool;
    c.on("mouse:down", (opt) => {
      if (!currentTool.current || currentTool.current === "select") return;

      const pointer = c.getPointer(opt.e);
      let obj;
      switch (currentTool.current) {
        case "rect":
          obj = new fabric.Rect({ left: pointer.x, top: pointer.y, width: 100, height: 60, fill: "#AAF" });
          break;
        case "circle":
          obj = new fabric.Circle({ left: pointer.x, top: pointer.y, radius: 40, fill: "#FAA" });
          break;
        case "diamond":
          obj = new fabric.Polygon([
            { x: pointer.x, y: pointer.y-30 },
            { x: pointer.x+50, y: pointer.y },
            { x: pointer.x, y: pointer.y+30 },
            { x: pointer.x-50, y: pointer.y }
          ], { fill: "#FFA" });
          break;
        case "line":
          obj = new fabric.Line([pointer.x, pointer.y, pointer.x+100, pointer.y], { stroke: "#000", strokeWidth: 2 });
          break;
        case "arrow":
          obj = new fabric.Line([pointer.x, pointer.y, pointer.x+100, pointer.y], { stroke: "#000", strokeWidth: 2, endArrow: true });
          break;
        case "text":
          obj = new fabric.Textbox("New Text", { left: pointer.x, top: pointer.y, width: 150, fontSize: 16 });
          break;
      }
      if (obj) c.add(obj);
    });

    setCanvas(c);
    return () => socket.disconnect();
  }, []);
}
*/

