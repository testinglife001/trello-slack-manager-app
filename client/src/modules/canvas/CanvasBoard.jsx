// modules/canvas/CanvasBoard.jsx
// modules/canvas/CanvasBoard.jsx
// modules/canvas/CanvasBoard.jsx
// modules/canvas/CanvasBoard.jsx
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";

import Toolbar from "./Toolbar";
import NodeRenderer from "./NodeRenderer";
import CursorLayer from "./CursorLayer";
import CommentPanel from "./CommentPanel";
import CanvasHeader from "./CanvasHeader";

import useCanvasSocket from "./useCanvasSocket";
import useCursorBroadcast from "./useCursorBroadcast";

import { applyOperation } from "./crdt/reducer";
import createClock from "./crdt/versionClock";
import createQueue from "../chat/opQueue";
import { transform } from "../chat/transform";

import "./canvas-board.css";

export default function CanvasBoard() {
  const { channelId } = useParams();
  const socket = useSocket();

  const [doc, setDoc] = useState({ nodes: [] });
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [zoom, setZoom] = useState(1);
  // selections: { [userId]: { nodeId, name } }
  const [selections, setSelections] = useState({});

  const history = useRef([]);
  const redoStack = useRef([]);
  const clock = useRef(createClock(0));
  const queue = useRef(createQueue());
  const boardRef = useRef();

  // ── Load board ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!channelId) return;
    request(`/canvas/${channelId}`)
      .then(d => {
        setDoc(d?.content || { nodes: [] });
        clock.current.set(d?.version || 0);
      })
      .catch(() => {});
  }, [channelId]);

  // ── Load comments for active node ──────────────────────────────────────────
  useEffect(() => {
    if (!activeNode) return;
    request(`/canvas-comments/${channelId}/${activeNode}`)
      .then(setComments)
      .catch(() => setComments([]));
  }, [activeNode, channelId]);

  // ── Realtime comment events ─────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const onNew = c => {
      if (c.nodeId !== activeNode) return;
      setComments(p => [c, ...p]);
    };

    const onResolved = c => {
      setComments(p => p.map(x => x._id === c._id ? c : x));
    };

    socket.on("canvas:comment:new", onNew);
    socket.on("canvas:comment:resolved", onResolved);

    return () => {
      socket.off("canvas:comment:new", onNew);
      socket.off("canvas:comment:resolved", onResolved);
    };
  }, [socket, activeNode]);

  // ── Receive remote ops ─────────────────────────────────────────────────────
  const receiveOp = useCallback(incoming => {
    if (incoming.version <= clock.current.get()) return;

    clock.current.set(incoming.version);

    let op = incoming;
    for (const local of queue.current.all()) {
      if (!op) break;
      op = transform(op, local);
    }
    if (!op) return;

    setDoc(prev => applyOperation(prev, op));
    queue.current.remove(op.id);
  }, []);

  useCanvasSocket({ channelId, receiveOp, setUsers, setSelections });
  useCursorBroadcast(channelId);

  // ── Send local op ───────────────────────────────────────────────────────────
  const sendOperation = (type, target, payload) => {
    if (!socket) return;

    const op = {
      id: crypto.randomUUID(),
      actor: socket.id,
      type,
      target,
      payload,
      version: clock.current.tick(),
    };

    // Deep clone so undo restores exact previous state
    history.current.push(JSON.parse(JSON.stringify(doc)));
    redoStack.current = [];

    setDoc(prev => applyOperation(prev, op));
    queue.current.add(op);

    socket.emit("canvas:op", { channel: channelId, op });
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const spawn = () => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 100, y: 100 };
    return { x: rect.width / 2 / zoom, y: rect.height / 2 / zoom };
  };

  const add = (type, data) => {
    const p = spawn();
    sendOperation("node.add", null, {
      id: crypto.randomUUID(),
      type,
      ...p,
      width: 260,
      height: 200,
      order: Date.now(),
      data,
    });
  };

  const updateNode = (id, changes) => {
    if (changes.data)         sendOperation("node.update", id, changes.data);
    else if (changes.width || changes.height) sendOperation("node.resize", id, changes);
    else                      sendOperation("node.move", id, changes);
  };
  
  const deleteNode = (id) => {
    sendOperation("node.delete", id, null);
  };

  const bringFront = id => updateNode(id, { order: Date.now() });

  // ── File / drop handling ────────────────────────────────────────────────────
  const handleFiles = files => {
    [...files].forEach(file => {
      const url = URL.createObjectURL(file);
      if (file.type.startsWith("image"))      add("image",    { url });
      else if (file.type.startsWith("video")) add("video",    { url });
      else if (file.type.includes("pdf"))     add("pdf",      { url });
      else                                    add("document", { name: file.name });
    });
  };

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const onDrop = e => { e.preventDefault(); if (e.dataTransfer.files) handleFiles(e.dataTransfer.files); };
    const onDragOver = e => e.preventDefault();
    el.addEventListener("dragover", onDragOver);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("drop", onDrop);
    };
  }, [zoom]);

  // ── Undo / Redo ─────────────────────────────────────────────────────────────
  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    redoStack.current.push(JSON.parse(JSON.stringify(doc)));
    setDoc(prev);
  };

  const redo = () => {
    const next = redoStack.current.pop();
    if (!next) return;
    history.current.push(JSON.parse(JSON.stringify(doc)));
    setDoc(next);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="canvas-wrapper">
      <CanvasHeader users={users} title="Canvas" />

      <Toolbar
        addNote={() => add("note", { text: "New note" })}
        addText={() => add("text", { text: "Text" })}
        upload={handleFiles}
        zoomIn={() => setZoom(z => Math.min(3, z + 0.1))}
        zoomOut={() => setZoom(z => Math.max(0.2, z - 0.1))}
        undo={undo}
        redo={redo}
      />

      <div className="canvas-board" ref={boardRef}>
        <div
          className="canvas-inner"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
        >
          {(doc?.nodes || [])
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(n => (
              <NodeRenderer
                key={n.id}
                node={n}
                zoom={zoom}
                update={updateNode}
                deleteNode={deleteNode}
                bringFront={bringFront}
                onSelect={setActiveNode}
                isActive={activeNode === n.id}
                selectedBy={
                  Object.entries(selections).find(([, v]) => v.nodeId === n.id)?.[1]?.name
                }
                commentCount={
                  comments.filter(c => c.nodeId === n.id && !c.resolved).length
                }
              />
            ))}

          <CursorLayer users={users} />
        </div>
      </div>

      {activeNode && (
        <CommentPanel
          nodeId={activeNode}
          channelId={channelId}
          comments={comments}
          close={() => setActiveNode(null)}
        />
      )}
    </div>
  );
}






