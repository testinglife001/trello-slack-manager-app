// src/components/TaskItem.jsx
// src/components/TaskItem.jsx
import React from "react";
import { GripVertical } from "lucide-react";

export default function TaskItem({ task, dragHandle }) {
  return (
    <div className="bg-white p-2 rounded shadow-sm flex items-center justify-between">
      <span>{task.title}</span>

      {dragHandle && (
        <GripVertical
          size={18}
          className="ml-2 cursor-grab text-gray-400 hover:text-gray-600"
        />
      )}
    </div>
  );
}
