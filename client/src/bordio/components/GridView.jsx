// src/components/GridView.jsx
import React from "react";
import TaskItem from "./TaskItem";

export default function GridView({ tasks }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {tasks.map(task => <TaskItem key={task.id} task={task} />)}
    </div>
  );
}