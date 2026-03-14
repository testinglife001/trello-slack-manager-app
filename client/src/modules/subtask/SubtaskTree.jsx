// modules/subtask/SubtaskTree.jsx
// 1️⃣ SubtaskTree.jsx (controller)
// modules/subtask/SubtaskTree.jsx
import { useEffect, useState, useCallback } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import SubtaskItem from "./SubtaskItem";
import "./SubtaskTree.css";

export default function SubtaskTree({ cardId }) {
  const socket = useSocket();
  const { projectId } = useProject();

  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");

  const done = items.filter(i => i.completed).length;
  const percent = items.length
    ? Math.round((done / items.length) * 100)
    : 0;


  // ================= LOAD
  const load = useCallback(() => {
    request(`/subtasks/card/${cardId}`)
      .then(data => {
        setItems(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setItems([]);
      });
  }, [cardId]);


  useEffect(() => {
    load();
  }, [load]);


  // ================= REALTIME
  useEffect(() => {
    if (!socket) return;
    socket.on("subtask:updated", load);
    return () => socket.off("subtask:updated", load);
  }, [socket, load]);

  // ================= CREATE ROOT
  const create = async () => {
    if (!title.trim()) return;

    await request("/subtasks", {
      method: "POST",
      body: JSON.stringify({
        title,
        card: cardId
      })
    });

    setTitle("");
    socket.emit("subtask:updated", { project: projectId });

  };

  

  // ================= BUILD TREE
  const buildTree = (parent = null) =>
    items
      .filter(i =>
        String(i.parentSubtask || null) === String(parent)
      )
      .sort((a, b) => (a.order || 0) - (b.order || 0));



  const roots = buildTree(null);

  // ================= RENDER
  return (
    <div className="subtasks">
      <h3>Subtasks</h3>

      <div className="progressbar">
        <div style={{ width: percent + "%" }} />
      </div>

      <div className="subtask-create">
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New subtask"
        />
        <Button onClick={create}>Add</Button>
      </div>

      <div className="subtask-tree">
        {roots.map(s => (
          <SubtaskItem
            key={s._id}
            item={s}
            all={items}
            buildTree={buildTree}
            cardId={cardId}
          />
        ))}
      </div>
    </div>

  );
}







/*
import { useEffect, useState, useCallback } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import SubtaskList from "./SubtaskList";
import "./SubtaskTree.css";

export default function SubtaskTree({ cardId }) {
  const socket = useSocket();
  const { projectId } = useProject();

  const [items, setItems] = useState([]);
  const [title, setTitle] = useState("");

  // =============================
  // LOAD
  // =============================
  const load = useCallback(async () => {
    try {
      const data = await request(`/subtasks/card/${cardId}`);
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    }
  }, [cardId]);

  useEffect(() => {
    load();
  }, [load]);

  // =============================
  // REALTIME
  // =============================
  useEffect(() => {
    if (!socket) return;
    socket.on("subtask:updated", load);
    return () => socket.off("subtask:updated", load);
  }, [socket, load]);

  // =============================
  // CREATE
  // =============================
  const create = async () => {
    if (!title.trim()) return;

    await request("/subtasks", {
      method: "POST",
      body: JSON.stringify({
        title,
        card: cardId
      })
    });

    setTitle("");
    socket.emit("subtask-update", { project: projectId });
  };

  // =============================
  // TOGGLE
  // =============================
  const toggle = async (s) => {
    await request(`/subtasks/${s._id}`, {
      method: "PUT",
      body: JSON.stringify({
        completed: !s.completed
      })
    });

    socket.emit("subtask-update", { project: projectId });
  };

  // =============================
  // RENDER
  // =============================
  return (
    <div className="subtasks">
      <h3>Subtasks</h3>

    
      <div className="subtask-create">
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="New subtask"
        />
        <Button onClick={create}>Add</Button>
      </div>

   
      <SubtaskList items={items} toggle={toggle} />
    </div>
  );
}
*/
