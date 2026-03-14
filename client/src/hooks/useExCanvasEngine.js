// 2️⃣ frontend/src/hooks/useExCanvasEngine.js
import { useEffect, useContext, useRef } from "react";
import { CanvasContext } from "../context/CanvasContext";
import { fabric } from "fabric";
import * as Y from "yjs";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

export default function useExCanvasEngine(roomId) {
  const { canvas, setCanvas, nodes, setNodes } = useContext(CanvasContext);
  const undoStack = useRef([]);
  const redoStack = useRef([]);
  const ydocRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (canvas) return;

    // --- Init Fabric ---
    const c = new fabric.Canvas("canvas", {
      width: window.innerWidth - 300,
      height: window.innerHeight - 50,
      selection: true,
      preserveObjectStacking: true
    });
    setCanvas(c);

    // --- Init Yjs + Socket.IO ---
    const ydoc = new Y.Doc();
    ydocRef.current = ydoc;
    const socket = io("http://localhost:5000");
    socketRef.current = socket;
    socket.emit("join-room", roomId);

    socket.on("sync", (updateBuf) => {
      Y.applyUpdate(ydoc, updateBuf);
      const json = ydoc.toJSON();
      c.loadFromJSON(json, c.renderAll.bind(c));
      setNodes([...c.getObjects()]);
    });

    // --- Node history tracking ---
    const pushUndo = () => {
      const json = JSON.stringify(c.toJSON());
      undoStack.current.push(json);
      redoStack.current = []; // clear redo
    };

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
      const delta = opt.e.deltaY;
      let zoom = c.getZoom();
      zoom *= 0.999 ** delta;
      if (zoom > 5) zoom = 5;
      if (zoom < 0.2) zoom = 0.2;
      c.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
    });

    let isDragging = false;
    let lastPosX, lastPosY;

    c.on("mouse:down", (opt) => {
      const evt = opt.e;
      if (evt.altKey) {
        isDragging = true;
        lastPosX = evt.clientX;
        lastPosY = evt.clientY;
      }
    });
    c.on("mouse:move", (opt) => {
      if (isDragging) {
        const e = opt.e;
        const vpt = c.viewportTransform;
        vpt[4] += e.clientX - lastPosX;
        vpt[5] += e.clientY - lastPosY;
        c.requestRenderAll();
        lastPosX = e.clientX;
        lastPosY = e.clientY;
      }
    });
    c.on("mouse:up", () => { isDragging = false; });

    // --- Multi-select ---
    c.selection = true;
    c.on("selection:created", () => {});
    c.on("selection:updated", () => {});
    c.on("selection:cleared", () => {});

    // --- Undo/Redo ---
    const pushYjs = () => {
      const updateBuf = Y.encodeStateAsUpdate(ydoc);
      socket.emit("update", updateBuf);
    };

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

    setCanvas(c);

    return () => socket.disconnect();
  }, []);
}

