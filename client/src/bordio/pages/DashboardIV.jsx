// DashboardIV.jsx
import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import SecondarySidebar from "../components/SecondarySidebar";
import Topbar from "../components/Topbar";

import TableView from "../components/TableView";
import KanbanView from "../components/KanbanView";
import CalendarView from "../components/CalendarView";
import GanttView from "../components/GanttView";
import CardView from "../components/CardView";
import ListView from "../components/ListView";
import GridView from "../components/GridView";

import { tasks as initialTasks } from "../data/tasks";

// DnD Kit imports
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import CalendarViewI from "../components/CalendarViewI";
import GanttViewI from "../components/GanttViewI";

export default function DashboardIV() {
  const [activeProject, setActiveProject] = useState("New Website");
  const [view, setView] = useState("table");

  // State for tasks in different views
  const [kanbanTasks, setKanbanTasks] = useState(initialTasks);
  const [calendarTasks, setCalendarTasks] = useState(initialTasks);
  const [ganttTasks, setGanttTasks] = useState(initialTasks);

  const sensors = useSensors(useSensor(PointerSensor));

  // Render view component
  const renderView = () => {
    switch (view) {
      case "table":
        return <TableView tasks={initialTasks} />;

      case "kanban":
        return (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleKanbanDragEnd}>
            <KanbanView tasks={kanbanTasks} setTasks={setKanbanTasks} />
          </DndContext>
        );

      case "calendar":
        return (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCalendarDragEnd}>
            <CalendarView tasks={calendarTasks} setTasks={setCalendarTasks} />
          </DndContext>
        );

      case "my-calendar":
        return (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCalendarDragEnd}>
            <CalendarViewI tasks={calendarTasks} setTasks={setCalendarTasks} />
          </DndContext>
        );

      case "gantt":
        return (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGanttDragEnd}>
            <GanttView tasks={ganttTasks} setTasks={setGanttTasks} />
          </DndContext>
        );

       case "my-gantt":
        return (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGanttDragEnd}>
            <GanttViewI tasks={ganttTasks} setTasks={setGanttTasks} />
          </DndContext>
        );

      case "card":
        return <CardView tasks={initialTasks} />;

      case "list":
        return <ListView tasks={initialTasks} />;

      case "grid":
        return <GridView tasks={initialTasks} />;

      default:
        return <TableView tasks={initialTasks} />;
    }
  };

  // ----------- Drag Handlers -----------

  const handleKanbanDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const [fromCol, taskId] = active.id.split(":");
    const [toCol, toId] = over.id.split(":");

    if (fromCol === toCol) {
      // Reorder within the same column
      const oldIndex = kanbanTasks.findIndex((t) => t.id.toString() === taskId);
      const newIndex = kanbanTasks.findIndex((t) => t.id.toString() === toId);
      setKanbanTasks(arrayMove(kanbanTasks, oldIndex, newIndex));
    } else {
      // Move to another column
      setKanbanTasks((prev) =>
        prev.map((t) =>
          t.id.toString() === taskId ? { ...t, status: toCol } : t
        )
      );
    }
  };

  const handleCalendarDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const [fromDay, taskId] = active.id.split(":");
    const toDay = over.id;

    if (fromDay === toDay) return;

    setCalendarTasks((prev) =>
      prev.map((t) =>
        t.id.toString() === taskId ? { ...t, day: toDay } : t
      )
    );
  };

  const handleGanttDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = ganttTasks.findIndex((t) => t.id.toString() === active.id);
    const newIndex = ganttTasks.findIndex((t) => t.id.toString() === over.id);

    setGanttTasks(arrayMove(ganttTasks, oldIndex, newIndex));
  };

  // ----------- View Toggle Buttons -----------

  const views = ["table", "kanban", "calendar", "gantt", "card", "list", "grid"];

  return (
    <div className="flex h-screen">
      <Sidebar activeProject={activeProject} setActiveProject={setActiveProject} />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 p-4 overflow-auto">
            <div className="flex space-x-2 mb-4 flex-wrap">
              {views.map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1 rounded ${view === v ? "bg-blue-500 text-white" : "bg-white border"}`}
                >
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </button>
              ))}
            </div>
            {renderView()}
          </div>
          <SecondarySidebar items={["Details", "Comments", "Files", "History"]} />
        </div>
      </div>
    </div>
  );
}
