// TaskNode.jsx
import React, { useState } from "react";

export default function TaskNode({ meta, onChange }) {
  const [task, setTask] = useState(meta);

  const update = (k,v)=>{
    const next={...task,[k]:v};
    setTask(next);
    onChange(next);
  };

  return (
    <div className="task-card">
      <input
        value={task.title}
        onChange={e=>update("title",e.target.value)}
      />

      <textarea
        value={task.description}
        onChange={e=>update("description",e.target.value)}
      />

      <select
        value={task.status}
        onChange={e=>update("status",e.target.value)}
      >
        <option>todo</option>
        <option>doing</option>
        <option>done</option>
      </select>

      <input
        type="date"
        value={task.dueDate}
        onChange={e=>update("dueDate",e.target.value)}
      />
    </div>
  );
}