/*
// ✅ 1. REWRITE CanvasBoard.jsx (core)
// ✅ 1️⃣ CanvasBoard.jsx (FULL REWRITE)
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";

import Toolbar from "./Toolbar";
import NodeRenderer from "./NodeRenderer";
import CursorLayer from "./CursorLayer";
import CommentPanel from "./CommentPanel";
import CanvasHeader from "./CanvasHeader";

import useCanvasSocket from "./useCanvasSocket";
import useCursorBroadcast from "./useCursorBroadcast";

import { applyOperation } from "./crdt/reducer";
import createClock from "./crdt/versionClock";
import createQueue from "../chat/opQueue";
import { transform } from "../chat/transform";

import "./canvas-boards.css";

export default function CanvasBoard() {
  const { channelId } = useParams();
  const socket = useSocket();

  const [doc, setDoc] = useState({ nodes: [] });
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [zoom, setZoom] = useState(1);

  const history = useRef([]);
  const redoStack = useRef([]);

  const clock = useRef(createClock(0));
  const queue = useRef(createQueue());

  const boardRef = useRef();

  // ================= LOAD
  useEffect(() => {
    if (!channelId) return;

    request(`/canvas/${channelId}`)
      .then(d => {
        setDoc(d?.content || { nodes: [] });
        clock.current.set(d?.version || 0);
      })
      .catch(() => {});
  }, [channelId]);

  // ================= COMMENTS
  useEffect(() => {
    request(`/canvas-comments/${channelId}`)
      .then(setComments)
      .catch(() => setComments([]));
  }, [channelId]);

  // ================= RECEIVE
  const receiveOp = useCallback((incoming) => {
    if (incoming.version <= clock.current.get()) return;

    clock.current.set(incoming.version);

    let op = incoming;
    for (const local of queue.current.all()) {
      if (!op) break;
      op = transform(op, local);
    }
    if (!op) return;

    setDoc(prev => applyOperation(prev, op));
    queue.current.remove(op.id);
  }, []);

  useCanvasSocket({ channelId, receiveOp, setUsers });
  useCursorBroadcast(channelId);

  // ================= SEND
  const sendOperation = (type, target, payload) => {
    const op = {
      id: crypto.randomUUID(),
      actor: socket.id,
      type,
      target,
      payload,
      version: clock.current.tick()
    };

    // ✅ FIX → deep clone
    history.current.push(JSON.parse(JSON.stringify(doc)));
    redoStack.current = [];

    setDoc(prev => applyOperation(prev, op));
    queue.current.add(op);

    socket.emit("canvas:op", { channel: channelId, op });
  };

  // ================= SPAWN
  const spawn = () => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 100, y: 100 };

    return {
      x: rect.width / 2 / zoom,
      y: rect.height / 2 / zoom
    };
  };

  const add = (type, data) => {
    const p = spawn();

    sendOperation("node.add", null, {
      id: crypto.randomUUID(),
      type,
      ...p,
      width: 260,
      height: 200,
      order: Date.now(),
      data
    });
  };


  // ================= UPLOAD
  const handleFiles = (files) => {
    console.log("HANDLE FILES", files);
    console.log("RECEIVED:", files);
    [...files].forEach(file => {
      const url = URL.createObjectURL(file);

      if (file.type.startsWith("image")) add("image", { url });
      else if (file.type.startsWith("video")) add("video", { url });
      else if (file.type.includes("pdf")) add("pdf", { url });
      else add("document", { name: file.name });
    });
  };

  useEffect(() => {
    console.log("DOC:", doc.nodes.length);
  }, [doc]);


  // drag from desktop
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const drop = e => {
      e.preventDefault();
      if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
    };

    el.addEventListener("dragover", e => e.preventDefault());
    el.addEventListener("drop", drop);

    return () => el.removeEventListener("drop", drop);
  }, [zoom]);

  // ================= UNDO REDO
  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    redoStack.current.push(doc);
    setDoc(prev);
  };

  const redo = () => {
    const next = redoStack.current.pop();
    if (!next) return;
    history.current.push(doc);
    setDoc(next);
  };


  const updateNode = (id, changes) => {
    sendOperation("node.move", id, changes);
  };
  

  const updateNode = (id, changes) => {
    if (changes.data) {
      sendOperation("node.update", id, changes.data);
    } else if (changes.width || changes.height) {
      sendOperation("node.resize", id, changes);
    } else {
      sendOperation("node.move", id, changes);
    }
  };


  const bringFront = id =>
    updateNode(id, { order: Date.now() });

  // ================= RENDER
  return (
    <div className="canvas-wrapper">
      <CanvasHeader users={users} title="Canvas" />

      <Toolbar
        addNote={() => add("note", { text: "New note" })}
        addText={() => add("text", { text: "Text" })}
        upload={handleFiles}
        zoomIn={() => setZoom(z => z + 0.1)}
        zoomOut={() => setZoom(z => Math.max(0.2, z - 0.1))}
        undo={undo}
        redo={redo}
      />

      <div className="canvas-board" ref={boardRef}>
        <div
          className="canvas-inner"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
        >
          {(doc?.nodes || []).map(n => (
            <NodeRenderer
              key={n.id}
              node={n}
              zoom={zoom}     // ✅ important
              update={updateNode}
              bringFront={bringFront}
              onSelect={setActiveNode}
              commentCount={comments.filter(c => c.nodeId === n.id).length}
            />
          ))}

          <CursorLayer users={users} />
        </div>
      </div>

      {activeNode && (
        <CommentPanel
          nodeId={activeNode}
          channelId={channelId}
          comments={comments}
          close={() => setActiveNode(null)}
        />
      )}
    </div>
  );
}
*/




