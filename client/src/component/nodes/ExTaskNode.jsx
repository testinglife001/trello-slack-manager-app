// nodes/ExTaskNode.jsx
import React, { useState } from "react";

export default function ExTaskNode({ meta }) {
  const [task, setTask] = useState(meta);

  return (
    <div
      style={{
        background: "#fff8c4",
        borderRadius: 8,
        padding: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        width: "100%",
        height: "100%",
      }}
    >
      <input
        value={task.title}
        onChange={(e) => setTask({ ...task, title: e.target.value })}
        style={{ width: "100%", border: "none", fontWeight: "bold" }}
      />

      <textarea
        value={task.description}
        onChange={(e) => setTask({ ...task, description: e.target.value })}
        style={{ width: "100%", border: "none" }}
      />
    </div>
  );
}
