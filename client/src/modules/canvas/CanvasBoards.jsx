// // modules/canvas/CanvasBoards.jsx
// modules/canvas/CanvasBoards.jsx
// modules/canvas/CanvasBoards.jsx
import { useEffect, useRef, useState, useCallback, useMemo } from "react";
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

import "./canvas-boards.css";

export default function CanvasBoards() {
  const { channelId } = useParams();
  const socket = useSocket();
  const { user } = useAuth();

  const [doc, setDoc]             = useState({ nodes: [] });
  const [users, setUsers]         = useState([]);
  const [comments, setComments]   = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [zoom, setZoom]           = useState(1);
  const [selections, setSelections] = useState({});  // { [userId]: { nodeId, name } }

  const history   = useRef([]);
  const redoStack = useRef([]);
  const clock     = useRef(createClock(0));
  const queue     = useRef(createQueue());
  const boardRef  = useRef(null);

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

  // ── Load comments for the selected node ────────────────────────────────────
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

    const onResolved = c =>
      setComments(p => p.map(x => x._id === c._id ? c : x));

    socket.on("canvas:comment:new",      onNew);
    socket.on("canvas:comment:resolved", onResolved);

    return () => {
      socket.off("canvas:comment:new",      onNew);
      socket.off("canvas:comment:resolved", onResolved);
    };
  }, [socket, activeNode]);

  // ── Receive remote ops (OT-transformed) ────────────────────────────────────
  const receiveOp = useCallback(incoming => {
    // Discard stale ops
    if (incoming.version <= clock.current.get()) return;

    clock.current.set(incoming.version);

    // Operational transform against any locally-queued ops
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

  // ── Send a local op ─────────────────────────────────────────────────────────
  const sendOperation = useCallback((type, target, payload) => {
    // Socket may be null during reconnect
    if (!socket) return;

    const op = {
      id:      crypto.randomUUID(),
      actor:   socket.id,
      type,
      target,
      payload,
      version: clock.current.tick(),
    };

    // Deep clone — {…doc} is a shallow copy; nested node arrays share refs
    // and will be mutated by applyOperation, breaking undo
    history.current.push(JSON.parse(JSON.stringify(doc)));
    redoStack.current = [];

    setDoc(prev => applyOperation(prev, op));
    queue.current.add(op);
    socket.emit("canvas:op", { channel: channelId, op });
  }, [socket, channelId, doc]);

  // ── Spawn position — centre of the visible board area ──────────────────────
  const spawn = () => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return { x: 100, y: 100 };
    return {
      x: rect.width  / 2 / zoom,
      y: rect.height / 2 / zoom,
    };
  };

  // ── Add a new node ──────────────────────────────────────────────────────────
  const add = (type, data) => {
    const p = spawn();
    sendOperation("node.add", null, {
      id:     crypto.randomUUID(),
      type,
      ...p,
      width:  260,
      height: 200,
      order:  Date.now(),
      data,
    });
  };

  const sortedNodes = useMemo(
    () => [...(doc?.nodes || [])].sort((a, b) => (a.order || 0) - (b.order || 0)),
    [doc?.nodes]
  );

  const unresolvedCommentCountByNode = useMemo(() => {
    const map = new Map();
    for (const c of comments) {
      if (c?.resolved || !c?.nodeId) continue;
      map.set(c.nodeId, (map.get(c.nodeId) || 0) + 1);
    }
    return map;
  }, [comments]);

  // ── Update an existing node ─────────────────────────────────────────────────
  const updateNode = (id, changes) => {
    if (changes.data)                         sendOperation("node.update", id, changes.data);
    else if (changes.width || changes.height) sendOperation("node.resize", id, changes);
    else                                      sendOperation("node.move",   id, changes);
  };

  // ── Bring a node to the visual front ───────────────────────────────────────
  const bringFront = id => updateNode(id, { order: Date.now() });

  // ── File / drop handling ────────────────────────────────────────────────────
  const handleFiles = useCallback(files => {
    [...files].forEach(file => {
      const url = URL.createObjectURL(file);
      if      (file.type.startsWith("image")) add("image",    { url });
      else if (file.type.startsWith("video")) add("video",    { url });
      else if (file.type.includes("pdf"))     add("pdf",      { url });
      else                                    add("document", { name: file.name });
    });
  }, [add]);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    const onDragOver = e => e.preventDefault();
    const onDrop     = e => {
      e.preventDefault();
      if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
    };

    el.addEventListener("dragover", onDragOver);
    el.addEventListener("drop",     onDrop);

    return () => {
      el.removeEventListener("dragover", onDragOver);
      el.removeEventListener("drop",     onDrop);
    };
  }, [handleFiles]);

  // ── Undo ────────────────────────────────────────────────────────────────────
  const undo = () => {
    const prev = history.current.pop();
    if (!prev) return;
    redoStack.current.push(JSON.parse(JSON.stringify(doc)));
    setDoc(prev);
  };

  // ── Redo ────────────────────────────────────────────────────────────────────
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
        addNote ={() => add("note", { text: "New note" })}
        addText ={() => add("text", { text: "Text" })}
        upload  ={handleFiles}
        zoomIn  ={() => setZoom(z => Math.min(3, z + 0.1))}
        zoomOut ={() => setZoom(z => Math.max(0.2, z - 0.1))}
        undo    ={undo}
        redo    ={redo}
      />

      <div className="canvas-board" ref={boardRef}>
        <div
          className="canvas-inner"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
        >
          {sortedNodes.map(n => (
              <NodeRenderer
                key={n.id}
                node={n}
                zoom={zoom}
                update={updateNode}
                bringFront={bringFront}
                onSelect={setActiveNode}
                // Name of the remote user who has this node selected, if any
                selectedBy={
                  Object.entries(selections)
                    .find(([, v]) => v.nodeId === n.id)?.[1]?.name
                }
                commentCount={unresolvedCommentCountByNode.get(n.id) || 0}
              />
            ))}

          <CursorLayer users={users} />
        </div>
      </div>

      {activeNode && (
        <CommentPanel
          nodeId    ={activeNode}
          channelId ={channelId}
          comments  ={comments}
          close     ={() => setActiveNode(null)}
        />
      )}

    </div>
  );
}
