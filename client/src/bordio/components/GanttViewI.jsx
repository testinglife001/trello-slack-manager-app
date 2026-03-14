// src/components/GanttViewI.jsx
import React from "react";
import { SortableItem } from "./SortableItem";

export default function GanttViewI({ tasks }) {
  return (
    <div className="overflow-x-auto p-4 bg-gray-50 rounded shadow-sm">
      {tasks.map((task) => (
        <SortableItem key={task.id} id={task.id.toString()} task={task} />
      ))}
    </div>
  );
}