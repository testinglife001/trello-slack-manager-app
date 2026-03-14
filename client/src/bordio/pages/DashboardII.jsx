// src/pages/DashboardII.jsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import TableView from "../components/TableView";
import KanbanView from "../components/KanbanView";
import CalendarView from "../components/CalendarView";
import GanttView from "../components/GanttView";
import CardView from "../components/CardView";
import { tasks } from "../data/tasks";

export default function DashboardII() {
  const [activeProject, setActiveProject] = useState("New Website");
  const [view, setView] = useState("table");

  const renderView = () => {
    switch (view) {
      case "table":
        return <TableView tasks={tasks} />;
      case "kanban":
        return <KanbanView tasks={tasks} />;
      case "calendar":
        return <CalendarView tasks={tasks} />;
      case "gantt":
        return <GanttView tasks={tasks} />;
      case "card":
        return <CardView tasks={tasks} />;
      default:
        return <TableView tasks={tasks} />;
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar activeProject={activeProject} setActiveProject={setActiveProject} />
      <div className="flex-1 p-4 bg-gray-50">
        <div className="flex justify-end space-x-2 mb-4">
          {["table", "kanban", "calendar", "gantt", "card"].map((v) => (
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