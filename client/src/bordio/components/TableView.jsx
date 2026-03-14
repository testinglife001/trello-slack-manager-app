// src/components/TableView.jsx
import React from "react";

export default function TableView({ tasks }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow-md rounded">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2">Task</th>
            <th className="p-2">Status</th>
            <th className="p-2">Type</th>
            <th className="p-2">Due Date</th>
            <th className="p-2">Responsible</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{task.title}</td>
              <td className="p-2">{task.status}</td>
              <td className="p-2">{task.type}</td>
              <td className="p-2">{task.due}</td>
              <td className="p-2">{task.assignee}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
