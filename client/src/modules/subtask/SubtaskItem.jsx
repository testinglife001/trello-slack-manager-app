// modules/subtask/SubtaskItem.jsx
import { useState } from "react";
import { request } from "../../services/api";
import { useSocket } from "../../context/SocketContext";
import { useProject } from "../../context/ProjectContext";
import Avatar from "../../components/ui/Avatar";
import dayjs from "dayjs";
import SubtaskNotePanel from "../notes/SubtaskNotePanel";

export default function SubtaskItem({
  item,
  all,
  buildTree,
  cardId,
  depth = 0
}) {
  const socket = useSocket();
  const { projectId } = useProject();

  const [open, setOpen] = useState(true);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(item.title);

  const [showNotes, setShowNotes] = useState(false);


  const children = buildTree(item._id);

  // ================= TOGGLE
  const toggle = async () => {
    await request(`/subtasks/${item._id}`, {
      method: "PUT",
      body: JSON.stringify({ completed: !item.completed })
    });

    socket.emit("subtask:updated", { project: projectId });
  };


  // ================= RENAME
  const save = async () => {
    setEditing(false);

    await request(`/subtasks/${item._id}`, {
      method: "PUT",
      body: JSON.stringify({ title })
    });

    socket.emit("subtask:updated", { project: projectId });

  };

  // ================= DELETE
  const remove = async () => {
    await request(`/subtasks/${item._id}`, {
      method: "DELETE"
    });
    socket.emit("subtask:updated", { project: projectId });

  };

  // ================= ADD CHILD
  const addChild = async () => {
    await request("/subtasks", {
      method: "POST",
      body: JSON.stringify({
        title: "New subtask",
        card: cardId,
        parentSubtask: item._id
      })
    });

    socket.emit("subtask:updated", { project: projectId });

  };

  return (
    <div className="subtask-item" style={{ marginLeft: depth * 16 }}>
      <div className="subtask-row">
        {!!children.length && (
          <button onClick={() => setOpen(o => !o)}>
            {open ? "▾" : "▸"}
          </button>
        )}

        <input
          type="checkbox"
          checked={item.completed}
          onChange={toggle}
        />

        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={save}
          />
        ) : (
          <span
            className={item.completed ? "done" : ""}
            onDoubleClick={() => setEditing(true)}
            style={{color:'black'}}
          >
            {item.title}
          </span>
        )}

        <div className="subtask-actions">
          <button onClick={() => setShowNotes(s => !s)}>📝</button>
          <button onClick={addChild}>＋</button>
          <button onClick={remove}>🗑</button>
        </div>

        {item.dueDate && (
          <div className="due">
            {dayjs(item.dueDate).format("DD MMM")}
          </div>
        )}

        {!!item.assignees?.length && (
          <div className="avatars">
            {item.assignees.map(a => (
              <Avatar key={a._id} src={a.avatar} />
            ))}
          </div>
        )}

        {showNotes && (
          <SubtaskNotePanel
            subtaskId={item._id}
            onClose={() => setShowNotes(false)}
          />
        )}



      </div>

      {open && children.length > 0 && (
        <div>
          {children.map(c => (
            <SubtaskItem
              key={c._id}
              item={c}
              all={all}
              buildTree={buildTree}
              cardId={cardId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