/*
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

import Toolbar from "./Toolbar";
import NodeRenderer from "./NodeRenderer";
import CursorLayer from "./CursorLayer";
import CommentPanel from "./CommentPanel";
import CanvasHeader from "./CanvasHeader";

import useCanvasSocket from "./useCanvasSocket";
import useCursorBroadcast from "./useCursorBroadcast";

import { applyOperation } from "./crdt/reducer";
import createClock from "./crdt/versionClock";
import createQueue from "../chat/opQueue";
import { transform } from "../chat/transform";

import "./canvasboard.css";

export default function CanvasBoard() {
  const { channelId } = useParams();
  const socket = useSocket();
  const { user } = useAuth();

  const [doc, setDoc] = useState({ nodes: [] });
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [zoom, setZoom] = useState(1);

  const history = useRef([]);
  const redoStack = useRef([]);

  const clock = useRef(createClock(0));
  const queue = useRef(createQueue());

  // ✅ FIX 1 — board ref
  const boardRef = useRef();

  // ================= LOAD
  useEffect(() => {
    if (!channelId) return;

    request(`/canvas/${channelId}`)
      .then(data => {
        setDoc(data?.content || { nodes: [] });
        clock.current.set(data?.version || 0);
      })
      .catch(() => {});
  }, [channelId]);

  // ================= COMMENTS
  useEffect(() => {
    if (!channelId) return;

    request(`/canvas-comments/${channelId}`)
      .then(setComments)
      .catch(() => setComments([]));
  }, [channelId]);

  // ================= RECEIVE OPS
  const receiveOp = useCallback((incoming) => {
    if (incoming.version <= clock.current.get()) return;

    clock.current.set(incoming.version);

    let op = incoming;
    for (const local of queue.current.all()) {
      if (!op) break;
      op = transform(op, local);
    }
    if (!op) return;

    setDoc(prev => applyOperation(prev, op));
    queue.current.remove(op.id);
  }, []);

  useCanvasSocket({ channelId, receiveOp, setUsers });
  useCursorBroadcast(channelId);

  // ================= SEND OP
  const sendOperation = (type, target, payload) => {
    const op = {
      id: crypto.randomUUID(),
      actor: socket.id,
      type,
      target,
      payload,
      version: clock.current.tick()
    };

    history.current.push({ ...doc });
    redoStack.current = [];

    setDoc(prev => applyOperation(prev, op));
    queue.current.add(op);

    socket.emit("canvas:op", { channel: channelId, op });
  };

  // ================= ADD ITEMS
  // ✅ FIX 1 — SPAWN INSIDE BOARD
  const spawn = () => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 100, y: 100 };

    return {
      x: rect.width / 2 / zoom,
      y: rect.height / 2 / zoom
    };
  };

  const add = (type, data) => {
    const p = spawn();

    sendOperation("node.add", null, {
      id: crypto.randomUUID(),
      type,
      ...p,
      order: Date.now(), // ✅ FIX 3 — keep newest on top
      data
    });
  };

  // ================= UNDO / REDO
  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    redoStack.current.push(doc);
    setDoc(prev);
  };

  const redo = () => {
    const next = redoStack.current.pop();
    if (!next) return;
    history.current.push(doc);
    setDoc(next);
  };

  // ================= UPDATE NODE
  const updateNode = (id, changes) => {
    if (changes.data) sendOperation("node.update", id, changes.data);
    else sendOperation("node.move", id, changes);
  };

  // ================= RENDER
  return (
    <div className="canvas-wrapper">

      <CanvasHeader users={users} title="Canvas" />

      <div className="canvas-controls-row">
        <Toolbar
          addNote={() => add("note", { text: "New note" })}
          addText={() => add("text", { text: "Text" })}
          addImage={() => {
            const url = prompt("Image URL");
            if (url) add("image", { url });
          }}
          addVideo={() => {
            const url = prompt("Video URL");
            if (url) add("video", { url });
          }}
          addDoc={() => {
            const name = prompt("Document");
            if (name) add("document", { name });
          }}
          zoomIn={() => setZoom(z => z + 0.1)}
          zoomOut={() => setZoom(z => Math.max(0.2, z - 0.1))}
          undo={undo}
          redo={redo}
        />
      </div>


      <div className="canvas-board" ref={boardRef}>
        <div
          className="canvas-inner"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left"
          }}
        >
        
          {(doc?.nodes || []).map(n => (
            <NodeRenderer
              key={n.id}
              node={n}
              update={updateNode}
              onSelect={setActiveNode}
              commentCount={comments.filter(c => c.nodeId === n.id).length}
            />
          ))}

          <CursorLayer users={users} />
        </div>
      </div>

      {activeNode && (
        <CommentPanel
          nodeId={activeNode}
          channelId={channelId}
          comments={comments}
          close={() => setActiveNode(null)}
        />
      )}

    </div>
  );
}
*/








