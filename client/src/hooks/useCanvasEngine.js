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

    // ── Pan / Select behavior ─────────────────────────────────────────────────
    // NOTE:
    // We intentionally do NOT create objects on canvas click.
    // Canvas creation should happen from explicit UI actions (toolbar/buttons),
    // while mouse interactions on the board should prioritize select/drag.
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

      // No click-to-create behavior here (selection/drag is default).
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
      // Keep selection available so users can always click/drag-select objects.
      c.selection = true;
    };

    // Start in selection mode explicitly
    c.setActiveTool("select");

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
