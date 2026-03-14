// src/components/CardView.jsx
import React from "react";
import TaskItem from "./TaskItem";

export default function CardView({ tasks }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <div key={task.id} className="bg-white shadow rounded p-4">
          <h3 className="font-bold text-lg mb-2">{task.title}</h3>
          <div className="text-sm text-gray-500 mb-2">{task.type}</div>
          <div className="text-sm text-gray-400 mb-2">Due: {task.due}</div>
          <div className="text-sm text-gray-400 mb-2">Assignee: {task.assignee}</div>
          <div className="flex space-x-2 mt-2">
            {task.tags?.map((tag, i) => (
              <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
/*
// src/components/CardView.jsx
import React from "react";
import TaskItem from "./TaskItem";

export default function CardView({ tasks }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map(task => (
        <div key={task.id} className="bg-white shadow rounded p-4">
          <h3 className="font-bold text-lg mb-2">{task.title}</h3>
          <div className="text-sm text-gray-500 mb-2">{task.type}</div>
          <div className="text-sm text-gray-400 mb-2">Due: {task.due}</div>
          <div className="text-sm text-gray-400 mb-2">Assignee: {task.assignee}</div>
        </div>
      ))}
    </div>
  );
}
*/
