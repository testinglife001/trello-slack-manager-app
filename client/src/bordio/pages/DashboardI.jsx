// src/bordio/pages/DashboardI.jsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TableView from "../components/TableView";
import KanbanView from "../components/KanbanView";
import { tasks } from "../data/tasks";

export default function DashboardI() {
  const [activeProject, setActiveProject] = useState("New Website");
  const [view, setView] = useState("table"); // table, kanban, calendar, gantt, card

  const renderView = () => {
    switch (view) {
      case "table":
        return <TableView tasks={tasks} />;
      case "kanban":
        return <KanbanView tasks={tasks} />;
      // Add more cases for CalendarView, GanttView, CardView, ListView
      default:
        return <TableView tasks={tasks} />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar activeProject={activeProject} setActiveProject={setActiveProject} />
      <div className="flex-1 p-4 bg-gray-50">
        <div className="flex justify-end space-x-2 mb-4">
          {["table", "kanban"].map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1 rounded ${
                view === v ? "bg-blue-500 text-white" : "bg-white border"
              }`}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        {renderView()}
      </div>
    </div>
  );
}