/*
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

import Toolbar from "./Toolbar";
import NodeRenderer from "./NodeRenderer";
import CursorLayer from "./CursorLayer";
import CommentPanel from "./CommentPanel";
import CanvasHeader from "./CanvasHeader";

import useCanvasSocket from "./useCanvasSocket";
import useCursorBroadcast from "./useCursorBroadcast";

import { applyOperation } from "./crdt/reducer";
import createClock from "./crdt/versionClock";
import createQueue from "../chat/opQueue";
import { transform } from "../chat/transform";

import "./canvasboard.css";

export default function CanvasBoard() {
  const { channelId } = useParams();
  const socket = useSocket();
  const { user } = useAuth();

  const [doc, setDoc] = useState({ nodes: [] });
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [activeNode, setActiveNode] = useState(null);

  const [zoom, setZoom] = useState(1);

  const history = useRef([]);
  const redoStack = useRef([]);

  const clock = useRef(createClock(0));
  const queue = useRef(createQueue());

  // ================= LOAD
  useEffect(() => {
    if (!channelId) return;

    request(`/canvas/${channelId}`)
      .then(data => {
        setDoc(data?.content || { nodes: [] });
        clock.current.set(data?.version || 0);
      })
      .catch(() => {});
  }, [channelId]);

  // ================= COMMENTS
  useEffect(() => {
    request(`/canvas-comments/${channelId}`)
      .then(setComments)
      .catch(() => setComments([]));
  }, [channelId]);

  // ================= RECEIVE OPS
  const receiveOp = useCallback((incoming) => {
    if (incoming.version <= clock.current.get()) return;
    clock.current.set(incoming.version);

    let op = incoming;
    for (const local of queue.current.all()) {
      if (!op) break;
      op = transform(op, local);
    }
    if (!op) return;

    setDoc(prev => applyOperation(prev, op));
    queue.current.remove(op.id);
  }, []);

  useCanvasSocket({ channelId, receiveOp, setUsers });
  useCursorBroadcast(channelId);

  // ================= SEND OP
  const sendOperation = (type, target, payload) => {
    const op = {
      id: crypto.randomUUID(),
      actor: socket.id,
      type,
      target,
      payload,
      version: clock.current.tick()
    };

    history.current.push({ ...doc });
    redoStack.current = [];

    setDoc(prev => applyOperation(prev, op));
    queue.current.add(op);

    socket.emit("canvas:op", { channel: channelId, op });
  };

  // ================= ADD ITEMS
  const spawn = () => ({
    x: window.innerWidth / 2 - 120,
    y: window.innerHeight / 2 - 120
  });

  const add = (type, data) => {
    const p = spawn();
    sendOperation("node.add", null, {
      id: crypto.randomUUID(),
      type,
      ...p,
      order: Date.now(),
      data
    });
  };

  // ================= UNDO / REDO
  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    redoStack.current.push(doc);
    setDoc(prev);
  };

  const redo = () => {
    const next = redoStack.current.pop();
    if (!next) return;
    history.current.push(doc);
    setDoc(next);
  };

  // ================= UPDATE NODE
  const updateNode = (id, changes) => {
    if (changes.data) sendOperation("node.update", id, changes.data);
    else sendOperation("node.move", id, changes);
  };

  return (
    <div className="canvas-wrapper">

      <CanvasHeader users={users} title="Canvas" />

      <div className="canvas-controls-row">
        <Toolbar
          addNote={() => add("note", { text: "New note" })}
          addText={() => add("text", { text: "Text" })}
          addImage={() => {
            const url = prompt("Image URL");
            if (url) add("image", { url });
          }}
          addVideo={() => {
            const url = prompt("Video URL");
            if (url) add("video", { url });
          }}
          addDoc={() => {
            const name = prompt("Document");
            if (name) add("document", { name });
          }}
          zoomIn={() => setZoom(z => z + 0.1)}
          zoomOut={() => setZoom(z => Math.max(0.2, z - 0.1))}
          undo={undo}
          redo={redo}
        />
      </div>

      <div className="canvas-board">
        <div
          className="canvas-inner"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
        >
          {doc.nodes.map(n => (
            <NodeRenderer
              key={n.id}
              node={n}
              update={updateNode}
              onSelect={setActiveNode}
              commentCount={comments.filter(c => c.nodeId === n.id).length}
            />
          ))}

          <CursorLayer users={users} />
        </div>
      </div>


      {activeNode && (
        <CommentPanel
          nodeId={activeNode}
          channelId={channelId}
          comments={comments}
          close={() => setActiveNode(null)}
        />
      )}

    </div>
  );
}
*/











