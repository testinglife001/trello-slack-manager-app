// src/components/SortableItem.jsx
// src/components/SortableItem.jsx
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskItem from "./TaskItem";

export function SortableItem({ id, task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    boxShadow: isDragging ? "0 4px 8px rgba(0,0,0,0.2)" : undefined,
    borderRadius: "0.5rem",
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="mb-2">
      <TaskItem task={task} dragHandle />
    </div>
  );
}