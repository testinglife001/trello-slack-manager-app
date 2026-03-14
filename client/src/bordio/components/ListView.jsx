// src/components/ListView.jsx
import React from "react";
import TaskItem from "./TaskItem";

export default function ListView({ tasks }) {
  return (
    <div className="space-y-2">
      {tasks.map(task => <TaskItem key={task.id} task={task} />)}
    </div>
  );
}