/*
import { useEffect, useRef, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useAuth } from "../../context/AuthContext";

import Toolbar from "./Toolbar";
import NodeRenderer from "./NodeRenderer";
import CursorLayer from "./CursorLayer";
import CommentPanel from "./CommentPanel";

import useCanvasSocket from "./useCanvasSocket";
import useCursorBroadcast from "./useCursorBroadcast";

import { applyOperation } from "./crdt/reducer";
import createClock from "./crdt/versionClock";
import createQueue from "../chat/opQueue";
import { between } from "../chat/fractional";
import { transform } from "../chat/transform";
import "./canvasboard.css";
// import "./canvas-board.css";
// import "./canvas.css";
import VersionHistoryPanel from "./VersionHistoryPanel";

const DEFAULT_WIDTH = 420;

export default function CanvasBoard({
  onCollapse,
  onPopOut,
  onPip
}) {

  const { channelId } = useParams();
  const socket = useSocket();
  const { user } = useAuth();

  const [doc, setDoc] = useState(null);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [selections, setSelections] = useState({});
  const [activeNode, setActiveNode] = useState(null);

  const clock = useRef(createClock(0));
  const queue = useRef(createQueue());
  const saveTimer = useRef();

  // =============================
  // CAMERA
  // =============================
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });

  // =============================
  // INITIAL LOAD
  // =============================
  useEffect(() => {
    const load = async () => {
      try {
        const data = await request(`/canvas/${channelId}`);
        setDoc(data?.content || { nodes: [] });
        clock.current.set(data?.version || 0);
      } catch {
        setDoc({ nodes: [] });
        clock.current.set(0);
      }
    };

    if (channelId) load();
  }, [channelId]);

  // =============================
  // LOAD COMMENTS
  // =============================
  useEffect(() => {
    if (!channelId) return;

    request(`/canvas-comments/${channelId}`)
      .then(setComments)
      .catch(() => setComments([]));
  }, [channelId]);

  // =============================
  // AUTOSAVE SNAPSHOT
  // =============================
  useEffect(() => {
    if (!doc) return;

    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(() => {
      request(`/canvas/${channelId}`, {
        method: "PUT",
        body: JSON.stringify({
          content: doc,
          version: clock.current.get()
        })
      }).catch(() => {});
    }, 1200);

    return () => clearTimeout(saveTimer.current);
  }, [doc, channelId]);

  // =============================
  // RECEIVE CRDT
  // =============================
  const receiveOp = useCallback((incoming) => {
    if (incoming.version <= clock.current.get()) return;

    clock.current.set(incoming.version);

    let op = incoming;
    for (const local of queue.current.all()) {
      if (!op) break;
      op = transform(op, local);
    }
    if (!op) return;

    setDoc(prev => applyOperation(prev, op));
    queue.current.remove(op.id);

    const remaining = queue.current.all();
    if (remaining.length) {
      setDoc(prev => {
        let base = prev;
        remaining.forEach(l => base = applyOperation(base, l));
        return base;
      });
    }
  }, []);

  // single source of realtime truth
  useCanvasSocket({
    channelId,
    receiveOp,
    setUsers,
    setSelections
  });

  // broadcast cursor
  useCursorBroadcast(channelId);

  // =============================
  // COMMENT REALTIME
  // =============================
  useEffect(() => {
    if (!socket) return;

    const add = (c) => setComments(prev => [...prev, c]);

    socket.on("comment:new", add);
    return () => socket.off("comment:new", add);
  }, [socket]);

  // =============================
  // CREATE OP
  // =============================
  const sendOperation = (type, target, payload) => {
    const op = {
      id: crypto.randomUUID(),
      actor: socket.id,
      type,
      target,
      payload,
      version: clock.current.tick()
    };

    setDoc(prev => applyOperation(prev, op));
    queue.current.add(op);

    socket.emit("canvas:op", { channel: channelId, op });
  };

  useEffect(() => {
    if (!socket) return;

    const handler = (doc) => {
      setDoc(doc.content);
      clock.current.set(doc.version);
    };

    socket.on("canvas:restore", handler);
    return () => socket.off("canvas:restore", handler);
  }, [socket]);


  // =============================
  // NODE ACTIONS
  // =============================
  const addNote = () => {
    const nodes = doc?.nodes || [];
    const last = nodes[nodes.length - 1];

    sendOperation("node.add", null, {
      id: crypto.randomUUID(),
      type: "note",
      x: 200,
      y: 200,
      order: between(last?.order, null),
      data: { text: "New note" }
    });
  };

  const addText = () => {
    const nodes = doc?.nodes || [];
    const last = nodes[nodes.length - 1];

    sendOperation("node.add", null, {
      id: crypto.randomUUID(),
      type: "text",
      x: 240,
      y: 240,
      order: between(last?.order, null),
      data: { text: "Text" }
    });
  };

  const addImage = () => {
    const url = prompt("Image URL");
    if (!url) return;

    sendOperation("node.add", null, {
        id: crypto.randomUUID(),
        type: "image",
        x: 260,
        y: 260,
        order: between(doc.nodes.at(-1)?.order, null),
        data: { url }
    });
  };

  const addVideo = () => {
    const url = prompt("Video URL");
    if (!url) return;

    sendOperation("node.add", null, {
        id: crypto.randomUUID(),
        type: "video",
        x: 260,
        y: 260,
        order: between(doc.nodes.at(-1)?.order, null),
        data: { url }
    });
  };

  const addDoc = () => {
    const name = prompt("Document name");
    if (!name) return;

    sendOperation("node.add", null, {
        id: crypto.randomUUID(),
        type: "document",
        x: 260,
        y: 260,
        order: between(doc.nodes.at(-1)?.order, null),
        data: { name }
    });
  };

  const updateNode = (id, changes) => {
    if (changes.data) sendOperation("node.update", id, changes.data);
    else sendOperation("node.move", id, changes);
  };

  if (!doc) return null;

  // =============================
  // RENDER
  // =============================
  return (
    <div className="canvas-wrapper">
      
     

    
      <div className="canvas-controls">
      

        <Toolbar
          addNote={addNote}
          addText={addText}
          addImage={addImage}
          addVideo={addVideo}
          addDoc={addDoc}
        />
      </div>

      
 

      <div className="canvas-board">
        <div
          className="canvas-inner"
          style={{
            transform: `translate(${-camera.x}px, ${-camera.y}px) scale(${camera.scale})`,
            transformOrigin: "top left"
          }}
        >
          {(doc.nodes || []).map(n => {
            const selectedBy = Object.values(selections)
              .filter(s => s.nodeId === n.id);

            const commentCount = comments
              .filter(c => c.nodeId === n.id).length;

            return (
              <NodeRenderer
                key={n.id}
                node={n}
                update={updateNode}
                selectedBy={selectedBy}
                commentCount={commentCount}
                onSelect={(id) => {
                  socket.emit("selection:update", {
                    channel: channelId,
                    nodeId: id,
                    user: { id: user._id, name: user.name }
                  });
                  setActiveNode(id);
                }}
              />
            );
          })}

          <CursorLayer users={users} />

          {activeNode && (
            <CommentPanel
              nodeId={activeNode}
              channelId={channelId}
              comments={comments}
              close={() => setActiveNode(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}


function CanvasTopBar({ onCollapse, onPopOut, onPip }) {
  return (
    <div className="canvas-topbar">
      <button onClick={onCollapse}>Collapse</button>
      <button onClick={onPopOut}>Pop</button>
      <button onClick={onPip}>PiP</button>
    </div>
  );
}
*/




