// src/components/GanttView.jsx
import React, { useState } from "react";
import { DndContext, PointerSensor, useSensor, useSensors, closestCenter } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export default function GanttView({ tasks }) {
  const [taskList, setTaskList] = useState(tasks);
  const totalDays = 14;

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = taskList.findIndex((t) => t.id === active.id);
    const newIndex = taskList.findIndex((t) => t.id === over.id);
    setTaskList(arrayMove(taskList, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="overflow-x-auto bg-gray-50 p-4 rounded shadow-sm">
        <div className="flex border-b">
          <div className="w-48 p-2 font-bold">Task</div>
          {[...Array(totalDays)].map((_, i) => (
            <div key={i} className="w-24 p-2 text-center border-l border-gray-200">
              Day {i + 1}
            </div>
          ))}
        </div>
        {taskList.map((task) => (
          <div key={task.id} id={task.id} className="flex border-b items-center">
            <div className="w-48 p-2">{task.title}</div>
            {[...Array(totalDays)].map((_, i) => {
              const active = i >= task.startDay && i <= task.endDay;
              return <div key={i} className={`w-24 h-6 border-l ${active ? "bg-blue-400 rounded" : ""}`}></div>;
            })}
          </div>
        ))}
      </div>
    </DndContext>
  );
}

/*
// src/components/GanttView.jsx
import React from "react";

export default function GanttView({ tasks }) {
  const totalDays = 14;

  return (
    <div className="overflow-x-auto bg-gray-50 p-4 rounded shadow-sm">
      <div className="flex border-b">
        <div className="w-48 p-2 font-bold">Task</div>
        {[...Array(totalDays)].map((_, i) => (
          <div key={i} className="w-24 p-2 text-center border-l border-gray-200">Day {i+1}</div>
        ))}
      </div>

      {tasks.map((task) => (
        <div key={task.id} className="flex border-b items-center">
          <div className="w-48 p-2">{task.title}</div>
          {[...Array(totalDays)].map((_, i) => {
            const active = i >= task.startDay && i <= task.endDay;
            return <div key={i} className={`w-24 h-6 border-l ${active ? "bg-blue-400 rounded" : ""}`}></div>
          })}
        </div>
      ))}
    </div>
  );
}
*/