/*
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import Toolbar from "./Toolbar";
import NodeRenderer from "./NodeRenderer";
import CursorLayer from "./CursorLayer";
import useCanvasSocket from "./useCanvasSocket";
import useCursorBroadcast from "./useCursorBroadcast";
import { applyOperation } from "./crdt/reducer";
import createClock from "./crdt/versionClock";
import createQueue from "../chat/opQueue";
import "./canvas.css";
import { useRef } from "react";
import { between } from "../chat/fractional";
import { transform } from "../chat/transform";
import { useAuth } from "../../context/AuthContext";
import CommentPanel from "./CommentPanel";


export default function CanvasBoard() {
  const { channelId } = useParams();
  const socket = useSocket();

  const [doc, setDoc] = useState(null);
  const [users, setUsers] = useState([]);

  const clock = useRef(createClock(0));
  const queue = useRef(createQueue());

  const [camera, setCamera] = useState({
    x: 0,
    y: 0,
    scale: 1
  });

  const [selections, setSelections] = useState({});
  // const [selections, setSelections] = useState({});

  const [comments, setComments] = useState([]);

  const [activeNode, setActiveNode] = useState(null);
  const saveTimer = useRef();

  
  // =============================
  // UI STATE
  // =============================
  const [canvasWidth, setCanvasWidth] = useState(() =>
      Number(localStorage.getItem("canvasWidth")) || DEFAULT_WIDTH
  );

  const [collapsed, setCollapsed] = useState(false);
  const [pip, setPip] = useState(false);
  const { user } = useAuth();

  const dividerRef = useRef();

  // remember width
  useEffect(() => {
     localStorage.setItem("canvasWidth", canvasWidth);
  }, [canvasWidth]);

  // =============================
  // DRAG
  // =============================
  useEffect(() => {
    const divider = dividerRef.current;
    if (!divider) return;

    const move = (e) => {
    const w = window.innerWidth - e.clientX;
    if (w < 320) return;
    if (w > window.innerWidth - 300) return;
    setCanvasWidth(w);
    };

    const up = () => {
    window.removeEventListener("mousemove", move);
    window.removeEventListener("mouseup", up);
    };

    const down = () => {
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    };

    divider.addEventListener("mousedown", down);
    return () => divider.removeEventListener("mousedown", down);
  }, []);

  useEffect(() => {
    if (!doc) return;

    clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
        try {
        await request(`/canvas/${channelId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
            content: doc,
            version: clock.current.get()
            })
        });
        } catch (e) {
        console.error("autosave failed", e);
        }
    }, 1200);

    return () => clearTimeout(saveTimer.current);
  }, [doc, channelId]);

  // ONLY changed sections shown

  

  const receiveOp = (incoming) => {
    if (incoming.version <= clock.current.get()) return;

    clock.current.set(incoming.version);

    let op = incoming;
    for (const local of queue.current.all()) {
        if (!op) break;
        op = transform(op, local);
    }

    if (!op) return;

    setDoc(prev => applyOperation(prev, op));
    queue.current.remove(op.id);

    const remaining = queue.current.all();
    if (remaining.length) {
        setDoc(prev => {
        let base = prev;
        remaining.forEach(l => base = applyOperation(base, l));
        return base;
        });
    }
  };

  useCanvasSocket({
    channelId,
    receiveOp,
    setUsers,
    setSelections
  });



  // load initial
  useEffect(() => {
    const load = async () => {
        try {
            const data = await request(`/canvas/${channelId}`);

            if (!data) throw new Error();

            setDoc(data.content || { nodes: [] });
            clock.current.set(data.version || 0);
        } catch {
            // if server missing → still allow editing
            setDoc({ nodes: [] });
            clock.current.set(0);
        }
    };
    load();
  }, [channelId]);

  useEffect(() => {
    if (!channelId) return;

    request(`/canvas-comments/${channelId}`)
        .then(setComments)
        .catch(() => setComments([]));
  }, [channelId]);

  // =============================
  // RECEIVE OPS
  // =============================
  useEffect(() => {
    if (!socket) return;

    const receive = (incoming) => {
        if (incoming.version <= clock.current.get()) return;

        clock.current.set(incoming.version);

        // ===================================
        // TRANSFORM incoming vs pending
        // ===================================
        let op = incoming;

        for (const local of queue.current.all()) {
            if (!op) break;
            op = transform(op, local);
        }

        if (!op) return;

        // apply server op
        setDoc(prev => applyOperation(prev, op));

        // remove acked
        queue.current.remove(op.id);

        // ===================================
        // REBASE remaining local
        // ===================================
        const remaining = queue.current.all();

        if (remaining.length) {
            setDoc(prev => {
            let base = prev;
            remaining.forEach(l => {
                base = applyOperation(base, l);
            });
            return base;
            });
        }
    };


    socket.on("canvas:op", receive);
    socket.on("cursor:update", setUsers);

    return () => {
      socket.off("canvas:op", receive);
      socket.off("cursor:update", setUsers);
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    const add = (c) => {
        setComments(prev => [...prev, c]);
    };

    socket.on("comment:new", add);
    return () => socket.off("comment:new", add);
  }, [socket]);

  useCursorBroadcast(channelId);

  // useCursorBroadcast(channelId);

  // =============================
  // CREATE OP
  // =============================
  const sendOperation = (type, target, payload) => {
    const op = {
        id: crypto.randomUUID(),
        actor: socket.id,
        type,
        target,
        payload,
        version: clock.current.tick()
    };

    setDoc(prev => applyOperation(prev, op));
    queue.current.add(op);

    socket.emit("canvas:op", {
        channel: channelId,
        op
    });
  };


  // =============================
  // ADD
  // =============================
  // =============================
  // ADD
  // =============================
  const addNote = () => {
    const nodes = doc?.nodes || [];
    const last = nodes[nodes.length - 1];

    sendOperation("node.add", null, {
        id: crypto.randomUUID(),
        type: "note",
        x: 200,
        y: 200,
        order: between(last?.order, null),
        data: { text: "New note" }
    });
    };


  const updateNode = (id, changes) => {
    if (changes.data) {
        sendOperation("node.update", id, changes.data);
    } else {
        sendOperation("node.move", id, changes);
    }
  };



  // realtime
  useCanvasSocket({
    channelId,
    applyPatch: (patch) => {
      setDoc(prev => ({
        ...prev,
        content: patch.content,
        version: patch.version
      }));
    },
    setUsers
  });

  if (!doc) return null;

  // =============================
  // LOCAL UPDATE → PATCH
  // =============================
  
  const updateNode = (id, changes) => {
    const next = {
      ...doc,
      content: {
        ...doc.content,
        nodes: doc.content.nodes.map(n =>
          n.id === id ? { ...n, ...changes } : n
        )
      }
    };

    setDoc(next);

    socket.emit("canvas:patch", {
      channel: channelId,
      docId: doc._id,
      content: next.content,
      version: doc.version
    });
  };

  // =============================
  // ADD
  // =============================
  const addNote = () => {
    const node = {
      id: Date.now().toString(),
      type: "note",
      x: 200,
      y: 200,
      data: { text: "New note" }
    };

    updateNode("add", { newNode: node });
  };
  

  const addText = () => {
    const nodes = doc?.nodes || [];
    const last = nodes[nodes.length - 1];

    sendOperation("node.add", null, {
        id: crypto.randomUUID(),
        type: "text",
        x: 250,
        y: 250,
        order: between(last?.order, null),
        data: { text: "Text" }
    });
  };

  const addImage = () => {
    const url = prompt("Image URL");
    if (!url) return;

    sendOperation("node.add", null, {
        id: crypto.randomUUID(),
        type: "image",
        x: 260,
        y: 260,
        order: between(doc.nodes.at(-1)?.order, null),
        data: { url }
    });
  };

  const addVideo = () => {
    const url = prompt("Video URL");
    if (!url) return;

    sendOperation("node.add", null, {
        id: crypto.randomUUID(),
        type: "video",
        x: 260,
        y: 260,
        order: between(doc.nodes.at(-1)?.order, null),
        data: { url }
    });
  };

  const addDoc = () => {
    const name = prompt("Document name");
    if (!name) return;

    sendOperation("node.add", null, {
        id: crypto.randomUUID(),
        type: "document",
        x: 260,
        y: 260,
        order: between(doc.nodes.at(-1)?.order, null),
        data: { name }
    });
  };

  const onWheel = e => {
    e.preventDefault();

    setCamera(c => ({
        ...c,
        scale: Math.max(0.2, Math.min(2, c.scale - e.deltaY * 0.001))
    }));
  };

  const start = useRef(null);

  const down = e => start.current = { x: e.clientX, y: e.clientY };
  const move = e => {
    if (!start.current) return;

    setCamera(c => ({
      ...c,
      x: c.x - (e.clientX - start.current.x) / c.scale,
      y: c.y - (e.clientY - start.current.y) / c.scale
    }));

    start.current = { x: e.clientX, y: e.clientY };
  };
  const up = () => start.current = null;

  const selectedBy = Object.values(selections)
    .filter(s => s.nodeId === n.id);


  return (
    <div className="canvas-wrapper">
      <Toolbar addNote={addNote} addText={addText} />

    =      {!collapsed && !pip && (
        <div
          className="canvas-column"
          style={{ width: canvasWidth }}
        >
            <br/><br/><br/>
          <CanvasTopBar
            onCollapse={() => setCollapsed(true)}
            onPopOut={() =>
              window.open(
                window.location.href,
                "_blank",
                "width=1200,height=800"
              )
            }
            onPip={() => setPip(true)}
          />

       

        </div>
      )}
     
    


      {pip && (
        <div className="canvas-pip">
            <br/><br/><br/>
          <CanvasTopBar
            onCollapse={() => setCollapsed(true)}
            onPopOut={() =>
              window.open(
                window.location.href,
                "_blank",
                "width=1200,height=800"
              )
            }
            onPip={() => setPip(false)}
          />
           
        </div>
      )}
  
      
      <div className="canvas-board">
        <div
            className="canvas-inner"
            style={{
                transform: `translate(${-camera.x}px, ${-camera.y}px) scale(${camera.scale})`,
                transformOrigin: "top left"
            }}
        >

      
        {(doc.content?.nodes || []).map(n => (
       

        {(doc?.nodes || []).map(n => {
            const selectedBy = Object.values(selections)
                .filter(s => s.nodeId === n.id);

            const commentCount = comments.filter(c => c.nodeId === n.id).length;

            return (
                <NodeRenderer
                key={n.id}
                node={n}
                update={updateNode}
                selectedBy={selectedBy}
                commentCount={commentCount}
                onSelect={(id) => {
                    socket.emit("selection:update", {
                    channel: channelId,
                    nodeId: id,
                    user: { id: user._id, name: user.name }
                    });
                    setActiveNode(id);
                }}
                />
            );
        })}



        <CursorLayer users={users} />

        {activeNode && (
            <CommentPanel
                nodeId={activeNode}
                channelId={channelId}
                comments={comments}
                close={() => setActiveNode(null)}
            />
        )}


        </div>
      </div>
    </div>
  );
}



function CanvasTopBar({ onCollapse, onPopOut, onPip }) {
  return (
    <div className="canvas-topbar">
      <button onClick={onCollapse}>Collapse</button>
      <button onClick={onPopOut}>Pop-out</button>
      <button onClick={onPip}>PiP</button>
    </div>
  );
}-
 */

